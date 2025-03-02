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
      <div className={`relative h-24 flex items-center justify-center bg-[rgba(203,220,235,0.85)] dark:bg-[rgba(98,149,132,0.3)] rounded-lg mb-4 transition-all ${animation ? 'scale-105' : ''}`}>
        {randomFood ? (
          <div className="text-center">
            <p className="text-sm text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)] mb-1">今天吃这个：</p>
            <h2 className="text-2xl font-bold text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)]">{randomFood}</h2>
          </div>
        ) : (
          <p className="text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)] text-center">点击下方按钮生成随机食物</p>
        )}
      </div>

      {/* 随机生成按钮 */}
      <button
        onClick={generateRandomFood}
        disabled={foods.length === 0}
        /* eslint-disable-next-line max-len */
        className="w-full bg-[rgba(122,178,211,0.85)] hover:bg-[rgba(74,98,138,0.95)] dark:bg-[rgba(64,83,76,0.9)] dark:hover:bg-[rgba(103,125,106,0.85)] text-[rgba(255,255,255,0.95)] rounded-lg py-2 mb-4 flex items-center justify-center disabled:bg-[rgba(204,204,204,0.6)] dark:disabled:bg-[rgba(51,51,51,0.8)] transition-colors text-sm"
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
          className="flex-1 border border-[rgba(204,204,204,0.6)] dark:border-[rgba(51,51,51,0.8)] bg-white dark:bg-[rgba(26,54,54,1)] text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)] rounded-l-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(185,229,232,0.9)]"
        />
        <button onClick={addFood} className="bg-[rgba(185,229,232,0.9)] hover:bg-[rgba(122,178,211,0.85)] dark:bg-[rgba(103,125,106,0.85)] dark:hover:bg-[rgba(64,83,76,0.9)] text-[rgba(40,44,52,0.9)] dark:text-[rgba(255,255,255,0.95)] rounded-r-lg px-3 py-1.5 transition-colors">
          <FiPlus />
        </button>
      </div>

      {/* 食物列表 */}
      <div className="bg-[rgba(203,220,235,0.75)] dark:bg-[rgba(98,149,132,0.3)] rounded-lg p-3">
        <h3 className="text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)] text-sm font-medium mb-2">食物列表 ({foods.length})</h3>

        {foods.length > 0 ? (
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            {foods.map((food, index) => (
              <li key={index} className="bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(0,0,0,0.6)] p-2 rounded-lg shadow-sm flex justify-between items-center group">
                <span className="text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)] text-sm">{food}</span>
                <button onClick={() => deleteFood(index)} className="text-[rgba(102,102,102,0.75)] hover:text-[rgba(40,167,69,0.9)] dark:text-[rgba(204,204,204,0.8)] dark:hover:text-[rgba(40,167,69,0.75)] transition-colors" aria-label="删除食物">
                  <FiTrash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)] text-center py-3 text-sm">还没有添加食物，请添加一些选项</p>
        )}
      </div>
    </div>
  );
};

export default FoodPicker;
