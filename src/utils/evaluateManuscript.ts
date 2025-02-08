import dotenv from "dotenv";
dotenv.config();


import { validateSections, /*getGeneralFeedback,*/ convertMarkdownToHTML } from "./openAIFunctions";
import { getGeneralFeedbackStreamed } from "./openAIStreaming";

// Define the structure of the evaluation result.
export interface EvaluationResult {
  sectionValidation: string;
  generalFeedback: string;
  htmlFormatted: {
    sectionValidation: string;
    generalFeedback: string;
  };
}

// Supported journal sections
const journalRequirements: Record<string, string[]> = {
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
export async function evaluateManuscript(
  manuscriptText: string,
  journalType: string,
  callback: (response: string, content: string) => void,
): Promise<EvaluationResult> {
  try {
    if (!journalRequirements[journalType]) {
      throw new Error(`Unsupported journal type: ${journalType}`);
    }


    const [sectionValidation, generalFeedback] = await Promise.all([
      validateSections(manuscriptText, journalType, journalRequirements[journalType]).catch((err: any) => {
        return "**Error: Section validation failed.**"; // Always returns a string
      }),
      getGeneralFeedbackStreamed(manuscriptText, journalType, callback).catch((err: any) => {
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
        sectionValidation: convertMarkdownToHTML(sectionValidation),
        generalFeedback: convertMarkdownToHTML(generalFeedback),
      },
    };
  } catch (error) {
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

// Also export convertMarkdownToHTML if needed.
export { convertMarkdownToHTML };
