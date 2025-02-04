"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateManuscript = evaluateManuscript;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { validateSections, getGeneralFeedback } = require("./openAIFunctions");
// Supported journal sections
const journalRequirements = {
    "IEEE": ["Abstract", "Introduction", "Methods", "Results", "Discussion", "Conclusion"],
    "Nature": ["Abstract", "Background", "Study Design", "Findings", "Conclusion"],
    "Lancet": ["Abstract", "Background", "Study Design", "Findings", "Conclusion"]
};
// **Core Evaluation Function**
async function evaluateManuscript(manuscriptText, journalType) {
    try {
        if (!journalRequirements[journalType]) {
            throw new Error(`Unsupported journal type: ${journalType}`);
        }
        const [sectionValidation, generalFeedback] = await Promise.all([
            validateSections(manuscriptText, journalType, journalRequirements[journalType]),
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
