import React, { useEffect, useRef, useState } from 'react';

const FlappyBird = ({ onGameOver }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const scoreRef = useRef(0);
    const [fadeIn, setFadeIn] = useState(false);
    const [showScoreAnimation, setShowScoreAnimation] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let birdY = canvas.height / 2;
        let birdVelocity = 0;
        let birdRotation = 0;
        let pipes = [];
        const gravity = 0.4;
        const jumpStrength = -8;
        const pipeWidth = 70;
        const pipeGap = 170;
        const birdSize = 20;
        const birdX = 100;

        // Cloud positions
        let clouds = Array(5).fill().map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 2),
            speed: Math.random() * 0.5 + 0.5,
            size: Math.random() * 30 + 20
        }));

        function drawClouds() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            clouds.forEach(cloud => {
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.size * 0.5, cloud.y - cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2);
                ctx.arc(cloud.x - cloud.size * 0.5, cloud.y - cloud.size * 0.1, cloud.size * 0.6, 0, Math.PI * 2);
                ctx.fill();

                cloud.x -= cloud.speed;
                if (cloud.x + cloud.size < 0) {
                    cloud.x = canvas.width + cloud.size;
                    cloud.y = Math.random() * (canvas.height / 2);
                }
            });
        }

        function drawBird() {
            ctx.save();
            ctx.translate(birdX, birdY);
            ctx.rotate(birdRotation);

            // Bird body - now with gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, birdSize);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, birdSize, 0, Math.PI * 2);
            ctx.fill();

            // Wing with animation
            const wingOffset = Math.sin(Date.now() / 100) * 5;
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.ellipse(-5, 5 + wingOffset, 10, 6, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(8, -5, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(10, -5, 3, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(25, -3);
            ctx.lineTo(25, 3);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        function drawPipes() {
            pipes.forEach(pipe => {
                // Pipe gradient
                const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
                gradient.addColorStop(0, '#2ecc71');
                gradient.addColorStop(1, '#27ae60');

                // Pipe shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;

                // Draw pipes
                ctx.fillStyle = gradient;
                ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
                ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);

                // Reset shadow
                ctx.shadowColor = 'transparent';

                // Pipe caps with metallic effect
                const capGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x, 30);
                capGradient.addColorStop(0, '#229954');
                capGradient.addColorStop(0.5, '#27ae60');
                capGradient.addColorStop(1, '#229954');
                ctx.fillStyle = capGradient;

                ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
                ctx.fillRect(pipe.x - 5, pipe.topHeight + pipeGap, pipeWidth + 10, 20);
            });
        }

        function drawBackground() {
            // Sky gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw clouds
            drawClouds();

            // Ground with gradient
            const groundGradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
            groundGradient.addColorStop(0, '#90EE90');
            groundGradient.addColorStop(1, '#8B4513');
            ctx.fillStyle = groundGradient;
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

            // Ground pattern
            ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
            for (let i = 0; i < canvas.width; i += 30) {
                ctx.fillRect(i, canvas.height - 50, 15, 50);
            }
        }

        function drawScore() {
            // Score display with shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.fillStyle = 'white';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${scoreRef.current}`, canvas.width / 2, 60);
            ctx.shadowColor = 'transparent';

            if (!gameStarted && !gameOver) {
                // Start screen
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, canvas.height / 2 - 100, canvas.width, 200);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 36px Arial';
                ctx.fillText('Flappy Bird', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '24px Arial';
                ctx.fillText('Click to Start!', canvas.width / 2, canvas.height / 2 + 20);
                ctx.font = '18px Arial';
                ctx.fillText('Press or click to fly', canvas.width / 2, canvas.height / 2 + 60);
            }

            if (gameOver) {
                // Game over screen with animation
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 48px Arial';
                ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60);

                ctx.font = '32px Arial';
                ctx.fillText(`Score: ${scoreRef.current}`, canvas.width / 2, canvas.height / 2);
                ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);

                ctx.font = '24px Arial';
                ctx.fillText('Click to Try Again', canvas.width / 2, canvas.height / 2 + 100);
            }
        }

        function gameLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();

            if (gameStarted && !gameOver) {
                birdVelocity += gravity;
                birdY += birdVelocity;

                // Bird rotation based on velocity
                birdRotation = Math.min(Math.max(birdVelocity * 0.1, -0.5), 0.5);

                pipes.forEach((pipe, index) => {
                    pipe.x -= 3;

                    if (!pipe.passed && pipe.x + pipeWidth < birdX) {
                        pipe.passed = true;
                        scoreRef.current += 1;
                        setScore(scoreRef.current);
                        setShowScoreAnimation(true);
                        setTimeout(() => setShowScoreAnimation(false), 500);
                    }

                    if (pipe.x + pipeWidth < 0) {
                        pipes.splice(index, 1);
                    }
                });

                if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
                    pipes.push({
                        x: canvas.width,
                        topHeight: Math.random() * (canvas.height - pipeGap - 200) + 100,
                        passed: false
                    });
                }

                if (checkCollision()) {
                    setGameOver(true);
                    setGameStarted(false);
                    if (scoreRef.current > highScore) {
                        setHighScore(scoreRef.current);
                    }
                    onGameOver(scoreRef.current);
                }
            }

            drawPipes();
            drawBird();
            drawScore();

            if (!gameOver) {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        }

        function checkCollision() {
            if (birdY + birdSize > canvas.height - 50 || birdY - birdSize < 0) {
                return true;
            }

            return pipes.some(pipe => {
                const horizontalCollision =
                    birdX + birdSize * 0.8 > pipe.x &&
                    birdX - birdSize * 0.8 < pipe.x + pipeWidth;

                const verticalCollision =
                    birdY - birdSize * 0.8 < pipe.topHeight ||
                    birdY + birdSize * 0.8 > pipe.topHeight + pipeGap;

                return horizontalCollision && verticalCollision;
            });
        }

        function handleClick(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                if (!gameStarted) {
                    setGameStarted(true);
                    setFadeIn(true);
                    scoreRef.current = 0;
                    setScore(0);
                    pipes = [];
                    birdY = canvas.height / 2;
                    birdVelocity = 0;
                } else if (!gameOver) {
                    birdVelocity = jumpStrength;
                } else {
                    setGameOver(false);
                    setGameStarted(true);
                    scoreRef.current = 0;
                    setScore(0);
                    birdY = canvas.height / 2;
                    birdVelocity = 0;
                    pipes = [];
                }
            }
        }

        canvas.addEventListener('click', handleClick);
        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('click', handleClick);
        };
    }, [gameOver, gameStarted, onGameOver, highScore]);

    return (
        <div className={`relative w-full max-w-2xl mx-auto p-4 ${fadeIn ? 'animate-fade-in' : ''}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex justify-between w-full mb-2 px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                        <span className="text-lg font-bold text-yellow-400">High Score: {highScore}</span>
                    </div>
                    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-3 ${showScoreAnimation ? 'animate-bounce' : ''
                        }`}>
                        <span className="text-lg font-bold text-white">Score: {score}</span>
                    </div>
                </div>
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={600}
                        className="rounded-xl shadow-2xl border-4 border-white/20"
                    />
                </div>
                {gameOver && (
                    <div className="mt-4 space-y-4 text-center animate-fade-in">
                        <p className="text-xl text-red-400 font-bold">Game Over!</p>
                        <p className="text-white">Click to try again!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlappyBird;