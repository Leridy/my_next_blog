'use client';
import { useState, useEffect, KeyboardEvent, FC } from 'react';
import { FiPlus, FiTrash2, FiRotateCw } from 'react-icons/fi';

const FoodPicker: FC = () => {
  const [foods, setFoods] = useState<string[]>([]);
  const [newFood, setNewFood] = useState<string>('');
  const [randomFood, setRandomFood] = useState<string | null>(null);
  const [animation, setAnimation] = useState<boolean>(false);

  useEffect(() => {
    const storedFoods = localStorage.getItem('foods');
    if (storedFoods) {
      setFoods(JSON.parse(storedFoods));
    } else {
      const defaultFoods: string[] = ['麻辣香锅', '火锅', '烤鱼', '冒菜', '麻辣烫', '炒饭', '炸酱面', '拉面'];
      setFoods(defaultFoods);
      localStorage.setItem('foods', JSON.stringify(defaultFoods));
    }
  }, []);

  useEffect(() => {
    if (foods.length > 0) {
      localStorage.setItem('foods', JSON.stringify(foods));
    }
  }, [foods]);

  const addFood = (): void => {
    if (newFood.trim() === '') return;
    const updatedFoods = [...foods, newFood.trim()];
    setFoods(updatedFoods);
    setNewFood('');
  };

  const deleteFood = (index: number): void => {
    const updatedFoods = foods.filter((_, i) => i !== index);
    setFoods(updatedFoods);
    if (updatedFoods.length === 0) {
      localStorage.removeItem('foods');
    }
  };

  const generateRandomFood = (): void => {
    if (foods.length === 0) return;

    setAnimation(true);

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * foods.length);
      setRandomFood(foods[randomIndex]);
      count++;

      if (count > 10) {
        clearInterval(interval);
        setAnimation(false);
      }
    }, 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addFood();
    }
  };

  return (
    <div>
      {/* 随机食物显示 */}
      <div className={`relative h-24 flex items-center justify-center bg-[var(--color-card-background)] rounded-lg mb-4 transition-all ${animation ? 'scale-105' : ''}`}>
        {randomFood ? (
          <div className="text-center">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">今天吃这个：</p>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">{randomFood}</h2>
          </div>
        ) : (
          <p className="text-[var(--color-text-secondary)] text-center">点击下方按钮生成随机食物</p>
        )}
      </div>

      {/* 随机生成按钮 */}
      <button
        onClick={generateRandomFood}
        disabled={foods.length === 0}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-transparent)] text-[var(--color-text-light)] rounded-lg py-2 mb-4 flex items-center justify-center disabled:bg-[var(--color-secondary)] transition-colors text-sm"
      >
        <FiRotateCw className="mr-2" />
        随机选择食物
      </button>

      {/* 添加新食物 */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newFood}
          onChange={(e) => setNewFood(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加你喜欢的食物..."
          className="flex-1 border border-[var(--color-border)] bg-[var(--color-editor-background)] text-[var(--color-text)] rounded-l-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-transparent)]"
        />
        <button
          onClick={addFood}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-transparent)] text-[var(--color-text-light)] rounded-r-lg px-3 py-1.5 transition-colors"
        >
          <FiPlus />
        </button>
      </div>

      {/* 食物列表 */}
      <div className="bg-[var(--color-card-background)] rounded-lg p-3">
        <h3 className="text-[var(--color-text)] text-sm font-medium mb-2">食物列表 ({foods.length})</h3>

        {foods.length > 0 ? (
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            {foods.map((food, index) => (
              <li
                key={index}
                className="bg-[var(--color-editor-background)] p-2 rounded-lg shadow-sm flex justify-between items-center group"
              >
                <span className="text-[var(--color-text)] text-sm">{food}</span>
                <button
                  onClick={() => deleteFood(index)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-success)] transition-colors"
                  aria-label="删除食物"
                >
                  <FiTrash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--color-text-secondary)] text-center py-3 text-sm">还没有添加食物，请添加一些选项</p>
        )}
      </div>
    </div>
  );
};

export default FoodPicker;
