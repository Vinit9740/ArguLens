const { processAIResponse } = require('./reliabilityLayer');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'tinyllama:latest';

/**
 * Main AI analysis function using Chat API.
 * Returns a structured JSON response using the Reliability Layer.
 */
async function analyzeArgument(argumentText, framework = 'CER') {
    const frameworkPrompts = {
        'CER': 'Claim → Evidence → Reasoning',
        'PCS': 'Problem → Cause → Solution',
        'PAC': 'Premise → Argument → Conclusion'
    };

    const systemPrompt = `YOU ARE A PROFESSIONAL GHOSTWRITER. 
Objective: Redefine and rewrite user input into 1st person professional statements. 

Output ONLY this exact format:

REWRITE: [1ST PERSON PROFESSIONAL STATEMENT. ADOPT THE USER ROLE. NEVER USE 3RD PERSON ANALYSIS LIKE "THE AUTHOR" OR "THE SPEAKER". NO PREAMBLE. NO META-TALK.]
SCORES: clarity=[0-100], persuasion=[0-100], logic=[0-100], professionalism=[0-100], emotional=[0-100]
TONE: [Brief tone description]
FALLACIES: [Identify logical flaws]
FEEDBACK: [Concise coaching]
PLAN: [3 target improvements]

Constraint: DO NOT output an explanation or analysis of the user. Only the rewrite.`;

    const exampeUser = `Analyze and Rewrite as if you are the user: "Taxes are theft! Politicians are criminals!"`;
    const exampleAssistant = `REWRITE: Compulsory taxation raises fundamental ethical issues regarding the social contract and the perception of fiscal legitimacy.
SCORES: clarity=50, persuasion=35, logic=35, professionalism=30, emotional=95
TONE: Provocative/Emotional
FALLACIES: Ad Hominem, Appeal to Emotion
FEEDBACK: Reframe around systemic fiscal transparency.
PLAN: Reference economic data, Avoid personal attacks, Address social contract theory`;

    try {
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: exampeUser },
                    { role: 'assistant', content: exampleAssistant },
                    { role: 'user', content: `Analyze: "${argumentText}"` }
                ],
                stream: false,
                // format: 'json', // Removed to allow free-form labelled text
                options: { temperature: 0.1, num_predict: 1000 }
            }),
        });

        if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
        const data = await response.json();
        const content = data.message?.content || '';

        return processAIResponse(content, argumentText);
    } catch (err) {
        console.error('[aiService] Analytics error:', err.message);
        // Fallback using the reliability layer with empty content
        return processAIResponse('', argumentText);
    }
}

/**
 * Legacy support for refineArgument (now integrated into analyzeArgument for efficiency)
 */
async function refineArgument(argumentText, targetTone) {
    const analysis = await analyzeArgument(argumentText);
    return analysis.data.refinedVersion;
}

module.exports = { analyzeArgument, refineArgument };
