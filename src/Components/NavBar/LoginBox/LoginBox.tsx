import { Button, Space } from 'antd';
import { useUserContext } from '@/Provider/UserProvider';

export default function LoginBox() {
  const { showModal } = useUserContext();

  return (
    <Space direction="horizontal">
      <Button
        type="primary"
        onClick={() => showModal(true)}
      >
        登录
      </Button>
      <Button
        type={'default'}
        onClick={() => showModal(false)}
      >
        注册
      </Button>
    </Space>
  );
}
