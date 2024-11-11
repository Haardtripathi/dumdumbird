"use client"

import React, { useEffect, useRef, useState } from 'react';

const FlappyBird = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const scoreRef = useRef(0);
    const [fadeIn, setFadeIn] = useState(false);
    const [showScoreAnimation, setShowScoreAnimation] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const birdImageRef = useRef<HTMLImageElement | null>(null);
    const projectileImageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const birdImage = new Image();
        birdImage.src = "./DumDumBird.png";
        const projectileImage = new Image();
        projectileImage.src = "./AO.png";

        birdImage.onload = () => {
            birdImageRef.current = birdImage;
            if (projectileImageRef.current) {
                setImageLoaded(true);
                console.log("All images loaded successfully");
            }
        };
        projectileImage.onload = () => {
            projectileImageRef.current = projectileImage;
            if (birdImageRef.current) {
                setImageLoaded(true);
                console.log("All images loaded successfully");
            }
        };
        birdImage.onerror = () => {
            setError("Failed to load bird image");
            console.error("Failed to load bird image");
        };
        projectileImage.onerror = () => {
            setError("Failed to load projectile image");
            console.error("Failed to load projectile image");
        };
    }, []);

    useEffect(() => {
        if (!imageLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError("Unable to get 2D context");
            return;
        }

        let animationFrameId: number;
        let birdY = canvas.height / 2;
        let birdVelocity = 0;
        let birdRotation = 0;
        let pipes: any[] = [];
        const gravity = 0.4;
        const jumpStrength = -8;
        const pipeWidth = 70;
        const pipeGap = 170;
        const birdSize = 40;
        const birdX = 100;

        // Projectile management with multiple projectiles
        interface Projectile {
            x: number;
            y: number;
            createdAt: number;
            angle: number;
            speed: number;
        }

        let projectiles: Projectile[] = [];
        const projectileSize = 20;
        const projectileLifetime = 1000; // 1 second lifetime
        const numProjectilesPerShot = 5; // Number of projectiles per shot

        const createProjectiles = () => {
            const angleSpread = Math.PI / 4; // 45-degree spread
            const baseAngle = Math.PI; // Shooting backwards (180 degrees)

            for (let i = 0; i < numProjectilesPerShot; i++) {
                const angle = baseAngle + (angleSpread * (i / (numProjectilesPerShot - 1)) - angleSpread / 2);
                const speed = 3 + Math.random() * 2; // Random speed between 3 and 5

                projectiles.push({
                    x: birdX,
                    y: birdY,
                    createdAt: Date.now(),
                    angle: angle,
                    speed: speed
                });
            }
        };

        const clouds = Array(5).fill(null).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 2),
            speed: Math.random() * 0.5 + 0.5,
            size: Math.random() * 30 + 20
        }));

        const drawClouds = () => {
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
        };

        const drawProjectiles = () => {
            const currentTime = Date.now();
            projectiles = projectiles.filter(projectile => {
                const age = currentTime - projectile.createdAt;
                if (age > projectileLifetime) return false;

                if (projectileImageRef.current) {
                    ctx.save();
                    const opacity = 1 - (age / projectileLifetime);
                    ctx.globalAlpha = opacity;

                    // Update projectile position based on angle and speed
                    projectile.x += Math.cos(projectile.angle) * projectile.speed;
                    projectile.y += Math.sin(projectile.angle) * projectile.speed;

                    ctx.drawImage(
                        projectileImageRef.current,
                        projectile.x - projectileSize / 2,
                        projectile.y - projectileSize / 2,
                        projectileSize,
                        projectileSize
                    );
                    ctx.restore();
                }
                return true;
            });
        };

        const drawBird = () => {
            if (!birdImageRef.current) return;
            ctx.save();
            ctx.translate(birdX, birdY);
            ctx.rotate(birdRotation);
            ctx.drawImage(birdImageRef.current, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
            ctx.restore();
        };

        const drawPipes = () => {
            ctx.fillStyle = 'green';
            pipes.forEach(pipe => {
                ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
                ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);
            });
        };

        const drawBackground = () => {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawClouds();
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        };

        const drawScore = () => {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`Score: ${scoreRef.current}`, 10, 40);
        };

        const gameLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();

            if (gameStarted && !gameOver) {
                birdVelocity += gravity;
                birdY += birdVelocity;
                birdRotation = Math.min(Math.max(birdVelocity * 0.1, -0.5), 0.5);

                pipes.forEach((pipe, index) => {
                    pipe.x -= 2;

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

                if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
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
            drawProjectiles();
            drawBird();
            drawScore();

            if (!gameOver) {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        };

        const checkCollision = () => {
            if (birdY + birdSize / 2 > canvas.height - 50 || birdY - birdSize / 2 < 0) {
                return true;
            }

            return pipes.some(pipe => {
                return (
                    birdX + birdSize / 2 > pipe.x &&
                    birdX - birdSize / 2 < pipe.x + pipeWidth &&
                    (birdY - birdSize / 2 < pipe.topHeight ||
                        birdY + birdSize / 2 > pipe.topHeight + pipeGap)
                );
            });
        };

        const handleClick = () => {
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
                createProjectiles();
            } else {
                setGameOver(false);
                setGameStarted(true);
                scoreRef.current = 0;
                setScore(0);
                birdY = canvas.height / 2;
                birdVelocity = 0;
                pipes = [];
                projectiles = [];
            }
        };

        canvas.addEventListener('click', handleClick);
        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('click', handleClick);
        };
    }, [gameOver, gameStarted, onGameOver, highScore, imageLoaded]);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className={`relative w-full max-w-2xl mx-auto p-4 ${fadeIn ? 'animate-fade-in' : ''}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex justify-between w-full mb-2 px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                        <span className="text-lg font-bold text-yellow-400">High Score: {highScore}</span>
                    </div>
                    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-3 ${showScoreAnimation ? 'animate-bounce' : ''}`}>
                        <span className="text-lg font-bold text-white">Score: {score}</span>
                    </div>
                </div>
                <div className="relative">
                    {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">Loading...</div>}
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
