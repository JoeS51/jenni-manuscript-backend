"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMarkdownToHTML = void 0;
exports.evaluateManuscript = evaluateManuscript;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const openAIFunctions_1 = require("./openAIFunctions");
Object.defineProperty(exports, "convertMarkdownToHTML", { enumerable: true, get: function () { return openAIFunctions_1.convertMarkdownToHTML; } });
async function getJournalRequirements(journalName) {
    console.log("Searching for journal:", journalName);
    // First, let's see what journals we have
    const { data: allJournals } = await supabase
        .from('journals')
        .select('name');
    console.log("Available journals:", allJournals);
    const { data, error } = await supabase
        .from('journals')
        .select('*')
        .ilike('name', journalName)
        .single();
    if (error) {
        console.error("Supabase query error:", error);
        if (error.code === 'PGRST116') {
            const { data: similar } = await supabase
                .from('journals')
                .select('name')
                .ilike('name', `%${journalName}%`);
            console.log("Similar journal names:", similar);
        }
        throw new Error(`Failed to fetch journal requirements: ${error.message}`);
    }
    console.log("Found journal data:", data);
    return data;
}
/**
 * Evaluates a manuscript for compliance and provides AI-generated feedback.
 *
 * @param manuscriptText - The text extracted from the manuscript.
 * @param journalName - The name of the journal.
 * @returns An object containing structured feedback.
 */
async function evaluateManuscript(manuscriptText, journalName) {
    try {
        if (!journalName) {
            throw new Error("Journal name is required");
        }
        console.log("Received journal name:", journalName);
        console.log("Journal name type:", typeof journalName);
        console.log("Journal name length:", journalName.length);
        // Remove any extra whitespace
        journalName = journalName.trim();
        // Get journal requirements from Supabase
        const journalData = await getJournalRequirements(journalName);
        const [sectionValidation, generalFeedback] = await Promise.all([
            (0, openAIFunctions_1.validateSections)(manuscriptText, journalData),
            (0, openAIFunctions_1.getGeneralFeedback)(manuscriptText, journalData)
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
            sectionValidation: `**Error: ${error instanceof Error ? error.message : 'Evaluation failed'}**`,
            generalFeedback: "**Error: Evaluation failed.**",
            htmlFormatted: {
                sectionValidation: "<p>Error: Evaluation failed.</p>",
                generalFeedback: "<p>Error: Evaluation failed.</p>",
            },
        };
    }
}
