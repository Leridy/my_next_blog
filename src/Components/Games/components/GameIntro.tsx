// components/GameIntro.tsx
import { motion } from 'framer-motion';

interface GameIntroProps {
  onStart: () => void;
  highScores: number[];
}

const GameIntro = ({ onStart, highScores }: GameIntroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">游戏规则</h2>

      <ul className="list-disc pl-5 mb-6 space-y-2">
        <li>使用鼠标控制你的球体在画面中移动</li>
        <li>吃掉比你小的球体，你将变得更大</li>
        <li>避开比你大的球体，否则游戏结束</li>
        <li>每局游戏限时60秒，尽可能获得高分</li>
      </ul>

      {highScores.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">历史最高分</h3>
          <ol className="list-decimal pl-5">
            {highScores.map((score, index) => (
              <li
                key={index}
                className="font-medium"
              >
                {score} 分
              </li>
            ))}
          </ol>
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition duration-200"
      >
        开始游戏
      </button>
    </motion.div>
  );
};

export default GameIntro;
