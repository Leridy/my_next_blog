import {CSSProperties, ReactNode, useMemo} from "react";
import './Card.style.scss'

export interface CardProps {
  header?: ReactNode;
  style?: CSSProperties;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function UserCard(props: CardProps) {
  const {header, style, actions, children} = props;

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
    )
  }, [header]);

  const renderAction = useMemo(
    () => {
      return (
        <div>
          action
        </div>
      )
    }, []
  )

  return (
    <div
      className={'p-4 rounded-lg shadow-md flex-col card'}
      style={{
        background: 'var(--color-card-background)',
        height: '20vh',
        ...style
      }}
    >
      {header && renderHeader}
      <div className={'pt-2 pb-2'}>
        {children}
      </div>
      {actions && renderAction}
    </div>
  )
}
