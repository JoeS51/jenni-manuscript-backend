import type { Request, Response } from 'express'
import Groq from "groq-sdk";
import dotenv from 'dotenv'

dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function createReply(
    request: Request,
    response: Response
) {
    try {
        const { message } = request.body;

        const chatCompletion = await getGroqChatCompletion(message);

        response.status(201).json({
            message: "Chat reply",
            chatCompletion
        })
    } catch (err) {
        console.error(`Error creating reply: ${err}`)
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