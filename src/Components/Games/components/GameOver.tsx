// components/GameOver.tsx
import { motion } from 'framer-motion';

interface GameOverProps {
  score: number;
  highScores: number[];
  onRestart: () => void;
}

const GameOver = ({ score, highScores, onRestart }: GameOverProps) => {
  const isNewHighScore = highScores.length > 0 && score >= highScores[highScores.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">游戏结束</h2>

      <div className="text-center mb-4">
        <p className="text-xl">
          你的得分: <span className="font-bold text-blue-600">{score}</span>
        </p>
        {isNewHighScore && (
          <motion.p
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-lg font-bold text-yellow-500 mt-2"
          >
            新纪录！
          </motion.p>
        )}
      </div>

      {highScores.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">最高分排行</h3>
          <ol className="list-decimal pl-5">
            {highScores.map((s, index) => (
              <li
                key={index}
                className={`font-medium ${s === score ? 'text-blue-600 font-bold' : ''}`}
              >
                {s} 分
              </li>
            ))}
          </ol>
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition duration-200"
      >
        再玩一次
      </button>
    </motion.div>
  );
};

export default GameOver;
