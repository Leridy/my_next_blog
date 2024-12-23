'use client';
import {ReactNode, useMemo} from "react";
import {FileTextOutlined} from "@ant-design/icons";
import Image from "next/image";

interface BrandIconProps {
  src: ReactNode;
  size?: number
}

/**
 * BrandIcon Component
 * @constructor
 * @description 这个组件是用来展示品牌图标的，你需要传入以下信息，然后这个组件会展示出来
 */

export default function BrandIcon(props: BrandIconProps) {
  const {src, size = 20} = props;

  const iconSrc = useMemo(
    () => {
      // if src starts with http, use return an img tag
      if (typeof src === 'string' && src.startsWith('http')) {
        return (
          <img
            src={src}
            alt={'icon'}
            style={{
              width: size,
              height: size
            }}
          />
        )
      }

      // if src is a string check it in our icon list
      if (typeof src === 'string') {
        switch (src) {
          case 'weibo':
          case 'tiktok':
          case 'github':
          case 'zhihu':
          case 'ithome':
          case 'juejin':
          case 'v2ex':
          case 'toutiao': // https://www.toutiao.com/
          case 'zol': // https://www.zol.com.cn/
          case '36kr': // https://36kr.com/
          case 'hupu':
          case 'sina':
          case 'huxiu': // https://www.huxiu.com/
          case 'smzdm': // https://www.smzdm.com/
          case 'douban': // https://www.douban.com/
          case 'bilibili': // https://www.bilibili.com/
          case 'pengpai': // https://www.thepaper.cn/
          case 'ifanr': // https://www.ifanr.com/
          case 'sspai': // https://sspai.com/
          case 'tieba': // https://tieba.baidu.com/
          case '51cto': // https://www.51cto.com/
          case 'coolapk': // https://www.coolapk.com/
          case 'weread': // https://weread.qq.com/
          case 'lottery': // https://m.500.com/
          case 'QQNews': // https://news.qq.com/
          case 'geekpark': // https://www.geekpark.net/
            return <Image src={`/icons/${src}.svg`} alt={src} width={size} height={size}/>;
          default:
            return <FileTextOutlined size={size}/>
        }
      }
    },
    [size, src]
  )


  return (
    <div
      className={`flex justify-center items-center rounded-{${size}/2}`}
      style={{
        width: size,
        height: size
      }}
    >
      {iconSrc}
    </div>
  )
}


