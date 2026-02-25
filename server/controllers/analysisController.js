const { analyzeArgument } = require('../services/aiService');
const { extractVocalMetrics, transcribeAudio } = require('../services/voiceService');
const Analysis = require('../models/Analysis');
const fs = require('fs');

/**
 * POST /api/analyze
 * Analyzes an argument (text or voice) and provides structured feedback.
 */
const analyze = async (req, res, next) => {
    try {
        let { text, framework = 'CER' } = req.body;
        let vocalMetrics = null;
        let inputType = 'text';

        // 1. Handle Voice Input
        if (req.file) {
            inputType = 'voice';
            const audioPath = req.file.path;

            // Check if frontend already provided transcription and metrics (Hybrid approach)
            let metrics = null;
            let transcribedText = null;

            if (req.body.vocalMetrics) {
                try {
                    metrics = typeof req.body.vocalMetrics === 'string'
                        ? JSON.parse(req.body.vocalMetrics)
                        : req.body.vocalMetrics;
                } catch (e) {
                    console.error('Error parsing vocalMetrics:', e);
                }
            }

            if (req.body.transcribedText) {
                transcribedText = req.body.transcribedText;
            }

            // Fallback to server-side processing only if not provided by frontend
            if (!metrics || !transcribedText) {
                const [serverMetrics, serverText] = await Promise.all([
                    !metrics ? extractVocalMetrics(audioPath) : metrics,
                    !transcribedText ? transcribeAudio(audioPath) : transcribedText
                ]);
                vocalMetrics = serverMetrics;
                text = serverText;
            } else {
                vocalMetrics = metrics;
                text = transcribedText;
            }

            // Cleanup temp file
            fs.unlinkSync(audioPath);
        }

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "text" field or audio file.' });
        }

        const trimmed = text.trim();
        if (trimmed.length < 5) { // Lower limit for voice starters
            return res.status(400).json({ error: 'Argument is too short.' });
        }

        // 2. Run AI Analysis
        const aiResult = await analyzeArgument(trimmed, framework);

        // 3. Save to History
        const analysis = await Analysis.create({
            userId: req.userId,
            inputType,
            argumentText: trimmed,
            vocalMetrics,
            fallacies: aiResult.data.fallacies,
            tone: aiResult.data.tone,
            clarityScore: aiResult.data.clarityScore,
            persuasionScore: aiResult.data.persuasionScore,
            logicalConsistencyScore: aiResult.data.logicalConsistencyScore,
            professionalismScore: aiResult.data.professionalismScore,
            emotionalIntensityScore: aiResult.data.emotionalIntensityScore,
            feedback: aiResult.data.feedback,
            refinedVersion: aiResult.data.refinedVersion,
            suggestions: aiResult.data.suggestions,
        });

        res.status(201).json({
            success: true,
            analysisId: analysis._id,
            data: analysis
        });
    } catch (err) {
        console.error('[AnalysisController] Error:', err);
        next(err);
    }
};

module.exports = { analyze };
