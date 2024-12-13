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
        <div
          className={'flex justify-center items-center absolute bottom-0 left-0 w-full rounded-b-lg overflow-hidden card-action-part'}
        >
          {actions}
        </div>
      )
    }, [actions]
  )

  return (
    <div
      className={'flex p-4 rounded-lg shadow-md flex-col card relative'}
      style={{
        background: 'var(--color-card-background)',
        minHeight: '20vh',
        ...style
      }}
    >
      {header && renderHeader}
      <div className={'pt-2 pb-2 flex-1'}>
        {children}
      </div>
      {actions && renderAction}
    </div>
  )
}
