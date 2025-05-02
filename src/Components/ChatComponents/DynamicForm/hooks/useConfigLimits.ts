import { Configuration, ConfigurationType } from '@/IndexedDB/AIChat/types';
import { message } from 'antd';

export const useConfigLimits = (configurations: Configuration[]) => {
  const canAddConfig = (type: ConfigurationType): boolean => {
    switch (type) {
      case 'prompt':
        if (configurations.some((c) => c.type === 'prompt')) {
          message.warning('只能添加一个prompt配置');
          return false;
        }
        return true;

      case 'resume':
        if (configurations.filter((c) => c.type === 'resume').length >= 2) {
          message.warning('最多只能添加两份简历');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  return { canAddConfig };
};
