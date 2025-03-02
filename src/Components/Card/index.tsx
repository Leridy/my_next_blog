import {
  CSSProperties,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import './Card.style.scss';

export interface CardProps {
  header?: ReactNode;
  style?: CSSProperties;
  className?: string;
  actions?: ReactNode;
  children?: ReactNode;
  couldInteract?: boolean; // 是否展示鼠标交互
}

export default function UserCard(props: CardProps) {
  const { header, style, actions, children, className } = props;

  // 鼠标交互状态
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number | null>(null);

  // 鼠标移动处理

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!boardRef.current) {
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        setPosition({ x, y });
        requestRef.current = null;
      });
    }
  }, []);

  // 计算卡片变换样式
  const cardStyle = useMemo(() => {
    const baseStyle = {
      willChange: 'transform, box-shadow',
    };

    const width = boardRef.current?.offsetWidth || 0;
    const height = boardRef.current?.offsetHeight || 0;

    return {
      ...baseStyle,
      transform: isHovered
        ? `perspective(1000px) 
           rotateX(${(position.y - height / 2) / 40}deg) 
           rotateY(${-(position.x - width / 2) / 40}deg)
           translateZ(10px)`
        : 'translateY(0)',
      transition: 'all 0.2s ease-out',
      boxShadow: isHovered
        ? `
            ${(position.x - width / 2) / 40}px 
           ${(position.y - height / 2) / 40}px 
           30px rgba(0,0,0,0.5)`
        : '0px 5px 15px rgba(0,0,0,0.1)',
    };
  }, [position, isHovered]);

  const renderHeader = useMemo(() => {
    return (
      <div
        className={'flex justify-between items-center font-bold'}
        style={{
          animationDelay: '0.1s',
        }}
      >
        {header}
      </div>
    );
  }, [header]);

  const renderAction = useMemo(() => {
    return (
      <div
        className={
          'flex justify-center items-center absolute bottom-0 left-0 w-full rounded-b-lg overflow-hidden card-action-part'
        }
      >
        {actions}
      </div>
    );
  }, [actions]);

  return (
    <div
      ref={boardRef}
      className={`flex p-4 rounded-lg shadow-md flex-col card relative ${className}`}
      style={{
        background: 'var(--color-card-background)',
        minHeight: '20vh',
        ...cardStyle,
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {header && renderHeader}
      <div className={'pt-2 pb-2 flex-1'}>{children}</div>
      {actions && renderAction}
    </div>
  );
}
