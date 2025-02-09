"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMarkdownToHTML = void 0;
exports.evaluateManuscript = evaluateManuscript;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openAIFunctions_1 = require("./openAIFunctions");
Object.defineProperty(exports, "convertMarkdownToHTML", { enumerable: true, get: function () { return openAIFunctions_1.convertMarkdownToHTML; } });
// Supported journal sections
const journalRequirements = {
    IEEE: ["Abstract", "Introduction", "Methods", "Results", "Discussion", "Conclusion"],
    Nature: ["Abstract", "Background", "Study Design", "Findings", "Conclusion"],
    Lancet: ["Abstract", "Background", "Study Design", "Findings", "Conclusion"],
};
/**
 * Evaluates a manuscript for compliance and provides AI-generated feedback.
 *
 * @param manuscriptText - The text extracted from the manuscript.
 * @param journalType - The type of journal (IEEE, Nature, Lancet).
 * @returns An object containing structured feedback.
 */
async function evaluateManuscript(manuscriptText, journalType) {
    try {
        if (!journalRequirements[journalType]) {
            throw new Error(`Unsupported journal type: ${journalType}`);
        }
        const [sectionValidation, generalFeedback] = await Promise.all([
            (0, openAIFunctions_1.validateSections)(manuscriptText, journalType, journalRequirements[journalType]).catch((err) => {
                return "**Error: Section validation failed.**"; // Always returns a string
            }),
            (0, openAIFunctions_1.getGeneralFeedback)(manuscriptText, journalType).catch((err) => {
                return "**Error: Could not generate general feedback.**"; // Always returns a string
            }),
        ]);
        if (!sectionValidation || !generalFeedback) {
            throw new Error("Manuscript evaluation response is incomplete.");
        }
        return {
            sectionValidation,
            generalFeedback,
            htmlFormatted: {
                sectionValidation: (0, openAIFunctions_1.convertMarkdownToHTML)(sectionValidation),
                generalFeedback: (0, openAIFunctions_1.convertMarkdownToHTML)(generalFeedback),
            },
        };
    }
    catch (error) {
        return {
            sectionValidation: "**Error: Evaluation failed.**",
            generalFeedback: "**Error: Evaluation failed.**",
            htmlFormatted: {
                sectionValidation: "<p>Error: Evaluation failed.</p>",
                generalFeedback: "<p>Error: Evaluation failed.</p>",
            },
        };
    }
}
