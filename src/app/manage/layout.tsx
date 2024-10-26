import {Breadcrumb, Layout, Menu, MenuProps} from "antd";
import {Header, Content} from "antd/es/layout/layout";
import NavMenu from "./Components/NavMenu";
import SideMenu from "./Components/SideMenu";
import "../globals.css";
import type {ReactNode} from "react";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "管理后台",
  description: "划水网管理后台",
};

export default function ManageLayout({children}: Readonly<{
  children: ReactNode;
}>) {

  return (
    <Layout className={'h-full'}>
      <Header
        style={{display: 'flex', alignItems: 'center'}}
      >
        <div
          style={{width: 32, height: 32, background: 'var(--color-primary)', marginRight: 8}}
        />
        <div className="text-white text-2xl mr-2">划水管理平台</div>
        <NavMenu/>
      </Header>
      <Layout>

        <SideMenu/>

        <Layout style={{padding: '0 24px 24px'}}>
          <Breadcrumb
            items={[]}
            style={{margin: '16px 0'}}
          />

          <Content>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}
