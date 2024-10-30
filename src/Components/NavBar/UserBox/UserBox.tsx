'use client';
import Avatar from "@/Components/NavBar/Avatar";
import LoginBox from "../LoginBox/LoginBox";
import {useUser} from "@/Provider/UserProvider";

export default function UserBox() {
  const {user} = useUser();

  return (
    <div
      className='flex justify-end'
    >
      {
        user ? <Avatar name={user.name}/> : <LoginBox/>
      }

    </div>

  )
}
