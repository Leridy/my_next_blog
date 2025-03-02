'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Card from '../../Card';
import UserProfile from '@/Components/MainBoard/UserBoard/UserProfile';
import TipsAndNotification from '@/Components/MainBoard/UserBoard/TipsAndNotification/TipsAndNotification';
import LinksBoard from '@/Components/MainBoard/UserBoard/LinksBoard/LinksBoard';
import CopyrightBoard from '@/Components/MainBoard/UserBoard/CopyrightBoard/CopyrightBoard';
import WoodenFishGame from '@/Components/WoodenFishGame';
import TodoList from '@/Components/TodoList';
import FoodPicker from '@/Components/FoodPicker';
import CommentSystem from '@/Components/CommentsBoard';
import { useUserSettingContext } from '@/Provider/UserSettingProvider';

const BOARD_ORDER_KEY = 'userBoardOrder';

interface DraggableCardProps {
  id: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  isDraggable: boolean;
  children: React.ReactNode;
  header: string;
  style?: React.CSSProperties;
}

const DraggableCard = ({ id, index, moveCard, isDraggable, children, header, style }: DraggableCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: () => ({ id, index }),
    canDrag: () => isDraggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // @ts-expect-error handlerId可能为null

  const [{ handlerId }, drop] = useDrop({
    accept: 'CARD',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    // @ts-expect-error item可能为null
    hover(item: { id: string; index: number }) {
      if (!isDraggable) return;

      if (!drag) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div
      // @ts-expect-error drag可能为null
      ref={(node) => (isDraggable ? drop(drag(node)) : null)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDraggable ? 'move' : 'default',
        transition: 'opacity 0.2s, transform 0.2s',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
      data-handler-id={handlerId}
      className={`${isDraggable ? 'hover:shadow-lg' : ''}`}
    >
      <Card header={header} style={style} className={'mx-2'}>
        {isDraggable ? (
          <div
            className="absolute  inset-0 flex items-center justify-center pointer-events-none hover:opacity-100 transition-opacity duration-200"
            style={{
              backgroundColor: 'rgba(0,0,0,0.03)',
            }}
          >
            <span className="font-medium text-gray-700">点击拖动此卡片</span>
          </div>
        ) : (
          children
        )}
      </Card>
    </div>
  );
};

type CardItem = {
  id: string;
  component: React.ReactNode;
  header: string;
  style?: React.CSSProperties;
};

/**
 * UserBoard
 * @constructor
 * @description 这个组件是用来展示用户信息的,
 */
export default function UserBoard() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const { topicSettingMode: isDraggable } = useUserSettingContext();

  // 初始化卡片数据
  useEffect(() => {
    const initialCards: CardItem[] = [
      {
        id: 'tips',
        component: <TipsAndNotification />,
        header: '',
      },
      {
        id: 'profile',
        component: <UserProfile />,
        header: '',
      },
      {
        id: 'links',
        component: <LinksBoard />,
        header: '友情链接',
      },
      {
        id: 'foodPicker',
        component: <FoodPicker />,
        header: '今天吃什么？',
        style: { minHeight: '530px' },
      },
      {
        id: 'woodenFish',
        component: <WoodenFishGame />,
        header: '敲木鱼',
        style: { minHeight: '400px' },
      },
      {
        id: 'todoList',
        component: <TodoList />,
        header: 'Todo List',
        style: { minHeight: '500px' },
      },
      {
        id: 'comments',
        component: <CommentSystem />,
        header: '留言板',
        style: { minHeight: '850px', overflowY: 'auto' },
      },
      {
        id: 'copyright',
        component: <CopyrightBoard />,
        header: '',
      },
    ];

    // 从localStorage读取排序
    const savedOrder = localStorage.getItem(BOARD_ORDER_KEY);
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder) as string[];
        // 按保存的顺序重排卡片
        const orderedCards = orderIds.map((id) => initialCards.find((card) => card.id === id)).filter(Boolean) as CardItem[];

        // 确保所有卡片都被包含，可能有新增的卡片
        initialCards.forEach((card) => {
          if (!orderedCards.some((c) => c.id === card.id)) {
            orderedCards.push(card);
          }
        });

        setCards(orderedCards);
      } catch (error) {
        console.error('Error parsing saved board order:', error);
        setCards(initialCards);
      }
    } else {
      setCards(initialCards);
    }
  }, []);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const draggedCard = newCards[dragIndex];
      newCards.splice(dragIndex, 1);
      newCards.splice(hoverIndex, 0, draggedCard);

      // 保存新顺序到localStorage
      const orderIds = newCards.map((card) => card.id);
      localStorage.setItem(BOARD_ORDER_KEY, JSON.stringify(orderIds));

      return newCards;
    });
  }, []);

  if (cards.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className={'grid gap-6 h-full overflow-y-scroll user-board'}>
      {cards.map((card, index) =>
        card.header ? (
          <DraggableCard key={card.id} id={card.id} index={index} moveCard={moveCard} isDraggable={isDraggable} header={card.header} style={card.style}>
            {card.component}
          </DraggableCard>
        ) : (
          // 没有header的组件不使用Card包装
          <div key={card.id}>{card.component}</div>
        )
      )}
    </div>
  );
}
