const Analysis = require('../models/Analysis');

/**
 * GET /api/history
 * Returns paginated analysis history for the current user.
 */
const getHistory = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const [analyses, total] = await Promise.all([
            Analysis.find({ userId: req.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Analysis.countDocuments({ userId: req.userId }),
        ]);

        res.json({
            success: true,
            page,
            totalPages: Math.ceil(total / limit),
            total,
            analyses: analyses.map((a) => ({
                id: a._id,
                inputType: a.inputType,
                argumentText: a.argumentText,
                fallacies: a.fallacies,
                tone: a.tone,
                clarityScore: a.clarityScore,
                persuasionScore: a.persuasionScore,
                logicalConsistencyScore: a.logicalConsistencyScore,
                professionalismScore: a.professionalismScore,
                emotionalIntensityScore: a.emotionalIntensityScore,
                vocalMetrics: a.vocalMetrics,
                createdAt: a.createdAt,
            })),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/stats
 * Returns aggregate statistics for the current user's analyses.
 */
const getStats = async (req, res, next) => {
    try {
        const stats = await Analysis.aggregate([
            { $match: { userId: req.userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    avgClarity: { $avg: '$clarityScore' },
                    avgPersuasion: { $avg: '$persuasionScore' },
                    avgLogicalConsistency: { $avg: '$logicalConsistencyScore' },
                    avgProfessionalism: { $avg: '$professionalismScore' },
                    avgEmotionalIntensity: { $avg: '$emotionalIntensityScore' },
                },
            },
        ]);

        // Recent 10 analyses for trend chart
        const recent = await Analysis.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('clarityScore persuasionScore logicalConsistencyScore professionalismScore emotionalIntensityScore createdAt')
            .lean();

        const result = stats[0] || {
            total: 0,
            avgClarity: 0,
            avgPersuasion: 0,
            avgLogicalConsistency: 0,
            avgProfessionalism: 0,
            avgEmotionalIntensity: 0,
        };

        res.json({
            success: true,
            total: result.total,
            avgClarity: Math.round(result.avgClarity || 0),
            avgPersuasion: Math.round(result.avgPersuasion || 0),
            avgLogicalConsistency: Math.round(result.avgLogicalConsistency || 0),
            avgProfessionalism: Math.round(result.avgProfessionalism || 0),
            avgEmotionalIntensity: Math.round(result.avgEmotionalIntensity || 0),
            recent: recent.reverse().map((a) => ({
                date: a.createdAt,
                clarity: a.clarityScore,
                persuasion: a.persuasionScore,
                logic: a.logicalConsistencyScore,
                professionalism: a.professionalismScore,
                emotional: a.emotionalIntensityScore,
            })),
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getHistory, getStats };
