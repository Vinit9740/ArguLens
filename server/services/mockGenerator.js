/**
 * ArguLens Deterministic AI Simulator (Zero-Key)
 * Generates unique, context-aware analysis based on input text without external APIs.
 */

const TEMPLATES = {
    ethics: {
        rewrite: "I believe that {subject} raises significant ethical concerns regarding {point}, necessitating a more transparent and accountable framework.",
        fallacies: ["Moral Equivalence", "Appeal to Emotion"],
        feedback: "Focus on systemic ethical principles rather than purely individual grievances.",
        plan: ["Cite ethical frameworks", "Define core values", "Analyze long-term impact"]
    },
    economics: {
        rewrite: "The current approach to {subject} appears to overlook critical fiscal implications, particularly concerning {point} and long-term sustainability.",
        fallacies: ["Slippery Slope", "False Dilemma"],
        feedback: "Incorporate more empirical data to support your fiscal claims.",
        plan: ["Reference economic indicators", "Address market volatility", "Propose balanced solutions"]
    },
    technology: {
        rewrite: "While {subject} offers transformative potential, we must critically evaluate the trade-offs in {point} to ensure equitable progress.",
        fallacies: ["Hasty Generalization", "Technological Determinism"],
        feedback: "Balance your enthusiasm for innovation with a rigorous assessment of social costs.",
        plan: ["Evaluate security risks", "Discuss accessibility", "Predict future trends"]
    },
    general: {
        rewrite: "Regarding {subject}, a more objective analysis reveals that {point} is a central factor that requires careful consideration and structured reasoning.",
        fallacies: ["Circular Reasoning", "Ad Hominem"],
        feedback: "Strengthen your core premise by removing speculative or emotional language.",
        plan: ["Clarify the main claim", "Provide corroborating evidence", "Maintain professional distance"]
    }
};

const KEYWORDS = {
    ethics: ['theft', 'wrong', 'right', 'moral', 'justice', 'fair', 'unfair', 'evil', 'good', 'honest'],
    economics: ['money', 'tax', 'cost', 'price', 'market', 'finance', 'budget', 'salary', 'profit', 'loss'],
    technology: ['ai', 'computer', 'software', 'internet', 'data', 'algorithm', 'digital', 'tech', 'automation']
};

/**
 * Simple hash function to make scores/selection deterministic based on input
 */
function getHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function generateDynamicMock(text) {
    const hash = getHash(text);
    const words = text.toLowerCase().split(/\s+/);

    // 1. Determine Category
    let category = 'general';
    for (const [cat, keys] of Object.entries(KEYWORDS)) {
        if (keys.some(k => words.includes(k))) {
            category = cat;
            break;
        }
    }

    const template = TEMPLATES[category];
    const subject = words.length > 2 ? words.slice(0, 3).join(' ') : 'this topic';
    const point = words.length > 5 ? words.slice(-3).join(' ') : 'the core argument';

    // 2. Build Rewrite
    const rewrite = template.rewrite
        .replace('{subject}', subject)
        .replace('{point}', point);

    // 3. Generate Scores (Deterministic but varied)
    const scores = {
        clarity: 60 + (hash % 30),
        persuasion: 50 + (hash % 40),
        logic: 55 + (hash % 35),
        professionalism: 70 + (hash % 25),
        emotional: 40 + (hash % 50)
    };

    // 4. Fallacy selection
    const fallacies = template.fallacies.slice(0, 1 + (hash % 2));
    if (text.length < 20) fallacies.push("Hasty Generalization");

    return {
        rewritten_professional_version: rewrite,
        clarity_score: scores.clarity,
        persuasion_score: scores.persuasion,
        logical_consistency_score: scores.logic,
        professionalism_score: scores.professionalism,
        emotional_intensity_score: scores.emotional,
        tone_classification: category === 'general' ? 'Analytical' : category.charAt(0).toUpperCase() + category.slice(1),
        fallacies: fallacies,
        structured_argument_feedback: template.feedback,
        communication_improvement_plan: template.plan
    };
}

module.exports = { generateDynamicMock };
