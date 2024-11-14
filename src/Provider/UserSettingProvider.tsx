import useLocalStorage from "@/Components/hooks/useLocalStorage";
import React, {useState} from "react";


export interface TopicSetting {
  order: Record<number, number>
  exclude: number[]
}

interface UserSettingContextType {
  topicSetting: TopicSetting;
  updateTopicSetting: (topic:TopicSetting ) => void;
  topicSettingMode: boolean;
  setTopicSettingMode: (mode: boolean) => void;
}

const UserSettingContext = React.createContext<UserSettingContextType | undefined>(undefined);

interface UserSettingProviderProps {
  children: React.ReactNode;
}

export const UserSettingProvider = (props: UserSettingProviderProps) => {
  const {children} = props;
  const [topicSettingMode, setTopicSettingMode] = useState(false);
  const {value: TopicSetting, setValue} = useLocalStorage<TopicSetting>({
    key: 'TopicSetting',
    initialValue: {
      order: {},
      exclude: []
    }
  });


  return (
    <UserSettingContext.Provider value={{
      topicSetting: TopicSetting,
      updateTopicSetting: setValue,
      topicSettingMode,
      setTopicSettingMode
    }}>
      {children}
    </UserSettingContext.Provider>
  )
}

export default UserSettingProvider

export function useUserSettingContext() {
  const context = React.useContext(UserSettingContext);
  if (context === undefined) {
    throw new Error('useUserSetting must be used within a UserSettingProvider');
  }
  return context;
}
