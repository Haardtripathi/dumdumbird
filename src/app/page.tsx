"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlappyBird from '../components/FlappyBird';
import { connectToArConnect, disconnectFromArConnect } from '../utils/arconnect';
import { initializeAO, saveScore, fetchAllScores, resetAOConnection } from '../utils/ao';
import { ArrowRight, LogOut, Save, RefreshCw, Play } from 'lucide-react';
import './globals.css'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [allScores, setAllScores] = useState<{ player: string; score: number; timestamp: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [fetchingScores, setFetchingScores] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  async function handleFetchAllScores() {
    setFetchingScores(true);
    setError(null);
    try {
      const scores = await fetchAllScores();
      console.log(scores, "INSIDE PAGE");
      setAllScores(scores);
    } catch (err) {
      console.error('Failed to fetch all scores:', err);
      setError('Failed to fetch all scores. Please try again later.');
      setAllScores([]);
    } finally {
      setFetchingScores(false);
    }
  }

  async function handleConnect() {
    setError(null);
    setLoading(true);

    try {
      const address = await connectToArConnect();
      setWalletAddress(address);

      try {
        await initializeAO(address);
      } catch (err) {
        console.error('Failed to initialize AO:', err);
        setError(`Failed to initialize AO. Please try again.`);
      }
    } catch (err) {
      console.error('Connection error:', err);
      if (err instanceof Error) {
        if (err.message.includes('not found')) {
          setError('Please install ArConnect from arconnect.io and refresh the page');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to connect to ArConnect');
      }
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
      setGameEnded(false);
      setError('Score saved successfully!');
    } catch (err) {
      console.error('Failed to save score:', err);
      setError(`Failed to save score: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGameOver(score: number) {
    setGameEnded(true);
    setCurrentScore(score);
  }

  async function handleDisconnect() {
    try {
      await disconnectFromArConnect();
      resetAOConnection();
      setWalletAddress(null);
      setCurrentScore(0);
      setAllScores([]);
      setError(null);
      setGameEnded(false);
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError('Failed to disconnect. Please try again.');
    }
  }

  function handleRestartGame() {
    setGameEnded(false);
    setCurrentScore(0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 text-gray-800">
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center text-blue-600">DumDum Bird on Arweave</h1>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-lg text-center ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {walletAddress ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md">
              <p className="mb-2 md:mb-0">Connected: <span className="font-mono">{walletAddress}</span></p>
              <button onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out flex items-center">
                <LogOut className="mr-2" size={18} /> Disconnect
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <FlappyBird onGameOver={handleGameOver} />
            </div>

            {loading && <p className="text-center">Loading...</p>}
            {isSaving && <p className="text-center">Saving high score...</p>}

            {gameEnded && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-center space-x-4 mt-4"
              >
                <button
                  onClick={handleSaveScore}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full transition duration-300 ease-in-out flex items-center"
                  disabled={isSaving}
                >
                  <Save className="mr-2" size={18} /> {isSaving ? 'Saving...' : 'Save Score'}
                </button>
                <button
                  onClick={handleRestartGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition duration-300 ease-in-out flex items-center"
                >
                  <Play className="mr-2" size={18} /> Play Again
                </button>
              </motion.div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">All Scores</h2>
              <button
                onClick={handleFetchAllScores}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out flex items-center mb-4"
                disabled={fetchingScores}
              >
                <RefreshCw className="mr-2" size={18} /> {fetchingScores ? 'Fetching Scores...' : 'Fetch All Scores'}
              </button>
              {fetchingScores ? (
                <p className="text-center">Fetching scores...</p>
              ) : allScores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Rank</th>
                        <th className="px-4 py-2 text-left">Player</th>
                        <th className="px-4 py-2 text-left">Score</th>
                        <th className="px-4 py-2 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allScores
                        .sort((a, b) => b.score - a.score)
                        .map((score, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2 font-mono">{score.player.slice(0, 6)}...{score.player.slice(-4)}</td>
                            <td className="px-4 py-2">{score.score}</td>
                            <td className="px-4 py-2">{new Date(score.timestamp * 1000).toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">No scores available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <button
              onClick={handleConnect}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg transition duration-300 ease-in-out flex items-center"
            >
              <ArrowRight className="mr-2" size={24} /> Connect with ArConnect
            </button>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-600 underline"
            >
              {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
            </button>
            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white p-6 rounded-lg shadow-md max-w-2xl"
                >
                  <h2 className="text-2xl font-bold mb-4">How to Play</h2>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Connect your ArConnect wallet</li>
                    <li>Click or tap to make the bird fly</li>
                    <li>Avoid the pipes</li>
                    <li>Try to get the highest score</li>
                    <li>Save your score on the AO</li>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}