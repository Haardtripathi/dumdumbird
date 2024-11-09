


"use client";
import { useState, useCallback, useEffect } from 'react';
import FlappyBird from '../components/FlappyBird';
import { connectToArConnect, disconnectFromArConnect } from '../utils/arconnect';
import { initializeAO, saveScore, fetchAllScores, resetAOConnection } from '../utils/ao';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [allScores, setAllScores] = useState<{ player: string; score: number; timestamp: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  async function handleFetchAllScores() {
    setLoading(true);
    setError(null);
    try {
      const scores = await fetchAllScores();

      console.log(scores, "INSIDE PAGE")
      setAllScores(scores);
    } catch (error) {
      console.error('Failed to fetch all scores:', error);
      setError('Failed to fetch all scores. Please try again later.');
      setAllScores([]);
    } finally {
      setLoading(false);
    }
  }

  // async function handleConnect() {
  //   try {
  //     const address = await connectToArConnect();
  //     setWalletAddress(address);
  //     setLoading(true);

  //     await initializeAO(address);
  //     // Fetch high scores or other relevant data here if needed
  //   } catch (error) {
  //     console.error('Failed to connect:', error);
  //     setError('Failed to connect. Please make sure ArConnect is installed and try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function handleConnect() {
    try {
      const address = await connectToArConnect();
      setWalletAddress(address);
      setLoading(true);

      try {
        console.log(address)
        await initializeAO(address);
        // Fetch high scores or other relevant data here if needed
      } catch (error) {
        console.error('Failed to initialize AO:', error);
        setError(`Failed to initialize AO: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      setError(`Failed to connect: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveScore() {
    if (!walletAddress || currentScore <= 0) return;

    setIsSaving(true);
    setError(null);

    try {
      await saveScore(walletAddress, currentScore);
      // Optionally fetch high scores or perform other actions after saving
      setGameEnded(false); // Reset game state after saving
    } catch (error) {
      console.error('Failed to save score:', error);
      setError(`Failed to save score: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGameOver(score: number) {
    setGameEnded(true);
    setCurrentScore(score);
  }

  // async function handleSaveScore() {
  //   if (!walletAddress || currentScore <= 0) return;

  //   setIsSaving(true);
  //   setError(null);

  //   try {
  //     await saveScore(walletAddress, currentScore);
  //     // Optionally fetch high scores or perform other actions after saving
  //     setGameEnded(false); // Reset game state after saving
  //   } catch (error) {
  //     console.error('Failed to save score:', error);
  //     setError('Failed to save score. Please try again.');
  //   } finally {
  //     setIsSaving(false);
  //   }
  // }

  async function handleDisconnect() {
    try {
      await disconnectFromArConnect();
      resetAOConnection();

      // Reset states
      setWalletAddress(null);
      setCurrentScore(0);
      setAllScores([]); // Reset all scores state
      setError(null);
      setGameEnded(false);

    } catch (error) {
      console.error('Failed to disconnect:', error);
      setError('Failed to disconnect. Please try again.');
    }
  }

  function handleRestartGame() {
    setGameEnded(false);
    setCurrentScore(0);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Flappy Bird on Arweave</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {walletAddress ? (
        <>
          <p>Connected: {walletAddress}</p>
          <button onClick={handleDisconnect} className="bg-red-500 text-white p-2 rounded">
            Disconnect
          </button>
          <FlappyBird onGameOver={handleGameOver} />

          {loading && <p>Loading...</p>}
          {isSaving && <p>Saving high score...</p>}
          <p>Current Score: {currentScore}</p>

          {gameEnded && (
            <div>
              <button onClick={handleSaveScore} className="bg-green-500 text-white p-2 rounded mr-2" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Score'}
              </button>
              <button onClick={handleRestartGame} className="bg-blue-500 text-white p-2 rounded">
                Play Again
              </button>
            </div>
          )}

          {/* Button to fetch all scores */}
          <button onClick={handleFetchAllScores} className="bg-yellow-500 text-white p-2 rounded mt-4" disabled={loading}>
            {loading ? 'Fetching Scores...' : 'Show All Scores'}
          </button>

          {/* Display all fetched scores */}
          <h2 className="text-2xl font-bold mt-4">All Scores</h2>
          {allScores.length > 0 ? (
            <ul>
              {allScores.map((score, index) => (
                <li key={index}>
                  Player: {score.player.slice(0, 6)}...{score.player.slice(-4)} - Score: {score.score} - Time: {new Date(score.timestamp * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No scores available</p>
          )}

        </>
      ) : (
        <button onClick={handleConnect} className="bg-blue-500 text-white p-2 rounded">
          Connect with ArConnect
        </button>
      )}

    </div>
  );
}