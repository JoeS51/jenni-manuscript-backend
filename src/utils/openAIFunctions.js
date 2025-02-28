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

async function validateSections(manuscriptText, journalData) {
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
    
    [Repeat for each section]
    
    ## Compliance with Journal Requirements
    | Requirement | Status | Comments |
    |------------|--------|----------|
    | [Req 1] | ✅/⚠️/❌ | Brief explanation |
    
    Manuscript:
    ${manuscriptText}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
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
    const prompt = `
    As an expert referee for ${journalData.name} (${journalData.publisher}), provide a comprehensive evaluation using this markdown format:

    # General Manuscript Assessment
    
    ## Executive Summary
    [2-3 sentences on overall assessment]
    
    ## 1. Research Contribution
    ### Strengths
    - Point 1
    - Point 2
    
    ### Concerns
    - Issue 1
    - Issue 2
    
    ### Score: X/10
    
    ## 2. Technical Quality
    [Similar structure for each major aspect...]
    
    ## Recommendations
    ### Major Revisions Required
    1. [Critical change needed]
    2. [Critical change needed]
    
    ### Minor Suggestions
    1. [Minor improvement]
    2. [Minor improvement]
    
    ## Final Verdict
    [Clear statement on whether to accept/revise/reject]
    
    ---
    
    Evaluate based on:
    1. Research Contribution
    - Novel findings?
    - Significant advancement?
    [... rest of the evaluation criteria ...]

    Manuscript:
    ${manuscriptText}
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
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
