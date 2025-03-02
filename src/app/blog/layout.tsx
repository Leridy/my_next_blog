import { Breadcrumb, Layout } from 'antd';
import { Header, Content } from 'antd/es/layout/layout';
import '../globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的博客',
  description: "LERIDY'S BLOG",
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Layout className={'h-full'}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: 'var(--color-primary)',
            marginRight: 8,
          }}
        />
        <div className="text-white text-2xl mr-2">LERIDY&#39;S BLOG</div>
      </Header>
      <Layout>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb
            items={[]}
            style={{ margin: '16px 0' }}
          />
          <Content>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
