import {useCallback, useState} from "react";
import {User} from "@prisma/client";
import {getUsers} from "@/app/manage/user/hooks/api";

export default function useUserData() {
  const [users, setUsers] = useState<Omit<User, 'password'>[] >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetch = useCallback(async (query: Partial<User> = {}) => {
    setLoading(true);
    try {
      const users = await getUsers(query);
      setUsers(users);
    } finally {
      setLoading(false);
    }

  }, []);

  return {
    users,
    fetch,
    loading,
  }
}
