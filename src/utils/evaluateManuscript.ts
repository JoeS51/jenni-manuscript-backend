import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

import { validateSections, getGeneralFeedback, convertMarkdownToHTML } from "./openAIFunctions";

// Define the structure of the evaluation result.
export interface EvaluationResult {
  sectionValidation: string;
  generalFeedback: string;
  htmlFormatted: {
    sectionValidation: string;
    generalFeedback: string;
  };
}

async function getJournalRequirements(journalName: string) {
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
export async function evaluateManuscript(
  manuscriptText: string,
  journalName: string
): Promise<EvaluationResult> {
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
      validateSections(manuscriptText, journalData),
      getGeneralFeedback(manuscriptText, journalData)
    ]);

    if (!sectionValidation || !generalFeedback) {
      throw new Error("Manuscript evaluation response is incomplete.");
    }

    return {
      sectionValidation,
      generalFeedback,
      htmlFormatted: {
        sectionValidation: convertMarkdownToHTML(sectionValidation),
        generalFeedback: convertMarkdownToHTML(generalFeedback),
      },
    };
  } catch (error) {
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

// Also export convertMarkdownToHTML if needed.
export { convertMarkdownToHTML };
