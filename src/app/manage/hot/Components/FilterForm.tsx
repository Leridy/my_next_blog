import {Button, DatePicker, Form, Input} from "antd";
import {useForm} from "antd/es/form/Form";
import FormItem from "antd/es/form/FormItem";
import {HotTopic} from "@prisma/client";

interface FilterFormProps {
  onSearch?: (params: Partial<HotTopic>) => void;
}

export default function FilterForm(props: FilterFormProps) {
  const {onSearch} = props;
  const [form] = useForm<Partial<HotTopic>>();

  const handleSearch = async () => {
    const result = await form.getFieldsValue();
    onSearch?.(result);
  }

    const handleReset = () => {
        form.resetFields();
        handleSearch();
    }

  return (
    <Form
      layout={"inline"}
      form={form}
    >
      <FormItem
        label={"栏目名称"}
        name={"name"}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"栏目描述"}
        name={"description"}
      >
        <Input/>
      </FormItem>

      <FormItem>
        <Button type={"primary"} onClick={handleSearch}>查询</Button>
        <Button className={'ml-2'} type={'default'} onClick={handleReset}>重置</Button>
      </FormItem>
    </Form>
  )
}
