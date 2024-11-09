import React, { useEffect, useRef, useState } from 'react';

interface FlappyBirdProps {
    onGameOver: (score: number) => void;
}

const FlappyBird: React.FC<FlappyBirdProps> = ({ onGameOver }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const scoreRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let birdY = canvas.height / 2;
        let birdVelocity = 0;
        let pipes: { x: number; topHeight: number; passed: boolean }[] = [];
        const gravity = 0.4;
        const jumpStrength = -8;
        const pipeWidth = 60;
        const pipeGap = 160;
        const birdSize = 15;
        const birdX = 100;

        function drawBird() {
            // Bird body
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(birdX, birdY, birdSize, 0, Math.PI * 2);
            ctx.fill();

            // Bird eye
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(birdX + 5, birdY - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            // Bird wing
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.ellipse(birdX - 5, birdY + 5, 8, 5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawPipes() {
            pipes.forEach(pipe => {
                // Main pipe body
                const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
                gradient.addColorStop(0, '#2ecc71');
                gradient.addColorStop(1, '#27ae60');

                ctx.fillStyle = gradient;

                // Top pipe
                ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
                // Bottom pipe
                ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);

                // Pipe caps
                ctx.fillStyle = '#229954';
                // Top pipe cap
                ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
                // Bottom pipe cap
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

            // Ground
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

            // Grass
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 10);
        }

        function drawScore() {
            ctx.fillStyle = 'black';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${scoreRef.current}`, canvas.width / 2, 50);

            if (!gameStarted && !gameOver) {
                ctx.font = 'bold 24px Arial';
                ctx.fillText('Click to Start!', canvas.width / 2, canvas.height / 2);
            }

            if (gameOver) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, canvas.height / 2 - 80, canvas.width, 160);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 32px Arial';
                ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
                ctx.font = '24px Arial';
                ctx.fillText(`Score: ${scoreRef.current}`, canvas.width / 2, canvas.height / 2 + 10);
                ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 50);
            }
        }

        function checkCollision() {
            // Ground collision
            if (birdY + birdSize > canvas.height - 50) {
                return true;
            }

            // Ceiling collision
            if (birdY - birdSize < 0) {
                return true;
            }

            // Pipe collision
            return pipes.some(pipe => {
                const horizontalCollision =
                    birdX + birdSize > pipe.x &&
                    birdX - birdSize < pipe.x + pipeWidth;

                const verticalCollision =
                    birdY - birdSize < pipe.topHeight ||
                    birdY + birdSize > pipe.topHeight + pipeGap;

                return horizontalCollision && verticalCollision;
            });
        }

        function gameLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();

            if (gameStarted && !gameOver) {
                birdVelocity += gravity;
                birdY += birdVelocity;

                // Move and manage pipes
                pipes.forEach((pipe, index) => {
                    pipe.x -= 3;

                    // Score management
                    if (!pipe.passed && pipe.x + pipeWidth < birdX) {
                        pipe.passed = true;
                        scoreRef.current += 1;
                        setScore(scoreRef.current);
                    }

                    // Remove off-screen pipes
                    if (pipe.x + pipeWidth < 0) {
                        pipes.splice(index, 1);
                    }
                });

                // Add new pipes
                if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
                    pipes.push({
                        x: canvas.width,
                        topHeight: Math.random() * (canvas.height - pipeGap - 200) + 100,
                        passed: false
                    });
                }

                // Check for collision
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

        function handleClick(event: MouseEvent) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                if (!gameStarted) {
                    setGameStarted(true);
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
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="flex justify-between w-full mb-2">
                    <span className="text-lg font-bold">High Score: {highScore}</span>
                    <span className="text-lg font-bold">Current Score: {score}</span>
                </div>
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={600}
                    className="border-2 border-gray-300 rounded-lg shadow-lg"
                />
                {!gameStarted && !gameOver && (
                    <p className="text-center text-gray-600">Click or tap to start!</p>
                )}
                {gameOver && (
                    <p className="text-center text-red-500 font-bold">
                        Game Over! Click or tap to try again!
                    </p>
                )}
            </div>
        </div>
    );
};

export default FlappyBird;