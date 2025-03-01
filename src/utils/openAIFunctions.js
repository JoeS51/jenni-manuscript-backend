const OpenAI = require("openai");
const { marked } = require("marked"); // Convert Markdown to HTML
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is correctly loaded
});

const model = "gpt-4o-mini";

/**
 * Validate the presence, completeness, relevance, and formatting of required sections
 * @param {string} manuscriptText - Extracted text from the uploaded manuscript
 * @param {string} journalData - Journal data from Supabase
 * @returns {Promise<string>} - Markdown formatted table with validation results
 */

function truncateText(text, maxLength = 24000) {
    // Using a larger chunk for GPT-4's context window
    return text.length > maxLength ? text.substring(0, maxLength) + "... [truncated]" : text;
}

async function validateSections(manuscriptText, journalData) {
    const truncatedText = truncateText(manuscriptText);
    
    const prompt = `
    You are an expert academic referee evaluating this manuscript for ${journalData.name}.
    
    Journal Requirements:
    ${JSON.stringify(journalData.submission_requirements, null, 2)}
    
    Provide your evaluation in the following markdown format:

    # Manuscript Evaluation Summary
    
    ## Overall Scores
    | Section | Presence | Clarity (0-10) | Technical Depth (0-10) | Research Value (0-10) | Overall Score |
    |---------|----------|----------------|----------------------|-------------------|---------------|
    | Abstract | ✅/❌ | X | X | X | XX% |
    ... (for each section)
    
    ## Detailed Section Analysis
    
    ### [Section Name]
    #### Scores
    - **Clarity & Organization**: X/10
    - **Technical Depth**: X/10
    - **Research Contribution**: X/10
    
    #### Strengths
    - Point 1
    - Point 2
    
    #### Areas for Improvement
    - Issue 1
    - Issue 2
    
    #### Recommendations
    - Specific suggestion 1
    - Specific suggestion 2

    Manuscript (truncated if necessary):
    ${truncatedText}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4", // Using GPT-4 for better analysis
            messages: [{ role: "user", content: prompt }]
        });

        return completion.choices[0].message?.content.trim() || "**Error: Could not process manuscript validation.**";
    } catch (error) {
        console.error("Error in validateSections:", error);
        return "**Error: AI validation failed. Please try again later.**";
    }
}

/**
 * Provide general feedback on manuscript quality based on journal type
 * @param {string} manuscriptText - Extracted text from the uploaded manuscript
 * @param {string} journalData - Journal data from Supabase
 * @returns {Promise<string>} - AI-generated feedback
 */
async function getGeneralFeedback(manuscriptText, journalData) {
    const truncatedText = truncateText(manuscriptText);
    
    const prompt = `
    As an expert referee for ${journalData.name} (${journalData.publisher}), provide a comprehensive evaluation.
    Note: The manuscript text has been truncated for processing. Focus on visible content.
    
    Journal Context:
    ${journalData.general_context}

    Manuscript (truncated):
    ${truncatedText}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k", // Use 16k model for larger context
            messages: [{ role: "user", content: prompt }]
        });

        return completion.choices[0].message?.content.trim() || "**Error: Could not process general feedback.**";
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
