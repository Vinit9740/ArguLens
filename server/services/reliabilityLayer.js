/**
 * ArguLens Reliability Layer
 * Handles extraction, validation, and fallback for AI-generated analysis.
 */

const FALLACY_LIST = [
    'Ad Hominem', 'Strawman', 'Appeal to Authority', 'False Dilemma',
    'Circular Reasoning', 'Hasty Generalization', 'Slippery Slope', 'Appeal to Emotion'
];

/**
 * Utility to ensure a value is a clean string.
 * Handles nested arrays/objects returned by flaky models.
 */
function safeString(val, fallback = '') {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        // If it looks like stringified JSON (starts with [ or {), try to parse it
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
            try {
                const parsed = JSON.parse(trimmed);
                return safeString(parsed, fallback);
            } catch (e) {
                // Not valid JSON or too complex, just return as is
                return trimmed;
            }
        }
        return trimmed;
    }
    if (Array.isArray(val)) return safeString(val[0], fallback);
    if (typeof val === 'object') {
        // If it's a structured object from the framework, prioritize 'reasoning' or 'claim'
        if (val.reasoning) return safeString(val.reasoning, fallback);
        if (val.claim) return safeString(val.claim, fallback);
        const values = Object.values(val);
        return values.length > 0 ? safeString(values[0], fallback) : fallback;
    }
    return String(val);
}

/**
 * Utility to ensure a value is a flat array of clean strings.
 */
function safeStringArray(val, fallback = []) {
    if (!Array.isArray(val)) {
        if (typeof val === 'string' && val.length > 0) return [val];
        return fallback;
    }
    return val.map(v => safeString(v)).filter(v => v.length > 0);
}

/**
 * Heuristic parser for malformed AI output.
 * Extracts key fields using regex when JSON.parse fails.
 */
function heuristicParse(rawText) {
    const data = {};

    // 1. EXTRECT REWRITE (Labelled format)
    const rewriteMatch = rawText.match(/REWRITE:\s*([\s\S]*?)(?=SCORES:|TONE:|FALLACIES:|FEEDBACK:|PLAN:|$)/i);
    if (rewriteMatch) {
        data.rewritten_professional_version = rewriteMatch[1].trim();
    }

    // 2. EXTRACT SCORES (Labelled format: clarity=80, persuasion=70...)
    const scoresMatch = rawText.match(/SCORES:\s*([\s\S]*?)(?=TONE:|FALLACIES:|FEEDBACK:|PLAN:|$)/i);
    if (scoresMatch) {
        const scoreStr = scoresMatch[1];
        const subPatterns = {
            clarity_score: /clarity\s*=\s*(\d+)/i,
            persuasion_score: /persuasion\s*=\s*(\d+)/i,
            logical_consistency_score: /logic\s*=\s*(\d+)/i,
            professionalism_score: /professionalism\s*=\s*(\d+)/i,
            emotional_intensity_score: /emotional\s*=\s*(\d+)/i
        };
        for (const [key, pattern] of Object.entries(subPatterns)) {
            const m = scoreStr.match(pattern);
            if (m) data[key] = m[1];
        }
    }

    // 3. EXTRACT TONE
    const toneMatch = rawText.match(/TONE:\s*([^\n\r]+)/i);
    if (toneMatch) data.tone_classification = toneMatch[1].trim();

    // 4. EXTRACT FALLACIES
    const fallacyMatch = rawText.match(/FALLACIES:\s*([^\n\r]+)/i);
    if (fallacyMatch) {
        data.fallacies = fallacyMatch[1].split(',').map(f => f.trim());
    }

    // 5. EXTRACT FEEDBACK
    const feedbackMatch = rawText.match(/FEEDBACK:\s*([\s\S]*?)(?=PLAN:|$)/i);
    if (feedbackMatch) data.structured_argument_feedback = feedbackMatch[1].trim();

    // 6. EXTRACT PLAN
    const planMatch = rawText.match(/PLAN:\s*([\s\S]*?)$/i);
    if (planMatch) {
        data.communication_improvement_plan = planMatch[1].split(',').map(p => p.trim());
    }

    // LEGACY / JSON-LIKE FALLBACKS (If labelled format failed)
    if (Object.keys(data).length < 2) {
        const scorePatterns = {
            clarity_score: /(?:clarity|clarity_score)["\s:=]+([\d.]+)/i,
            persuasion_score: /(?:persuasion|persuasion_score)["\s:=]+([\d.]+)/i,
            logical_consistency_score: /(?:logic|logical_consistency|logical_consistency_score)["\s:=]+([\d.]+)/i,
            professionalism_score: /(?:professionalism|professionalism_score)["\s:=]+([\d.]+)/i,
            emotional_intensity_score: /(?:emotional|emotional_intensity|emotional_intensity_score)["\s:=]+([\d.]+)/i
        };
        for (const [key, pattern] of Object.entries(scorePatterns)) {
            const match = rawText.match(pattern);
            if (match && !data[key]) data[key] = match[1];
        }

        if (!data.rewritten_professional_version) {
            const rMatch = rawText.match(/(?:rewritten_professional_version|refined_version|refined_argument)["\s:=]+["']?([^"'}]+)/i);
            if (rMatch) data.rewritten_professional_version = rMatch[1].trim();
        }
    }

    return Object.keys(data).length > 0 ? data : null;
}

/**
 * Robustly extracts JSON from a string that might contain meta-talk.
 */
function extractJSON(rawText) {
    try {
        // Try direct parse first
        return JSON.parse(rawText);
    } catch (e) {
        // Find JSON block
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                // Remove some common model-induced JSON errors like trailing commas or hallucinated newlines
                const cleaned = jsonMatch[0]
                    .replace(/,\s*([\]\}])/g, '$1')
                    .replace(/[\n\r]/g, ' ')
                    .replace(/\s+/g, ' ');
                return JSON.parse(cleaned);
            } catch (innerE) {
                console.warn('[ReliabilityLayer] JSON.parse failed on cleaned block, falling back to heuristic');
            }
        }
        return heuristicParse(rawText);
    }
}

