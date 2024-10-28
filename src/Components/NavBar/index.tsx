'use client'
import UserBox from "./UserBox";
import {Input} from "antd";
import LoginBox from "@/Components/NavBar/LoginBox";
import LoginModal from "@/Components/NavBar/LoginModal/LoginModal";

interface NavBarProps {
  onSearch?: (value: string) => void;
}

export default function NavBar(props: NavBarProps) {
  const {onSearch} = props;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value.split(' ').join(''));
  }

  return (
    // 分成一行四列
    <nav
      className="grid w-full p-4 text-white grid-cols-3 gap-4 items-center fixed"
      style={{background: 'var(--color-navbar-background)'}}
    >
      <h1 className="text-2xl font-bold">划水网</h1>
      <Input
        placeholder="在本页筛选..."
        onChange={handleSearch}
      />
      <UserBox/>
      <LoginModal />
    </nav>
  )
}
