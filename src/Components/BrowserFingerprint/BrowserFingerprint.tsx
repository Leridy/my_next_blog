/**
 * 使用 canvas 和 音频上下文生成浏览器指纹
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useApi from '@/app/manage/hooks/useApi';

interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export default function BrowserFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('');

  const headers = useMemo(
    () => ({
      'x-ignore-error': 'true',
    }),
    []
  );

  const { create } = useApi({
    apiURL: 'fingerprint',
    headers,
  });

  const generateFingerprint = useCallback(() => {
    const canvas = document.getElementById('fingerprint') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const audioCtx = new AudioContext();

    // 绘制一些随机图形来增加指纹唯一性
    ctx.fillStyle = '#f60';
    ctx.fillRect(10, 10, 100, 30);
    ctx.strokeStyle = '#0f0';
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(100, 100);
    ctx.stroke();
    ctx.fillStyle = '#0ff';
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.fill();

    // 获取更多浏览器和系统信息
    const plugins = Array.from(navigator.plugins).map((p) => p.name);
    const mimeTypes = Array.from(navigator.mimeTypes).map((m) => m.type);
    const screenInfo = {
      pixelDepth: screen.pixelDepth,
      orientation: screen.orientation?.type,
    };

    let connectionInfo: NetworkInformation | undefined;
    if ('connection' in navigator) {
      const connection = navigator.connection as NetworkInformation;
      connectionInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }

    // 获取 WebGL 信息
    const gl = canvas.getContext('webgl');
    const glInfo = gl
      ? {
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          version: gl.getParameter(gl.VERSION),
        }
      : {};

    // 获取字体列表
    const fonts = [
      'Arial',
      'Times New Roman',
      'Courier New',
      'Georgia',
      'Verdana',
      'Geneva',
      'Trebuchet MS',
      // 微软字体
      'Microsoft YaHei',
      'SimSun',
      'SimHei',
      'Microsoft JhengHei',
      'Microsoft JhengHei',
      // 苹果字体
      'PingFang SC',
      'Hiragino Sans GB',
      'Heiti SC',
      'STHeiti',
      'Apple LiGothic',
      'Apple LiSung',
      // 谷歌字体
      'Noto Sans SC',
      'Noto Sans TC',
      'Noto Sans JP',
      'Noto Sans KR',
      'Noto Sans Arabic',
      'Noto Sans Hebrew',
      'Helvetica',
      'Comic Sans MS',
      'Impact',
      'Tahoma',
    ].filter((font) => document.fonts.check(`12px "${font}"`));

    const fgp = [
      ...plugins,
      ...mimeTypes,
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
      JSON.stringify(screenInfo),
      JSON.stringify(connectionInfo),
      JSON.stringify(glInfo),
      fonts.join(','),
      canvas.toDataURL(), // 将画布内容也作为指纹的一部分
    ];

    const hash = new TextEncoder().encode(fgp.join(''));
    crypto.subtle.digest('SHA-256', hash).then((result) => {
      const hashArray = Array.from(new Uint8Array(result));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setFingerprint(hashHex);
    });
  }, []);

  useEffect(() => {
    generateFingerprint();
  }, [generateFingerprint]);

  useEffect(() => {
    if (!fingerprint) return;
    create({ fingerprint });
    setFingerprint('');
  }, [create, fingerprint]);

  return (
    <canvas
      id="fingerprint"
      width="200"
      height="200"
      style={{ display: 'none' }}
    />
  );
}
