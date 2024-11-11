import React, { useEffect, useState, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 40;
const PIPE_WIDTH = 70;
const PIPE_GAP = 170;
const GRAVITY = 0.4;
const JUMP_STRENGTH = -8;
const BIRD_X_POSITION = 100;

const FlappyBird = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [birdImage, setBirdImage] = useState<HTMLImageElement | null>(null);
    const [projectileImage, setProjectileImage] = useState<HTMLImageElement | null>(null);

    // Game state
    const gameState = useRef({
        birdY: CANVAS_HEIGHT / 2,
        birdVelocity: 0,
        pipes: [] as Array<{ x: number; topHeight: number; passed: boolean }>,
        projectiles: [] as Array<{
            x: number;
            y: number;
            createdAt: number;
            angle: number;
            speed: number;
        }>,
        score: 0
    });

    // Load images
    useEffect(() => {
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
        };

        Promise.all([
            loadImage('./DumDumBird.png'),
            loadImage('./AO.png')
        ]).then(([bird, projectile]) => {
            setBirdImage(bird);
            setProjectileImage(projectile);
        }).catch(error => {
            console.error('Failed to load images:', error);
        });
    }, []);

    const createProjectiles = () => {
        const angleSpread = Math.PI / 4;
        const baseAngle = Math.PI;
        const numProjectiles = 5;

        const newProjectiles = Array.from({ length: numProjectiles }, (_, i) => ({
            x: BIRD_X_POSITION,
            y: gameState.current.birdY,
            createdAt: Date.now(),
            angle: baseAngle + (angleSpread * (i / (numProjectiles - 1)) - angleSpread / 2),
            speed: 3 + Math.random() * 2
        }));

        gameState.current.projectiles.push(...newProjectiles);
    };

    const resetGame = () => {
        gameState.current = {
            birdY: CANVAS_HEIGHT / 2,
            birdVelocity: 0,
            pipes: [],
            projectiles: [],
            score: 0
        };
        setScore(0);
        setGameStarted(true);
        setGameOver(false);
    };

    // Game loop
    useEffect(() => {
        if (!canvasRef.current || !birdImage || !projectileImage) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const updateGameState = () => {
            if (!gameStarted || gameOver) return;

            // Update bird
            gameState.current.birdVelocity += GRAVITY;
            gameState.current.birdY += gameState.current.birdVelocity;

            // Update pipes
            gameState.current.pipes = gameState.current.pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
            gameState.current.pipes.forEach(pipe => {
                pipe.x -= 2;
                if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X_POSITION) {
                    pipe.passed = true;
                    gameState.current.score++;
                    setScore(gameState.current.score);
                }
            });

            // Add new pipe
            if (gameState.current.pipes.length === 0 ||
                gameState.current.pipes[gameState.current.pipes.length - 1].x < canvas.width - 200) {
                gameState.current.pipes.push({
                    x: canvas.width,
                    topHeight: Math.random() * (canvas.height - PIPE_GAP - 200) + 100,
                    passed: false
                });
            }

            // Update projectiles
            const currentTime = Date.now();
            gameState.current.projectiles = gameState.current.projectiles
                .filter(p => currentTime - p.createdAt <= 1000)
                .map(p => ({
                    ...p,
                    x: p.x + Math.cos(p.angle) * p.speed,
                    y: p.y + Math.sin(p.angle) * p.speed
                }));

            // Check collisions
            const checkCollision = () => {
                if (gameState.current.birdY + BIRD_SIZE / 2 > canvas.height - 50 ||
                    gameState.current.birdY - BIRD_SIZE / 2 < 0) {
                    return true;
                }

                return gameState.current.pipes.some(pipe => (
                    BIRD_X_POSITION + BIRD_SIZE / 2 > pipe.x &&
                    BIRD_X_POSITION - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH &&
                    (gameState.current.birdY - BIRD_SIZE / 2 < pipe.topHeight ||
                        gameState.current.birdY + BIRD_SIZE / 2 > pipe.topHeight + PIPE_GAP)
                ));
            };

            if (checkCollision()) {
                setGameOver(true);
                setGameStarted(false);
                setHighScore(prev => Math.max(prev, gameState.current.score));
                onGameOver(gameState.current.score);
            }
        };

        const render = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw ground
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

            // Draw pipes
            ctx.fillStyle = 'green';
            gameState.current.pipes.forEach(pipe => {
                ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
                ctx.fillRect(
                    pipe.x,
                    pipe.topHeight + PIPE_GAP,
                    PIPE_WIDTH,
                    canvas.height - pipe.topHeight - PIPE_GAP
                );
            });

            // Draw projectiles
            gameState.current.projectiles.forEach(projectile => {
                const age = Date.now() - projectile.createdAt;
                const opacity = 1 - (age / 1000);
                ctx.globalAlpha = opacity;
                ctx.drawImage(
                    projectileImage,
                    projectile.x - 10,
                    projectile.y - 10,
                    20,
                    20
                );
            });
            ctx.globalAlpha = 1;

            // Draw bird
            ctx.save();
            ctx.translate(BIRD_X_POSITION, gameState.current.birdY);
            ctx.rotate(Math.min(Math.max(gameState.current.birdVelocity * 0.1, -0.5), 0.5));
            ctx.drawImage(
                birdImage,
                -BIRD_SIZE / 2,
                -BIRD_SIZE / 2,
                BIRD_SIZE,
                BIRD_SIZE
            );
            ctx.restore();

            // Draw score
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`Score: ${gameState.current.score}`, 10, 40);
        };

        const gameLoop = () => {
            updateGameState();
            render();
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameStarted, gameOver, birdImage, projectileImage, onGameOver]);

    // Handle user input
    useEffect(() => {
        const handleJump = () => {
            if (gameStarted && !gameOver) {
                gameState.current.birdVelocity = JUMP_STRENGTH;
                createProjectiles();
            }
        };

        const handleClick = () => {
            if (!gameStarted || gameOver) {
                resetGame();
            } else {
                handleJump();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                handleClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameStarted, gameOver]);

    return (
        <div className="relative w-full max-w-2xl mx-auto p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="flex justify-between w-full mb-2 px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                        <span className="text-lg font-bold text-yellow-400">High Score: {highScore}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                        <span className="text-lg font-bold text-white">Score: {score}</span>
                    </div>
                </div>
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="rounded-xl shadow-2xl border-4 border-white/20"
                        onClick={() => {
                            if (!gameStarted || gameOver) {
                                resetGame();
                            } else {
                                gameState.current.birdVelocity = JUMP_STRENGTH;
                                createProjectiles();
                            }
                        }}
                    />
                </div>
                {gameOver && (
                    <div className="mt-4 space-y-4 text-center animate-fade-in">
                        <p className="text-xl text-red-400 font-bold">Game Over!</p>
                        <p className="text-white">Click or press Space to try again!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlappyBird;
