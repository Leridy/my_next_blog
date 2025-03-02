// client component
'use client';
import { useMemo } from 'react';
import './index.style.scss';
import dynamic from 'next/dynamic';

interface AvatarProps {
  name: string;
  src?: string;
  size?: keyof typeof AvatarSize;
  onClick?: () => void;
}

enum AvatarSize {
  small = 30,
  medium = 50,
  large = 80,
}

let hash = 0;

/**
 * generate a color based on the string
 * @param str
 */
const generateColorByString = (str: string = 'ABC') => {
  hash = str.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();

  return `#${'00000'.substring(0, 6 - c.length)}${c}`;
};

const avatarFontColor = () => {
  return '#fff';
};

const avatarFontFamily = () => {
  const fontFamily = [
    'Microsoft Yahei',
    'SimHei',
    'KaiTi',
    'FangSong',
    'Arial',
    'sans-serif',
  ];
  return fontFamily[hash % fontFamily.length];
};

const avatarFontWeight = () => {
  const fontWeight = ['normal', 'bold', 'bolder', 'lighter'];
  return fontWeight[hash % fontWeight.length];
};

const avatarFontStyle = () => {
  const fontStyle = ['normal', 'italic', 'oblique'];
  return fontStyle[hash % fontStyle.length];
};

/**
 * Avatar component
 * @param props
 * @constructor
 * @description
 * if src is not provided, use user name to generate a gravatar
 * the avatar background color should be based on the user name
 * and the content of the avatar should be the first letter of the user name
 *
 */
function Avatar(props: AvatarProps) {
  const { name, src, size, onClick } = props;

  const avatarSize = useMemo(() => {
    return AvatarSize[size || 'small'];
  }, [size]);

  const avatarSrc = useMemo(() => {
    if (src || !document) {
      return src;
    }

    // generate a base64 image from the user name
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return '';
    }

    canvas.width = avatarSize * 8;
    canvas.height = avatarSize * 8;
    context.fillStyle = generateColorByString(name);
    context.fillRect(0, 0, avatarSize * 8, avatarSize * 8);
    context.font = `${avatarSize * 6}px ${avatarFontFamily()} ${avatarFontWeight()} ${avatarFontStyle()}`;

    context.fillStyle = avatarFontColor();
    context.textAlign = 'center';

    context.fillText(
      (name || '客')[0].toUpperCase(),
      avatarSize * 4,
      avatarSize * 6.1
    );
    return canvas.toDataURL();
  }, [name, src, avatarSize]);

  return (
    <div
      className="flex items-center justify-center rounded-full avatar"
      style={{ width: avatarSize, height: avatarSize }}
      onClick={onClick}
    >
      <img
        className="cursor-pointer rounded"
        src={avatarSrc}
        alt={name}
        width={avatarSize}
        height={avatarSize}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(Avatar), {
  ssr: false,
});
