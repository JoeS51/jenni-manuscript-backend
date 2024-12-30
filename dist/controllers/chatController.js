"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function createReply(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { message } = request.body;
            const chatCompletion = yield getGroqChatCompletion(message);
            response.status(201).json({
                message: "Chat reply",
                chatCompletion
            });
        }
        catch (err) {
            console.error(`Error creating reply: ${err}`);
        }
    });
}
function getGroqChatCompletion(message) {
    return __awaiter(this, void 0, void 0, function* () {
        return groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: message ? message : "no response pls",
                },
            ],
            model: "llama3-8b-8192",
        });
    });
}
