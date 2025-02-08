const OpenAI = require("openai");
const { marked } = require("marked"); // Convert Markdown to HTML
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is correctly loaded
});

const model = "gpt-4o-mini";

/**
 * Provide general feedback on manuscript quality based on journal type
 * @param {string} manuscriptText - Extracted text from the uploaded manuscript
 * @param {string} journalType - Type of journal (IEEE, Nature, Lancet, etc.)
 * @returns {Promise<string>} - AI-generated feedback
 */
async function getGeneralFeedbackStreamed(manuscriptText, journalType, callback) {
    const prompts = {
        "IEEE": `
        Provide an **IEEE-standard** review of the manuscript below. Focus on:
        - **Clarity & Logical Flow**: Are arguments structured logically?
        - **Grammar & Spelling**: Identify any errors or awkward phrasing.
        - **Technical Precision**: Are methods/results explained rigorously?
        - **Improvements**: Suggest areas where writing or organization could be improved.

        Manuscript:
        ${manuscriptText}
        `,
        "Nature": `
        Review the manuscript for **Nature journal** standards. Address:
        - **Scientific Rigor**: Are findings well-supported?
        - **Clarity & Style**: Is the language accessible for an interdisciplinary audience?
        - **Logical Structure**: Does the paper flow well between sections?
        - **Improvements**: Highlight areas where the manuscript could be refined.

        Manuscript:
        ${manuscriptText}
        `,
        "Lancet": `
        Evaluate the manuscript for **Lancet journal** publication standards. Focus on:
        - **Medical Accuracy & Ethical Standards**
        - **Writing Clarity & Readability**
        - **Logical Flow of Argument**
        - **Areas for Refinement**

        Manuscript:
        ${manuscriptText}
        `
    };

    if (!prompts[journalType]) {
        throw new Error(`Unsupported journal type: ${journalType}`);
    }

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "user", content: prompts[journalType] }],
            stream: true
        });

        for await (const chunk of response) {
            const delta = chunk.choices[0].delta;
            if (delta.content) {
                callback("text", delta.content);
            }
        }
        callback("end");
    } catch (error) {
        console.error("Error in getGeneralFeedback:", error);
        return "**Error: AI feedback generation failed.**";
    }
}

module.exports = { getGeneralFeedbackStreamed };
