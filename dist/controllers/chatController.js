"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeWebpage = exports.createReply = void 0;
exports.getGroqChatCompletion = getGroqChatCompletion;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const multer_1 = __importDefault(require("multer"));
const cheerio = __importStar(require("cheerio"));
const openai_1 = __importDefault(require("openai"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const upload = (0, multer_1.default)();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    process.exit(1); // Exit if required environment variables are missing
}
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const createReply = async (req, res) => {
    try {
        const { message } = req.body;
        const chatCompletion = await getGroqChatCompletion(message);
        res.status(201).json({
            message: "Chat reply",
            chatCompletion
        });
    }
    catch (err) {
        console.error(`Error creating reply: ${err}`);
        res.status(500).json({ error: "Failed to create reply" });
    }
};
exports.createReply = createReply;
async function getGroqChatCompletion(message) {
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
function extractMeaningfulContent(html) {
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
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
        .trim();
}
async function validateContent(content) {
    var _a;
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
    const response = ((_a = completion.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || "{}";
    console.log("\n=== GPT Validation Response ===");
    console.log(response);
    return JSON.parse(response);
}
async function verifyJournalSubmission(content, journalName) {
    var _a;
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
    const response = ((_a = completion.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || "{}";
    console.log("\n=== GPT Verification Response ===");
    console.log(response);
    try {
        return JSON.parse(response);
    }
    catch (error) {
        console.error("Failed to parse GPT response:", error);
        console.error("Raw response:", response);
        throw new Error("Failed to parse journal verification response");
    }
}
const scrapeWebpage = async (req, res, next) => {
    try {
        const { journalLink, journalName, journalManualRequirements } = req.body;
        if (!journalLink || !journalName || !(journalManualRequirements === null || journalManualRequirements === void 0 ? void 0 : journalManualRequirements.length)) {
            res.status(400).json({
                error: "Journal link, name, and at least one requirement are required"
            });
            return;
        }
        const result = await axios_1.default.get(journalLink);
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
    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).json({
                error: "Failed to process journal",
                details: err instanceof Error ? err.message : 'Unknown error'
            });
        }
        console.error(`Error processing journal:`, err);
    }
};
exports.scrapeWebpage = scrapeWebpage;
