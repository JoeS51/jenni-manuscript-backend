"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateManuscript = evaluateManuscript;
const OpenAI = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is correctly loaded
});
const model = "gpt-4o-mini";
// Ensure supported journal types are sustained here.
const journalRequirements = {
    "IEEE": ["Abstract", "Introduction", "Methods", "Results", "Discussion"],
    "Nature": ["Abstract", "Background", "Study Design", "Findings", "Conclusion"],
    "Lancet": ["Abstract", "Background", "Study Design", "Findings", "Conclusion"]
};
// Entry point for validation
async function evaluateManuscript(manuscriptText, journalType) {
    try {
        const [sectionValidation, generalFeedback] = await Promise.all([
            validateSections(manuscriptText, journalType),
            getGeneralFeedback(manuscriptText, journalType),
        ]);
        return {
            sectionValidation,
            generalFeedback,
        };
    }
    catch (error) {
        console.error("Error evaluating manuscript:", error);
        throw error;
    }
}
// Validate section feedback
async function validateSections(manuscriptText, journalType) {
    var _a, _b;
    const requiredSections = journalRequirements[journalType] || [];
    if (requiredSections.length === 0) {
        throw new Error(`No requirements defined for journal type: ${journalType}`);
    }
    const prompt = `
        The user has selected the journal type "${journalType}". The required sections for this type are:
        ${requiredSections.join(", ")}.
        Analyze the manuscript text below and confirm whether all required sections are present. If any section is missing or incomplete, provide specific feedback.
        Manuscript:
        ${manuscriptText}
    `;
    const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
    });
    return (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content.trim();
}
// Get general feedback on grammar, clarity, and overall quality
async function getGeneralFeedback(manuscriptText, journalType) {
    var _a, _b;
    let prompt = ""; // Ensure prompt is always initialized
    if (journalType === "IEEE") {
        prompt = `
        Please provide detailed feedback on the manuscript below for IEEE standards. Focus on grammar, spelling, clarity, and overall writing quality. Highlight any areas that need improvement or clarification for each section.
        Manuscript:
        ${manuscriptText}
        `;
    }
    else if (journalType === "Nature") {
        prompt = `
        Provide a critical review of the manuscript according to Nature journal standards. Address structure, clarity, grammar, and scientific accuracy. Suggest improvements where needed.
        Manuscript:
        ${manuscriptText}
        `;
    }
    else if (journalType === "Lancet") {
        prompt = `
        Provide a detailed review of the manuscript for Lancet standards. Ensure clarity, logical flow, grammar, and writing quality. Highlight strengths and areas for improvement.
        Manuscript:
        ${manuscriptText}
        `;
    }
    else {
        throw new Error(`Unsupported journal type: ${journalType}`);
    }
    const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
    });
    return (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content.trim();
}
