import {ReactNode} from "react";
import NotFound from "next/dist/client/components/not-found-error";

interface EmptyBoardProps {
  text?: string;
  icon?: ReactNode;
}

export default function EmptyBoard(props: EmptyBoardProps) {
  const {text, icon} = props;
  return (
    <div className={'h-full w-full flex align-middle justify-center flex-col'}>
      <div
        className={'flex justify-center items-center'}
      >
        {icon}
      </div>
      <div
        className={'text-center'}
      >
        <p
          style={{color: 'var(--color-text-secondary)'}}
        >{text || 'Nothing here ...'}</p>
      </div>
    </div>
  )
}
