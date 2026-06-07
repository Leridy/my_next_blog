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
    <div className="h-[440px] bg-[var(--color-transparent-background)] text-[var(--color-text)] p-4 rounded-lg">
      <Space.Compact className="w-full mb-4">
        <Input
          placeholder="添加新任务..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleAddTodo}
          className="mr-2 bg-[var(--color-editor-background)] border-[var(--color-border)]"
        />
        <Button
          onClick={handleAddTodo}
          className="bg-[var(--color-primary)] border-none text-[var(--color-text-light)] hover:bg-[var(--color-primary-transparent)]"
          icon={<PlusOutlined />}
        />
      </Space.Compact>

      <Space.Compact className="mb-4 w-full">
        <DatePicker
          placeholder="按日期筛选"
          onChange={setDateFilter}
          value={dateFilter}
          allowClear
          className="flex-1 bg-[var(--color-editor-background)] border-[var(--color-border)]"
        />

        <Button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-[var(--color-card-background)] border-[var(--color-border)] text-[var(--color-text)]"
        >
          历史
        </Button>
        <Button
          onClick={exportData}
          icon={<ExportOutlined />}
          className="bg-[var(--color-card-background)] border-[var(--color-border)] text-[var(--color-text)]"
        />
        <Button
          className="bg-[var(--color-card-background)] border-[var(--color-border)] text-[var(--color-text)] relative"
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
            className="bg-[var(--color-card-background)] border-[var(--color-border)] text-[var(--color-text)] hover:text-red-500"
            danger
          />
        </Popconfirm>
      </Space.Compact>

      <div className="overflow-y-auto max-h-[310px] transition-colors border-t border-[var(--color-border)]">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-4 text-[var(--color-text-secondary)]">暂无任务</div>
        ) : (
          <div>
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center py-2 border-b border-[var(--color-border)]
                  transition-colors hover:bg-[var(--color-hot-border-background)]"
              >
                <div
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => toggleComplete(todo.id)}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${todo.completed ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'border-[var(--color-border)]'}`}>
                    {todo.completed && <CheckOutlined className="text-white text-xs" />}
                  </div>
                </div>

                <div
                  className={`flex-grow px-3 cursor-pointer ${todo.completed ? 'line-through text-[var(--color-text-secondary)]' : ''}`}
                  onClick={() => toggleComplete(todo.id)}
                >
                  {todo.text}
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xs text-[var(--color-text-secondary)] mr-2">{todo.createdAt}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-[var(--color-text-secondary)] hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
        title={<span className="text-[var(--color-primary)]">每日任务历史</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <div className="max-h-[400px] overflow-auto">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-4 text-[var(--color-text-secondary)]">暂无历史记录</div>
          ) : (
            <div className="space-y-2">
              {sortedHistory.map(({ date, count }) => (
                <div
                  key={date}
                  className="flex justify-between items-center p-2 hover:bg-[var(--color-hot-border-background)] rounded"
                >
                  <span>{date}</span>
                  <span className="bg-[var(--color-primary-transparent)] text-[var(--color-text)] px-2 py-1 rounded-full text-xs">{count} 任务</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default TodoList;
