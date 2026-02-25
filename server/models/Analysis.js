const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    inputType: {
        type: String,
        enum: ['text', 'voice'],
        default: 'text',
    },
    argumentText: {
        type: String,
        required: true,
        maxlength: 5000,
    },
    vocalMetrics: {
        intensity: Number,
        speechRate: Number,
        pauseFrequency: Number,
    },
    fallacies: {
        type: [String],
        default: [],
    },
    tone: {
        type: String,
        default: 'Neutral',
    },
    clarityScore: { type: Number, min: 0, max: 100, default: 0 },
    persuasionScore: { type: Number, min: 0, max: 100, default: 0 },
    logicalConsistencyScore: { type: Number, min: 0, max: 100, default: 0 },
    professionalismScore: { type: Number, min: 0, max: 100, default: 0 },
    emotionalIntensityScore: { type: Number, min: 0, max: 100, default: 0 },
    feedback: {
        structured_argument_feedback: String,
        communication_improvement_plan: [String],
    },
    refinedVersion: String,
    suggestions: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

// Compound index for efficient user history queries
analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
