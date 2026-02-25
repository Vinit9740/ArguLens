import React, { useState, useRef, useEffect } from 'react';
import WaveformVisualizer from './WaveformVisualizer';
import { Mic, Square, Trash2, Check, Loader2 } from 'lucide-react';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [analyser, setAnalyser] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');
    const metricsRef = useRef({ maxIntensity: 0, samples: [] });

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscriptPart = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptPart += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscriptPart) {
                transcriptRef.current += finalTranscriptPart;
            }

            // Show both final and interim in UI for responsiveness
            setTranscript(transcriptRef.current + interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please enable it in browser settings.');
            } else if (event.error === 'network') {
                setError('Network error: Speech Recognition requires an internet connection.');
            }
            // Other errors don't necessarily need to block the UI, but we'll show them for transparency
        };

        recognition.onend = () => {
            // Restart if it stopped but we're still recording
            if (isRecording && recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    // Ignore start errors (usually already started)
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isRecording]); // Re-bind onEnd when isRecording changes

    const startRecording = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Setup Analyzer for Visualization & Metrics
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyzerNode = audioContext.createAnalyser();
            analyzerNode.fftSize = 256;
            source.connect(analyzerNode);
            setAnalyser(analyzerNode);

            // Metrics monitoring
            metricsRef.current = { maxIntensity: 0, samples: [] }; // Reset
            const dataArray = new Uint8Array(analyzerNode.frequencyBinCount);
            const monitorMetrics = () => {
                if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
                analyzerNode.getByteTimeDomainData(dataArray);

                // Calculate RMS
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const sample = (dataArray[i] - 128) / 128;
                    sum += sample * sample;
                }
                const rms = Math.sqrt(sum / dataArray.length);
                const intensity = Math.min(100, Math.round(rms * 500));

                metricsRef.current.maxIntensity = Math.max(metricsRef.current.maxIntensity, intensity);
                metricsRef.current.samples.push(intensity);

                requestAnimationFrame(monitorMetrics);
            };

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                const finalTranscript = transcriptRef.current.trim();
                const vocalMetrics = {
                    intensity: metricsRef.current.maxIntensity,
                    speechRate: Math.min(100, Math.round(finalTranscript.length > 0 ? (finalTranscript.split(' ').length / (duration || 1) * 20) : 0)),
                    pauseFrequency: Math.round(metricsRef.current.samples.filter(s => s < 5).length / 50)
                };

                onRecordingComplete(audioBlob, finalTranscript, vocalMetrics);
            };

            mediaRecorder.start();
            if (recognitionRef.current) {
                transcriptRef.current = '';
                setTranscript('');
                recognitionRef.current.start();
                setIsListening(true);
            }
            setIsRecording(true);
            requestAnimationFrame(monitorMetrics);

            // Start Timer
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Microphone error:', err);
            setError('Microphone access failed. Please grant permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                setIsListening(false);
            }
            setIsRecording(false);
            clearInterval(timerRef.current);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };

    const cancelRecording = () => {
        stopRecording();
        audioChunksRef.current = [];
        setTranscript('');
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300">
            <div className="relative w-full">
                <WaveformVisualizer analyser={analyser} isRecording={isRecording} />
                {isRecording && (
                    <div className="absolute top-2 right-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-white/70 tabular-nums">
                            {formatDuration(duration)}
                        </span>
                    </div>
                )}
                {isListening && (
                    <div className="absolute bottom-2 left-4 pr-12">
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                            <Loader2 size={10} className="animate-spin" />
                            Transcribing: <span className="text-white/40 italic normal-case truncate max-w-[200px]">{transcript || "Waiting for speech..."}</span>
                        </p>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm z-10 p-4 text-center">
                        <p className="text-red-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
                            {error}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="group flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all hover:scale-105 active:scale-95"
                    >
                        <Mic size={20} className="group-hover:animate-bounce" />
                        Start Recording
                    </button>
                ) : (
                    <>
                        <button
                            onClick={cancelRecording}
                            className="p-3 rounded-full bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-500 transition-all hover:scale-110"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                        >
                            <Square size={20} fill="currentColor" />
                            Stop & Analyze
                        </button>
                    </>
                )}
            </div>

            <p className="text-xs text-white/40 font-medium uppercase tracking-widest">
                Voice Communication Coach
            </p>
        </div>
    );
};

export default AudioRecorder;
