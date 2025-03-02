'use client';
import { message, Modal } from 'antd';
import ManageForm from '@/app/manage/Components/ManageForm';
import useEditCard from '@/app/manage/hooks/useEditCard';
import { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface ManageFormModalProps {
  titleGroup: {
    create: string;
    edit: string;
  };
  apiURL: string;
  children: React.ReactNode;
}

export interface ManageFormModalRef {
  open: (id?: string) => Promise<void | boolean>;
}

function ManageFormModal<T>(props: ManageFormModalProps, ref: Ref<ManageFormModalRef>) {
  const { titleGroup, apiURL, children } = props;
  const [id, setId] = useState<string | undefined>(undefined);

  // reject ref
  const rejectRef = useRef<(reason?: never) => void>();
  // resolve ref
  const resolveRef = useRef<(value: void | boolean) => void>();

  // open state
  const [visible, setVisible] = useState(false);

  const { cardTitle, handleSubmit, initialValues } = useEditCard<T>({
    titleGroup,
    apiURL,
    id,
  });

  const handleOpen = useCallback(
    (id?: string): Promise<void | boolean> =>
      new Promise((resolve, reject) => {
        setVisible(true);
        setId(id);
        resolveRef.current = resolve;
        rejectRef.current = reject;
      }),
    []
  );

  const handleFormCancel = useCallback(() => {
    setId(undefined);
    setVisible(false);
    rejectRef.current?.();
  }, []);

  const handleFormSubmit = useCallback(
    async (data: Partial<T>) => {
      try {
        const result = await handleSubmit(data);
        resolveRef.current?.(result);
        setId(undefined);
        setVisible(false);
      } catch (e) {
        console.error(e);
        message.error('操作失败');
      }
    },
    [handleSubmit]
  );

  useImperativeHandle<ManageFormModalRef, ManageFormModalRef>(
    ref,
    () => ({
      open: handleOpen,
    }),
    [handleOpen]
  );

  useEffect(() => {
    return () => {
      rejectRef.current = undefined;
      resolveRef.current = undefined;
    };
  }, []);

  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={handleFormCancel}
      title={cardTitle}
      destroyOnClose
    >
      <ManageForm
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        initialValues={initialValues}
        size={'large'}
      >
        {children}
      </ManageForm>
    </Modal>
  );
}

// export forwards

export default forwardRef<ManageFormModalRef, ManageFormModalProps>(ManageFormModal);