/**
 * Normalizes scores and provides defaults.
 */
function normalizeScores(data) {
    const clamp = (val, def = 50) => {
        // Handle case where val might be an array or object
        const cleanVal = safeString(val, String(def));
        const n = Math.round(Number(cleanVal));
        return isNaN(n) ? def : Math.max(0, Math.min(100, n));
    };

    return {
        clarityScore: clamp(data.clarityScore || data.clarity_score, 65),
        persuasionScore: clamp(data.persuasionScore || data.persuasion_score, 60),
        logicalConsistencyScore: clamp(data.logicalConsistencyScore || data.logical_consistency_score, 55),
        professionalismScore: clamp(data.professionalismScore || data.professionalism_score, 50),
        emotionalIntensityScore: clamp(data.emotionalIntensityScore || data.emotional_intensity_score, 40)
    };
}

/**
 * Extracts fallacies using both AI result and heuristics.
 */
function extractFallacies(data, originalText = '') {
    const found = new Set();
    const aiFallacies = safeStringArray(data.fallacies || data.detected_fallacies);

    aiFallacies.forEach(f => found.add(f));

    // Heuristics
    const lowerText = originalText.toLowerCase();
    if (lowerText.includes('always') || lowerText.includes('never')) found.add('Hasty Generalization');
    if (lowerText.includes('either') && lowerText.includes('or')) found.add('False Dilemma');
    if (lowerText.includes('everyone knows') || lowerText.includes('most people')) found.add('Appeal to Popularity');

    const result = Array.from(found).slice(0, 3);
    return result.length > 0 ? result : ['Logical Gap Detected'];
}

/**
 * Sanitizes and structures feedback.
 */
function formatFeedback(data) {
    return {
        structured_argument_feedback: safeString(data.structured_argument_feedback || data.feedback, 'Focus on providing more empirical evidence.'),
        communication_improvement_plan: safeStringArray(data.communication_improvement_plan || data.improvement_plan, ['Practice structured reasoning', 'Reduce emotional qualifiers', 'Clarify core premises']).slice(0, 3)
    };
}

/**
 * Removes conversational meta-talk from AI output.
 */
function stripMetaTalk(text) {
    if (!text) return '';
    let clean = text.trim();
    // Remove leading conversational fillers like "Here is the rewrite:"
    clean = clean.replace(/^(here is|sure,? here|here's|i have rewritten|the rewritten|an improved version|revised version|professional statement).*?:/i, '').trim();
    // Remove surrounding quotes if present
    if (clean.startsWith('"') && clean.endsWith('"')) {
        clean = clean.substring(1, clean.length - 1).trim();
    }
    return clean;
}

/**
 * Main processing function for the reliability layer.
 */
function processAIResponse(rawText, originalText = '') {
    const data = extractJSON(rawText) || {};

    return {
        success: true,
        data: {
            ...normalizeScores(data),
            fallacies: extractFallacies(data, originalText),
            tone: safeString(data.tone_classification || data.tone || data.tone_profile, 'Analytical'),
            feedback: formatFeedback(data),
            refinedVersion: stripMetaTalk(safeString(
                data.rewritten_professional_version ||
                data.refined_professional_version ||
                data.refined_version ||
                data.refined_argument ||
                data.professional_version ||
                data.professional_rewrite ||
                data.rewrite ||
                data.refined_text ||
                data.refined ||
                data.output_text,
                ''
            )),
            suggestions: safeStringArray(data.suggestions || data.tips, ['Elaborate on your reasoning.']).slice(0, 3)
        }
    };
}

module.exports = { processAIResponse };
