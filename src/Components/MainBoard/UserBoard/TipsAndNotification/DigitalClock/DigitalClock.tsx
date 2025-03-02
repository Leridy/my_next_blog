import { useEffect, useState } from 'react';

interface DigitalClockProps {
  title?: string;
  showDate?: boolean;
  showTitle?: boolean;
}

export default function DigitalClock(props: DigitalClockProps) {
  const { title, showDate, showTitle } = props;

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    function loop() {
      setTime(new Date());
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }, []);

  return (
    <div className={'items-center grid grid-rows-2 mb-4'}>
      {showTitle && <h1 className={'text-2xl font-bold'}>{title || 'Digital Clock'}</h1>}
      {showDate && <span className={'text-2xl font-bold'}>{time.toLocaleDateString()}</span>}
      <span className={'text-2xl font-bold'}>{time.toLocaleTimeString()}</span>
    </div>
  );
}
