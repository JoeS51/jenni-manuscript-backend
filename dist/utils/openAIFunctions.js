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
const journalRequirements = {
    "Journal A": ["Abstract", "Introduction", "Methods", "Results", "Discussion"],
    "Journal B": ["Abstract", "Background", "Study Design", "Findings", "Conclusion"],
};
//entry point for validation
async function evaluateManuscript(manuscriptText, journalType) {
    try {
        const [sectionValidation, generalFeedback] = await Promise.all([
            validateSections(manuscriptText, journalType),
            getGeneralFeedback(manuscriptText),
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
    // Updated API call
    const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
    });
    return (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content.trim();
}
// Get general feedback on grammar, clarity, and overall quality
async function getGeneralFeedback(manuscriptText) {
    var _a, _b;
    const prompt = `
        Please provide detailed feedback on the manuscript below. Focus on grammar, spelling, clarity, and overall writing quality. Highlight any areas that need improvement or clarification for each section. 

        For example:
        - **Abstract**: The abstract effectively summarizes the main findings but contains a minor grammar issue in the first sentence ("The study were conducted" should be "The study was conducted"). Additionally, it lacks specific numerical results, which would improve its clarity.
        - **Introduction**: The introduction provides good background information but is overly verbose in the second paragraph. Consider removing redundant sentences like "This has been previously studied multiple times, as mentioned earlier."
        - **Methods**: The description of the experimental setup is clear but missing key details about the sample size and statistical methods used.
        
        Manuscript:
        ${manuscriptText}
    `;
    // Updated API call
    const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
    });
    return (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content.trim();
}
