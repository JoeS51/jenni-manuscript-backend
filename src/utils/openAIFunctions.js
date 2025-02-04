const OpenAI = require("openai");
const { marked } = require("marked"); // Convert Markdown to HTML
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is correctly loaded
});

const model = "gpt-4o-mini";

/**
 * Validate the presence, completeness, relevance, and formatting of required sections
 * @param {string} manuscriptText - Extracted text from the uploaded manuscript
 * @param {string} journalType - Type of journal (IEEE, Nature, Lancet, etc.)
 * @param {string[]} requiredSections - List of sections required for the specified journal
 * @returns {Promise<string>} - Markdown formatted table with validation results
 */

async function validateSections(manuscriptText, journalType, requiredSections) {
    var _a, _b;

    const prompt = `
    The user has selected the journal type "${journalType}". The required sections are:
    ${requiredSections.join(", ")}.

    **Instructions:**
    Evaluate each required section based on the following criteria:
    - **Presence**: ✅ Present / ❌ Missing
    - **Completeness**: ✅ Complete / ⚠️ Needs More Detail / ❌ Missing
    - **Relevance**: ✅ Relevant / ⚠️ Somewhat Relevant / ❌ Not Relevant
    - **Formatting**: ✅ Properly Formatted / ❌ Formatting Issue

    **Return the response in Markdown table format** for structured readability.

    **Example Output Format:**
    \`\`\`markdown
    | Section      | Presence   | Completeness   | Relevance   | Formatting  | Notes |
    |-------------|------------|----------------|-------------|-------------|--------|
    | Abstract    | ✅ Present  | ⚠️ Needs More Detail | ✅ Relevant  | ❌ Formatting Issue | Abstract is too short; IEEE suggests 150-250 words. |
    | Methods     | ✅ Present  | ✅ Complete   | ✅ Relevant  | ✅ Properly Formatted  | Well-structured methodology section. |
    | Discussion  | ❌ Missing  | ❌ N/A  | ❌ N/A | ❌ N/A | No discussion section detected. Consider adding one for result interpretation. |
    \`\`\`

    Manuscript:
    ${manuscriptText}
    `;

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "user", content: prompt }],
        });

        let result = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content.trim();

        if (!result) {
            console.warn("OpenAI returned an empty response for validateSections.");
            result = "**Error: Could not process manuscript validation.**";
        }

        return result;
    } catch (error) {
        console.error("Error in validateSections:", error);
        return "**Error: AI validation failed. Please try again later.**";
    }
}

/**
 * Provide general feedback on manuscript quality based on journal type
 * @param {string} manuscriptText - Extracted text from the uploaded manuscript
 * @param {string} journalType - Type of journal (IEEE, Nature, Lancet, etc.)
 * @returns {Promise<string>} - AI-generated feedback
 */
async function getGeneralFeedback(manuscriptText, journalType) {
    var _a, _b;

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
        });

        let result = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content.trim();

        if (!result) {
            console.warn("OpenAI returned an empty response for getGeneralFeedback.");
            result = "**Error: Could not process general feedback.**";
        }

        return result;
    } catch (error) {
        console.error("Error in getGeneralFeedback:", error);
        return "**Error: AI feedback generation failed.**";
    }
}

/**
 * Converts Markdown output to HTML (for better email and PDF formatting)
 * @param {string} markdownText - AI output in Markdown format
 * @returns {string} - Converted HTML
 */
function convertMarkdownToHTML(markdownText) {
    if (!markdownText) {
        console.warn("🚨 convertMarkdownToHTML received empty input.");
        return "<p>**Error: No content available.**</p>";
    }

    try {
        // Ensure markdown is properly formatted before conversion
        const cleanedMarkdown = markdownText.replace(/```markdown|```/g, ""); // Remove triple backticks
        return marked.parse(cleanedMarkdown); // ✅ Converts Markdown to proper HTML
    } catch (error) {
        console.error("🚨 Error converting Markdown to HTML:", error);
        return "<p>**Error: Markdown parsing failed.**</p>";
    }
}

module.exports = { validateSections, getGeneralFeedback, convertMarkdownToHTML };
