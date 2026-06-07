// pages/index.tsx
import { useState, useEffect } from 'react';
import Game from './components/Game';
import GameIntro from './components/GameIntro';
import GameOver from './components/GameOver';

export default function Home() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'over'>('intro');
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<number[]>([]);

  useEffect(() => {
    const storedScores = localStorage.getItem('ballGameHighScores');
    if (storedScores) {
      setHighScores(JSON.parse(storedScores));
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setGameState('playing');
  };

  const endGame = (finalScore: number) => {
    setScore(finalScore);

    const newHighScores = [...highScores, finalScore].sort((a, b) => b - a).slice(0, 5);

    setHighScores(newHighScores);
    localStorage.setItem('ballGameHighScores', JSON.stringify(newHighScores));
    setGameState('over');
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center min-h-full">
      {gameState === 'intro' && (
        <GameIntro
          onStart={startGame}
          highScores={highScores}
        />
      )}

      {gameState === 'playing' && <Game onGameOver={endGame} />}

      {gameState === 'over' && (
        <GameOver
          score={score}
          highScores={highScores}
          onRestart={startGame}
        />
      )}
    </div>
  );
}
