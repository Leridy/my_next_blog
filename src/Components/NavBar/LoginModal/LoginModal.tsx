import {useState} from "react";
import {Form, Input, Modal} from "antd";
import FormItem from "antd/es/form/FormItem";
import Password from "antd/es/input/Password";

export default function LoginModal() {
  const [visible, setVisible] = useState<boolean>(false);

  const handleOk = () => {
    setVisible(false);
  }

  const handleCancel = () => {
    setVisible(false);
  }

  const handleLogin = () => {
    setVisible(true);
  }

  return (
    <>
      <Modal
        title="登录"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          layout={'vertical'}
        >
          <FormItem
            label={"用户名"}
            name={"username"}
          >
            <Input/>
          </FormItem>
          <FormItem
            label={"密码"}
            name={"password"}
          >
            <Password/>
          </FormItem>
        </Form>
      </Modal>
    </>
  )
}
