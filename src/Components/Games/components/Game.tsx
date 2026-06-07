// components/Game.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Ball {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  dx: number;
  dy: number;
}

const COLORS = ['#3498db', '#9b59b6', '#2ecc71', '#f1c40f', '#e74c3c', '#1abc9c', '#34495e', '#16a085', '#27ae60', '#2980b9'];

const Game = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerBall, setPlayerBall] = useState<Ball>({
    id: 0,
    x: 0,
    y: 0,
    radius: 20,
    color: '#3498db',
    dx: 0,
    dy: 0,
  });
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showTip, setShowTip] = useState(true);

  // 初始化游戏
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    canvas.width = gameRef.current?.clientWidth || 0;
    canvas.height = 400;

    // 初始化玩家球
    setPlayerBall((prev) => ({
      ...prev,
      x: canvas.width / 2,
      y: canvas.height / 2,
    }));

    // 生成初始球
    const initialBalls = Array.from({ length: 10 }, (_, i) => createRandomBall(i + 1, canvas.width, canvas.height));
    setBalls(initialBalls);

    // 3秒后隐藏提示
    const tipTimer = setTimeout(() => setShowTip(false), 3000);

    return () => {
      clearTimeout(tipTimer);
    };
  }, []);

  // 倒计时
  useEffect(() => {
    if (timeLeft <= 0) {
      onGameOver(score);
      return;
    }

    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, score, onGameOver]);

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || isPaused) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      // 获取鼠标在画布内的位置
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 更新玩家球位置
      setPlayerBall((prev) => ({
        ...prev,
        x: mouseX,
        y: mouseY,
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPaused]);

  // 游戏主循环
  useEffect(() => {
    if (!canvasRef.current || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制玩家球
      drawBall(ctx, playerBall);

      // 移动和绘制其他球
      const newBalls = [...balls];
      let scoreIncrement = 0;

      for (let i = 0; i < newBalls.length; i++) {
        const ball = newBalls[i];

        // 移动球
        ball.x += ball.dx * (1 + score / 500); // 随分数增加速度
        ball.y += ball.dy * (1 + score / 500);

        // 边界碰撞检测
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.dx = -ball.dx;
        }
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
          ball.dy = -ball.dy;
        }

        // 与玩家球碰撞检测
        const distance = Math.sqrt(Math.pow(playerBall.x - ball.x, 2) + Math.pow(playerBall.y - ball.y, 2));

        if (distance < playerBall.radius + ball.radius) {
          if (playerBall.radius > ball.radius) {
            // 玩家吃掉球
            scoreIncrement += Math.floor(ball.radius);

            // 替换被吃掉的球
            newBalls[i] = createRandomBall(ball.id, canvas.width, canvas.height);

            // 增加玩家球大小

            setPlayerBall((prev) => ({
              ...prev,
              radius: prev.radius + ball.radius * 0.1 > 50 ? 50 : prev.radius + ball.radius * 0.1, // 限制最大大小
            }));
          } else {
            // 玩家被吃
            onGameOver(score);
            return;
          }
        }

        // 绘制其他球
        drawBall(ctx, ball);
      }

      // 更新分数
      if (scoreIncrement > 0) {
        setScore((prev) => prev + scoreIncrement);
      }

      // 更新球数组
      setBalls(newBalls);

      // 继续游戏循环
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [balls, playerBall, isPaused, score, onGameOver]);

  // 创建随机球
  const createRandomBall = (id: number, canvasWidth: number, canvasHeight: number): Ball => {
    const radius = Math.random() * 25 + 5;
    const x = Math.random() * (canvasWidth - radius * 2) + radius;
    const y = Math.random() * (canvasHeight - radius * 2) + radius;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const speed = Math.random() * 2 + 0.5;
    const angle = Math.random() * Math.PI * 2;

    return {
      id,
      x,
      y,
      radius,
      color,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
    };
  };

  // 绘制球
  const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    console.log('drawBall', ball.id, ball.x, ball.y, ball.radius, ball.color);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="relative">
      <div className="flex justify-between mb-2 w-full">
        <div className="font-bold text-xl">得分: {score}</div>
        <div className="font-bold text-xl">时间: {timeLeft}秒</div>
        <button
          onClick={togglePause}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          {isPaused ? '继续' : '暂停'}
        </button>
      </div>

      <div
        className="relative w-full h-[400px]"
        ref={gameRef}
      >
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 shadow-lg bg-white w-full"
        ></canvas>

        {showTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg"
          >
            <p className="text-center">
              移动鼠标控制球体
              <br />
              吃掉比你小的球，避开比你大的球
            </p>
          </motion.div>
        )}

        {isPaused && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg">
            <p className="text-xl font-bold">游戏暂停</p>
            <p>点击&#34;继续&#34;按钮恢复游戏</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
