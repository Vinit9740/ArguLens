// FFmpeg removed (not required for current wav-based heuristic extraction)
const { WaveFile } = require('wavefile');
const fs = require('fs');
const path = require('path');

/**
 * Extracts vocal metrics from a WAV file.
 */
async function extractVocalMetrics(audioPath) {
    try {
        if (!audioPath.endsWith('.wav')) {
            console.warn('[VoiceService] Metric extraction skipped: Only WAV supported for server-side metrics.');
            return { intensity: 50, speechRate: 50, pauseFrequency: 0 };
        }
        const buffer = fs.readFileSync(audioPath);
        const wav = new WaveFile(buffer);
        const samples = wav.getSamples();

        // 1. Intensity (RMS Volume)
        let sumSquared = 0;
        for (let i = 0; i < samples.length; i++) {
            const val = samples[i] / 32768; // Normalize for 16-bit
            sumSquared += val * val;
        }
        const rms = Math.sqrt(sumSquared / samples.length);
        const intensity = Math.min(100, Math.round(rms * 500)); // Scaled heuristic

        // 2. Pause Frequency & Speech Rate (Silence Detection)
        // We'll use a simple threshold for silence
        const threshold = 0.01;
        const sampleRate = wav.fmt.sampleRate;
        let silenceCount = 0;
        let pauses = 0;
        let inSilence = false;
        const minPauseSamples = sampleRate * 0.3; // 300ms min pause

        for (let i = 0; i < samples.length; i += 100) { // Subsample for speed
            const val = Math.abs(samples[i] / 32768);
            if (val < threshold) {
                silenceCount += 100;
                if (silenceCount > minPauseSamples && !inSilence) {
                    pauses++;
                    inSilence = true;
                }
            } else {
                silenceCount = 0;
                inSilence = false;
            }
        }

        const duration = samples.length / sampleRate;
        const speechRate = Math.min(100, Math.round((samples.length / sampleRate) * 5)); // Dummy heuristic for "speed"

        return {
            intensity,
            speechRate,
            pauseFrequency: pauses
        };
    } catch (err) {
        console.error('[VoiceService] Metrics error:', err.message);
        return { intensity: 50, speechRate: 50, pauseFrequency: 0 };
    }
}

/**
 * Placeholder for Local STT (since native builds failed)
 * In a real-world local setup, this would call a whisper executable or similar.
 */
async function transcribeAudio(audioPath) {
    return "Voice capture failed or not supported. Please ensure you are using Chrome/Edge and have granted microphone permissions.";
}

module.exports = { extractVocalMetrics, transcribeAudio };
