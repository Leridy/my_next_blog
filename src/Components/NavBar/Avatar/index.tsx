// client component
'use client'
import {useMemo} from "react";

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

/**
 * generate a color based on the string
 * @param str
 */
const generateColorByString = (str: string = 'ABC') => {
    const hash = str.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const c = (hash & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return `#${'00000'.substring(0, 6 - c.length)}${c}`;
}

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
export default function Avatar(props: AvatarProps) {
  const {name,src, size, onClick} = props;

  const avatarSize = useMemo(() => {
    return AvatarSize[size || 'small'];
  }, [size]);

  const avatarSrc = useMemo(() => {
    if (src) {
      return src;
    }

    // generate a base64 image from the user name
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return '';
    }

    canvas.width = avatarSize;
    canvas.height = avatarSize;
    context.fillStyle = generateColorByString(name);
    context.fillRect(0, 0, avatarSize, avatarSize);
    context.font = `${avatarSize / 2}px Arial`;
    context.fillStyle = 'white';
    context.textAlign = 'center';

    context.fillText(name[0].toUpperCase(), avatarSize / 2, avatarSize / 1.5);
    return canvas.toDataURL();
  }, [name, src, avatarSize]);

  return (
    <div
      className="flex items-center justify-center rounded-full "
      style={{width: avatarSize, height: avatarSize}}
      onClick={onClick}
    >
      <img
        className="rounded-full cursor-pointer"
        src={avatarSrc} alt={name} width={avatarSize} height={avatarSize}/>
    </div>
  );
}
