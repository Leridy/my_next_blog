import { Button, Form } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { useForm } from 'antd/es/form/Form';
import { useCallback } from 'react';

interface FilterFormProps<T> {
  onSearch?: (params: Partial<T>) => void;
  children: React.ReactNode;
}

export default function FilterForm<T>(props: FilterFormProps<T>) {
  const { onSearch, children } = props;
  const [form] = useForm<Partial<T>>();

  const handleSearch = useCallback(async () => {
    const result = await form.validateFields();
    Object.keys(result).forEach((key) => {
      if (key === 'updatedAt' || key === 'createdAt') {
        // @ts-expect-error may their have
        result[key] = result[key]?.toISOString() || undefined;
      }
    });
    onSearch?.(result);
  }, [form, onSearch]);

  const handleReset = useCallback(() => {
    form.resetFields();
    handleSearch();
  }, [form, handleSearch]);

  return (
    <Form
      layout={'inline'}
      form={form}
    >
      {children}
      <FormItem>
        <Button
          type={'primary'}
          onClick={handleSearch}
        >
          查询
        </Button>
        <Button
          className={'ml-2'}
          type={'default'}
          onClick={handleReset}
        >
          重置
        </Button>
      </FormItem>
    </Form>
  );
}
