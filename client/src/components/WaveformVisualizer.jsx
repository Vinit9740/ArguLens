import React, { useRef, useEffect } from 'react';

const WaveformVisualizer = ({ analyser, isRecording }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let animationId;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                // Apple-style gradient
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, 'rgba(0, 122, 255, 0.2)');
                gradient.addColorStop(1, 'rgba(88, 86, 214, 0.8)');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        if (isRecording) {
            draw();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return () => cancelAnimationFrame(animationId);
    }, [analyser, isRecording]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-24 rounded-lg bg-black/5 backdrop-blur-sm border border-white/10"
            width={600}
            height={100}
        />
    );
};

export default WaveformVisualizer;
