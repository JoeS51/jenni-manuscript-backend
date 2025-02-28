import type { Request, Response, NextFunction } from 'express'
import Groq from "groq-sdk";
import dotenv from 'dotenv'
import axios from 'axios';
import { RequestHandler } from 'express';
import multer from 'multer';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const upload = multer();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    process.exit(1); // Exit if required environment variables are missing
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export const createReply: RequestHandler = async (req, res) => {
    try {
        const { message } = req.body;

        const chatCompletion = await getGroqChatCompletion(message);

        res.status(201).json({
            message: "Chat reply",
            chatCompletion
        })
    } catch (err) {
        console.error(`Error creating reply: ${err}`);
        res.status(500).json({ error: "Failed to create reply" });
    }
}

export async function getGroqChatCompletion(message: string) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: message ? message : "no response pls",
            },
        ],
        model: "llama3-8b-8192",
    });
}

interface ScrapeRequest {
    journalLink: string;
    journalName: string;
    journalManualRequirements: string[];
}

function extractMeaningfulContent(html: string): string {
    const $ = cheerio.load(html);

    // Remove common non-content elements
    $('script, style, nav, header, footer, iframe, .advertisement, .ads, .nav, .menu, .sidebar').remove();
    
    // Find main content areas (common patterns in websites)
    const mainContent = $('main, article, .content, .main-content, [role="main"]')
        .first()
        .text();

    if (mainContent) {
        return cleanText(mainContent);
    }

    // Fallback: get content from the body if no main content found
    const bodyContent = $('body').text();
    return cleanText(bodyContent);
}

function cleanText(text: string): string {
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
        .trim();
}

interface JournalMetadata {
    title: string;
    publisher?: string;
    scope: string[];
    general_context: string;
    submission_requirements: {
        mandatory: string[];
        optional: string[];
        editorial_policies: string[];
    };
    formatting_guidelines: {
        file_types: string[];
        font?: string;
        headings?: string;
        citations?: string;
        references?: string;
    };
}

interface JournalVerification {
    isValid: boolean;
    metadata: JournalMetadata;
    reason?: string;
}

async function validateContent(content: string): Promise<{
    isAppropriate: boolean;
    confidence: number;
    reason?: string;
}> {
    const prompt = `
        Analyze this content and determine if it's appropriate for inclusion in an academic journal database.
        Verify that:
        1. It's from a legitimate academic/scientific journal
        2. Contains scholarly/academic content
        3. Not spam, promotional, or inappropriate content
        4. Not a predatory journal

        Content: "${content.substring(0, 3000)}"
        
        Respond in JSON format:
        {
            "isAppropriate": boolean,
            "confidence": number (0-1),
            "reason": "detailed explanation of decision"
        }
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
    });

    const response = completion.choices[0].message?.content || "{}";
    console.log("\n=== GPT Validation Response ===");
    console.log(response);
    
    return JSON.parse(response);
}

async function verifyJournalSubmission(content: string, journalName: string): Promise<JournalVerification> {
    const prompt = `
        Analyze this journal submission and create a structured profile of the academic journal.
        Extract all available information about submission requirements and formatting guidelines.
        
        Journal Name: "${journalName}"
        Content: "${content.substring(0, 3000)}"
        
        Respond in this exact JSON format:
        {
            "isValid": boolean,
            "metadata": {
                "title": "official journal title",
                "publisher": "publishing organization",
                "scope": ["main research areas"],
                "general_context": "detailed description of the journal, its focus, and review process",
                "submission_requirements": {
                    "mandatory": ["required submission elements"],
                    "optional": ["optional submission elements"],
                    "editorial_policies": ["list of editorial policies"]
                },
                "formatting_guidelines": {
                    "file_types": ["accepted file formats"],
                    "font": "font requirements if specified",
                    "headings": "heading structure requirements",
                    "citations": "citation style",
                    "references": "reference format requirements"
                }
            },
            "reason": "explanation if invalid"
        }
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
    });

    const response = completion.choices[0].message?.content || "{}";
    console.log("\n=== GPT Verification Response ===");
    console.log(response);
    
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error("Failed to parse GPT response:", error);
        console.error("Raw response:", response);
        throw new Error("Failed to parse journal verification response");
    }
}

export const scrapeWebpage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { journalLink, journalName, journalManualRequirements } = req.body;

        if (!journalLink || !journalName || !journalManualRequirements?.length) {
            res.status(400).json({
                error: "Journal link, name, and at least one requirement are required"
            });
            return;
        }

        const result = await axios.get(journalLink);
        const htmlContent = result.data;
        const meaningfulContent = extractMeaningfulContent(htmlContent);

        const validation = await validateContent(meaningfulContent);
        if (!validation.isAppropriate) {
            res.status(400).json({
                error: "Content validation failed",
                reason: validation.reason,
                confidence: validation.confidence
            });
            return;
        }

        const verification = await verifyJournalSubmission(meaningfulContent, journalName);
        if (!verification.isValid) {
            res.status(400).json({
                error: "Journal verification failed",
                reason: verification.reason
            });
            return;
        }

        // Format the data for Supabase
        const formattedData = {
            name: verification.metadata.title,
            link: journalLink,
            publisher: verification.metadata.publisher,
            scope: Array.isArray(verification.metadata.scope) ? verification.metadata.scope : [],
            general_context: verification.metadata.general_context,
            submission_requirements: verification.metadata.submission_requirements,
            formatting_guidelines: verification.metadata.formatting_guidelines,
            manual_requirements: Array.isArray(journalManualRequirements) 
                ? journalManualRequirements 
                : [journalManualRequirements]
        };

        console.log("Formatted data for Supabase:", JSON.stringify(formattedData, null, 2));

        const { data, error } = await supabase
            .from('journals')
            .insert(formattedData)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                res.status(409).json({
                    error: "This journal has already been added",
                    details: "A journal with this link already exists in the database"
                });
                return;
            }
            throw error;
        }

        res.status(201).json({
            message: "Journal verified and stored successfully",
            data
        });
    } catch (err: unknown) {
        if (!res.headersSent) {
            res.status(500).json({
                error: "Failed to process journal",
                details: err instanceof Error ? err.message : 'Unknown error'
            });
        }
        console.error(`Error processing journal:`, err);
    }
};