/**
 * 使用 canvas 和 音频上下文生成浏览器指纹
 */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import useApi from "@/app/manage/hooks/useApi";


export default function BrowserFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('');

  const headers = useMemo(() => ({
    'x-ignore-error': 'true'
  }), []);

  const {create} = useApi({
    apiURL: 'fingerprint',
    headers
  })

  const generateFingerprint = useCallback(() => {
    const canvas = document.getElementById('fingerprint') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const audioCtx = new AudioContext();

    const fgp = [
      navigator.userAgent,
      navigator.platform,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
      navigator.doNotTrack,
      audioCtx.sampleRate,
      audioCtx.currentTime,
      audioCtx.destination.maxChannelCount,
      audioCtx.destination.channelCount,
      audioCtx.destination.maxChannelCount,
      audioCtx.destination.numberOfInputs,
      audioCtx.destination.numberOfOutputs,
      audioCtx.destination.channelCountMode,
      audioCtx.destination.channelInterpretation,
    ].join('');

    const hash = new TextEncoder().encode(fgp);
    crypto.subtle.digest('SHA-256', hash).then((result) => {
      const hashArray = Array.from(new Uint8Array(result));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      ctx.font = '16px Arial';
      ctx.fillText(hashHex, 10, 50);
    });

    const result = canvas.toDataURL();
    setFingerprint(result);

  }, []);

  useEffect(() => {
    generateFingerprint();
  }, [generateFingerprint]);

  useEffect(() => {
    if (!fingerprint) return;
    console.log('fingerprint', fingerprint);
    create({fingerprint});
    setFingerprint('');
  }, [create, fingerprint]);

  return (
    <canvas
      id="fingerprint" width="200" height="200"
      // style={{display: 'none'}}
    />
  )
}
