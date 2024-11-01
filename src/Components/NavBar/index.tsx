import UserBox from "./UserBox/UserBox";
import {Input} from "antd";
import {UserProvider, useUserContext} from "@/Provider/UserProvider";
import {useCallback, useEffect, useRef, useState} from "react";
import useUserAuthData, {UserInfo} from "@/Components/UserComponents/hooks/useUserAuthData";

interface NavBarProps {
  onSearch?: (value: string) => void;
}


export default function NavBar(props: NavBarProps) {
  const {onSearch} = props;
  const tryTime = useRef(0);

  const {loading, requestUserInfo} = useUserAuthData();

  const {setUser, user} = useUserContext()


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value.split(' ').join(''));
  }

  const handleInitialUserInfo = useCallback(async () => {
    if (user || tryTime.current > 1) return;
    try {
      const result = await requestUserInfo();
      setUser(result);
      tryTime.current = 0;
    } catch (e) {
      tryTime.current++;
    }

  }, [requestUserInfo, user]);

  useEffect(() => {
    handleInitialUserInfo();
  }, [handleInitialUserInfo])

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
    </nav>
  )
}
