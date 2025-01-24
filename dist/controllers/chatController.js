"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReply = createReply;
exports.getGroqChatCompletion = getGroqChatCompletion;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
async function createReply(request, response) {
    try {
        const { message } = request.body;
        const chatCompletion = await getGroqChatCompletion(message);
        response.status(201).json({
            message: "Chat reply",
            chatCompletion
        });
    }
    catch (err) {
        console.error(`Error creating reply: ${err}`);
    }
}
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
