import {Button, Space} from "antd";
import type {ButtonProps} from "antd";

interface LoginBoxProps extends ButtonProps {
  onClick?: () => void;
}

export default function LoginBox(props: LoginBoxProps) {
  const {onClick} = props;
  return (
    <Space
      direction="horizontal"
    >
      <Button type="primary"
              onClick={onClick}
      >登录</Button>
      <Button
        type={'default'}
      >注册</Button>
    </Space>
  )
}
