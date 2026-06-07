import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import WebSiteAnalyze from '@/Components/WebSiteAnalyze';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: '🚣‍♀️划水网 - 一个划水的网站',
  description: '划水网是一个划水的网站, 专注于提供热榜新闻, 帮助你在上班摸鱼的时候了解最新的热搜榜单',
  keywords: [
    '划水',
    '水',
    '网站',
    '热榜',
    '新闻',
    '新闻热榜',
    '今日热榜',
    '今日热榜新闻',
    '今日热榜新闻热榜',
    '热搜',
    '热搜榜',
    '今日热搜',
    '今日热搜榜',
    '微博热搜',
    '今日头条',
    '贴吧热搜',
    '知乎热榜',
    '虎扑热榜',
    '豆瓣热榜',
    'bilibili热榜',
    '抖音热榜',
    'IT之家热榜',
  ],
};

function computedTheme(): string {
  const month = new Date().getMonth() + 1;
  let autoTheme = 'default';

  // 春季主题 (3-5月)
  if (month >= 3 && month <= 5) {
    autoTheme = 'spring';
  }
  // 夏季主题 (6-8月)
  else if (month >= 6 && month <= 8) {
    autoTheme = 'summer';
  }
  // 秋季主题 (9-11月)
  else if (month >= 9 && month <= 11) {
    autoTheme = 'autumn';
  }
  // 冬季使用默认主题 (12-2月)

  return autoTheme;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const code = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-N76Z7R9X');
  `;

  return (
    <html
      lang="en"
      className={'h-full'}
      data-theme={computedTheme()}
    >
      <head>
        <meta httpEquiv="refresh" content="0;url=https://i.huashui.cc" />
        <script dangerouslySetInnerHTML={{ __html: 'window.location.href="https://i.huashui.cc";' }} />
        <script dangerouslySetInnerHTML={{ __html: code }} />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <AntdRegistry>{children}</AntdRegistry>
        <SpeedInsights />
        <Analytics />
      </body>
      <WebSiteAnalyze />
    </html>
  );
}
