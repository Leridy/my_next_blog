// TodoList.tsx
import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { Input, Button, DatePicker, Modal, Popconfirm, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, ExportOutlined, ImportOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}
interface HistoryMap {
  [date: string]: number;
}

interface ExportData {
  todos: Todo[];
  history: HistoryMap;
}

function TodoList(): JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [history, setHistory] = useState<HistoryMap>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);

  // 从 localStorage 加载数据
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    const storedHistory = localStorage.getItem('history');

    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }

    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    } else {
      setHistory({
        [dayjs().format('YYYY-MM-DD')]: 0,
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleAddTodo = useCallback(() => {
    if (inputValue.trim()) {
      const today = dayjs().format('YYYY-MM-DD');
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        createdAt: today,
      };

      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setInputValue('');

      setHistory((prevHistory) => ({
        ...prevHistory,
        [today]: (prevHistory[today] || 0) + 1,
      }));
    }
  }, [inputValue]);

  const toggleComplete = useCallback((id: number) => {
    setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }, []);

  const clearAllTodos = useCallback(() => {
    setTodos([]);
  }, []);

  const exportData = useCallback(() => {
    const data: ExportData = {
      todos,
      history,
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-backup-${dayjs().format('YYYY-MM-DD')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [todos, history]);

  const importData = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData;
        if (data.todos && data.history) {
          setTodos(data.todos);
          setHistory(data.history);
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const filteredTodos = useMemo(() => {
    if (!dateFilter) return todos;
    const date = dateFilter.format('YYYY-MM-DD');
    return todos.filter((todo) => todo.createdAt === date);
  }, [todos, dateFilter]);

  const sortedHistory = useMemo(() => {
    return Object.entries(history)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, count]) => ({ date, count }));
  }, [history]);

  return (
    <div className="h-[440px] bg-[rgba(223,242,235,0.95)] dark:bg-[rgba(26,54,54,0.95)] text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)] p-4 rounded-lg ">
      <Space.Compact className=" w-full mb-4">
        <Input
          placeholder="添加新任务..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleAddTodo}
          className="mr-2 bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(0,0,0,0.6)] border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)]"
        />
        <Button
          onClick={handleAddTodo}
          className="bg-[rgba(122,178,211,0.85)] dark:bg-[rgba(64,83,76,0.9)] border-none text-white hover:bg-[rgba(74,98,138,0.95)] dark:hover:bg-[rgba(103,125,106,0.85)]"
          icon={<PlusOutlined />}
        />
      </Space.Compact>

      <Space.Compact className="mb-4 w-full">
        <DatePicker
          placeholder="按日期筛选"
          onChange={setDateFilter}
          value={dateFilter}
          allowClear
          className="flex-1 bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(0,0,0,0.6)] border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)]"
        />

        <Button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-[rgba(203,220,235,0.85)] dark:bg-[rgba(98,149,132,0.3)] border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)] text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)]"
        >
          历史
        </Button>
        <Button
          onClick={exportData}
          icon={<ExportOutlined />}
          className="bg-[rgba(203,220,235,0.85)] dark:bg-[rgba(98,149,132,0.3)] border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)] text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)]"
        />
        <Button
          className="bg-[rgba(203,220,235,0.85)] dark:bg-[rgba(98,149,132,0.3)] border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)] text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)] relative"
          icon={<ImportOutlined />}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".json"
            onChange={importData}
          />
        </Button>
        <Popconfirm
          title="确定要清空所有任务吗？"
          onConfirm={clearAllTodos}
          okText="是"
          cancelText="否"
        >
          <Button
            icon={<DeleteOutlined />}
            className="bg-[rgba(203,220,235,0.85)] dark:bg-[rgba(98,149,132,0.3)] border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)] text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)] hover:text-red-500"
            danger
          />
        </Popconfirm>
      </Space.Compact>

      <div className={'overflow-y-auto max-h-[310px] transition-colors border-t border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0'}>
        {filteredTodos.length === 0 ? (
          <div className="text-center py-4 text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)]">暂无任务</div>
        ) : (
          <div>
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center py-2 border-b border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)]
                  transition-colors hover:bg-[rgba(203,220,235,0.85)] dark:hover:bg-[rgba(98,149,132,0.3)] o
                 "
              >
                <div
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => toggleComplete(todo.id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      todo.completed ? 'bg-[rgba(40,167,69,0.9)] dark:bg-[rgba(40,167,69,0.75)] border-[rgba(40,167,69,0.9)] dark:border-[rgba(40,167,69,0.75)]' : 'border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)]'
                    }`}
                  >
                    {todo.completed && <CheckOutlined className="text-white text-xs" />}
                  </div>
                </div>

                <div
                  className={`flex-grow px-3 cursor-pointer ${todo.completed ? 'line-through text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)]' : ''}`}
                  onClick={() => toggleComplete(todo.id)}
                >
                  {todo.text}
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xs text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)] mr-2">{todo.createdAt}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)] hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={<span className="text-[rgba(74,98,138,0.95)] dark:text-[rgba(98,149,132,0.8)]">每日任务历史</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="history-modal"
      >
        <div className="max-h-60 overflow-y-auto">
          {sortedHistory.map((item) => (
            <div
              key={item.date}
              className="flex justify-between py-2 border-b border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)]"
            >
              <span className="text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)]">{item.date}</span>
              <span className="text-[rgba(102,102,102,0.75)] dark:text-[rgba(204,204,204,0.8)]">完成了 {item.count} 个任务</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default TodoList;
