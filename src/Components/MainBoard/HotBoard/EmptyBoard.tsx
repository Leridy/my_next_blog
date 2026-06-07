import { ReactNode } from 'react';
import './EmptyBoard.styles.scss';

interface EmptyBoardProps {
  text?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export default function EmptyBoard(props: EmptyBoardProps) {
  const { text, icon, loading } = props;
  return (
    <div className={` select-none h-full w-full flex align-middle justify-center flex-col ${loading ? 'empty-board-loading' : ''}`}>
      <div className={'flex justify-center items-center mb-2'}>
        {icon || (
          <img
            src={'/icons/empty.svg'}
            alt={'empty'}
            style={{
              width: '100px',
              height: '100px',
              color: 'var(--color-text-secondary)',
            }}
          />
        )}
      </div>
      <div className={'text-center'}>
        <p style={{ color: 'var(--color-text-secondary)' }}>{text || 'Nothing here ...'}</p>
      </div>
    </div>
  );
}
