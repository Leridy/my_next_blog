import React, { useEffect, useRef, useState } from 'react';
import { List, Typography, Card } from 'antd';

const WoodenFishGame: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [history, setHistory] = useState<{date: string, count: number}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // 加载历史记录和今日计数
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedHistory = JSON.parse(localStorage.getItem('woodenFishHistory') || '[]');
    setHistory(savedHistory);

    const todayRecord = savedHistory.find((item: any) => item.date === today);
    if (todayRecord) {
      setCount(todayRecord.count);
    } else {
      setCount(0);
    }

    // 初始化木鱼图像
    drawWoodenFish();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 绘制木鱼
  const drawWoodenFish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制木鱼
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2, 80, 50, 0, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制木鱼顶部
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2 - 10, 70, 30, 0, 0, Math.PI);
    ctx.fill();

    // 绘制木鱼底部细节
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2 + 5, 60, 35, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };

  // 木鱼被敲击的动画
  const animateHit = () => {
    let scale = 0.9;
    let growing = true;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 保存当前状态
      ctx.save();

      // 设置变换原点到中心
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // 绘制木鱼
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2, 80, 50, 0, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制木鱼顶部
      ctx.fillStyle = '#A0522D';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2 - 10, 70, 30, 0, 0, Math.PI);
      ctx.fill();

      // 绘制木鱼底部细节
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2 + 5, 60, 35, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // 恢复状态
      ctx.restore();

      // 更新缩放比例
      if (growing) {
        scale += 0.03;
        if (scale >= 1.05) growing = false;
      } else {
        scale -= 0.03;
        if (scale <= 0.9) {
          growing = true;
          setIsAnimating(false);
          drawWoodenFish();
          return;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  // 处理点击
  const handleClick = () => {
    // 如果正在动画中，不处理点击
    if (isAnimating) return;

    // 播放敲击音效
    const hitSound = new Audio('/wooden-fish-sound.mp3');
    hitSound.play().catch(() => console.log('无法播放音效，可能需要用户交互'));

    // 执行动画
    animateHit();

    // 更新计数
    const newCount = count + 1;
    setCount(newCount);

    // 更新本地存储
    const today = new Date().toISOString().split('T')[0];
    const newHistory = [...history];

    const todayIndex = newHistory.findIndex(item => item.date === today);
    if (todayIndex !== -1) {
      newHistory[todayIndex].count = newCount;
    } else {
      newHistory.push({ date: today, count: newCount });
    }

    setHistory(newHistory);
    localStorage.setItem('woodenFishHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
        <div className="text-center">
          <div
            className="relative cursor-pointer"
            onClick={handleClick}
            style={{
              display: 'inline-block',
              transition: 'transform 0.1s',
              transform: isAnimating ? 'scale(0.95)' : 'scale(1)'
            }}
          >
            <canvas
              ref={canvasRef}
              width={200}
              height={150}
              className="mx-auto"
            />
            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full">
              今日功德: {count}
            </div>
          </div>
          <Typography.Text className="block mt-4 text-gray-600">
            点击木鱼积累功德
          </Typography.Text>
        </div>

        <Typography.Title level={4}>历史功德</Typography.Title>
        <List
          style={{
            width: '100%',
            maxWidth: 300,
            maxHeight: 200,
          }}
          dataSource={history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          renderItem={(item) => (
            <List.Item className="flex justify-between">
              <span>{item.date}</span>
              <span className="text-yellow-600 font-semibold">{item.count} 功德</span>
            </List.Item>
          )}
          locale={{ emptyText: '暂无历史记录' }}
          className="max-h-60 overflow-auto"
        />

    </div>
  );
};

export default WoodenFishGame;
