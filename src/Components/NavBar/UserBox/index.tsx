'use client';
import Avatar from "@/Components/NavBar/Avatar";
import LoginBox from "@/Components/NavBar/LoginBox";
import {useCallback, useState} from "react";

export default function UserBox() {
  // login status
  const [isLogin, setIsLogin] = useState(false);
  const handleLogin = useCallback(() => {
    setIsLogin(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLogin(false);
  }, []);

  return (
    <div
        className='flex justify-end'
    >
      {
        isLogin ? <Avatar name={'雷宇笛'} onClick={handleLogout}/> : <LoginBox onClick={handleLogin}/>
      }

    </div>

  )
}
