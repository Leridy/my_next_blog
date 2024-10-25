import UserBox from "./UserBox";
import {Input} from "antd";

export default function NavBar() {
  return (
    // 分成一行四列
    <nav
      className="grid w-full p-4 text-white grid-cols-3 gap-4 items-center fixed"
      style={{background: 'var(--color-navbar-background)'}}
    >
      <h1 className="text-2xl font-bold">摸鱼吧</h1>
      <Input placeholder="搜索..."/>
      <UserBox/>
    </nav>
  )
}
