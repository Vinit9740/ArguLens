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

    const systemPrompt = `You are a professional ghostwriter.
Your exact task is to rewrite the provided argument into a confident, professional, and logical 1st-person statement, fixing any logical fallacies or emotional language.

Output ONLY this exact format below. Do not add any conversational text or explanations.

REWRITE: [Write the professional and logical 1st-person rewrite here]
SCORES: clarity=[0-100], persuasion=[0-100], logic=[0-100], professionalism=[0-100], emotional=[0-100]
TONE: [Brief tone description]
FALLACIES: [Identify logical flaws]
FEEDBACK: [Concise coaching]
PLAN: [3 target improvements]`;

    const exampeUser = `Analyze: "Taxes are theft, taking my money by force!"`;
    const exampleAssistant = `REWRITE: I believe compulsory taxation raises fundamental ethical issues regarding fiscal legitimacy and government accountability.
SCORES: clarity=60, persuasion=50, logic=45, professionalism=50, emotional=80
TONE: Assertive/Critical
FALLACIES: Appeal to Emotion, False Equivalence
FEEDBACK: Reframe your argument around systemic fiscal transparency rather than theft.
PLAN: Reference economic data, Avoid extreme accusations, Discuss social contract theory`;

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
