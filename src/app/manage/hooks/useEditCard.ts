import {usePathname, useRouter} from "next/navigation";
import {useCallback, useEffect, useMemo} from "react";
import {message} from "antd";
import {NetworkError} from "@/http";
import useApi from "@/app/manage/hooks/useApi";

type EditCardProps = {
  titleGroup: {
    create: string,
    edit: string
  };
  fallbackPath?: string;
  apiURL: string;
  id?: string;
}

type EditCardReturn<T> = {
  cardTitle: string;
  isEditMode: boolean;
  itemId: string | undefined;
  router: ReturnType<typeof useRouter>;
  handleSubmit: (data: Partial<T>) => Promise<void | boolean>;
  handleCancel: () => void;
  loading: boolean;
  initialValues: T | null;
}

export default function useEditCard<T>(props: EditCardProps): EditCardReturn<T> {
  const {titleGroup, fallbackPath, apiURL, id} = props;
  const {getOne, create, edit, data, loading, clearData} = useApi<T>({apiURL});
  const router = useRouter();
  const pathname = usePathname() || '';

  const itemId = useMemo(() => {
    if (id) return id;
    const idInPath = pathname.split('/').pop();
    return Number.isNaN(idInPath) ? idInPath : undefined;
  }, [id, pathname]);

  const isEditMode = useMemo(
    () => itemId !== undefined
    , [itemId])

  const cardTitle = useMemo((): string => isEditMode ? titleGroup.edit : titleGroup.create, [isEditMode, titleGroup.create, titleGroup.edit]);

  const handleCancel = useCallback(() => {
    router.push(props.fallbackPath || '/')
  }, [router, props.fallbackPath])

  useEffect(() => {
      if (isEditMode && itemId) {
        getOne(itemId)
      } else {
        clearData()
      }
      return () => {
        clearData()
      }
    }, [clearData, getOne, isEditMode, itemId]
  )

  const handleSubmit = useCallback(async (data: Partial<T>): Promise<boolean | void> => {
    try {
      if (isEditMode) {
        await edit(
          itemId || '',
          data
        )
        if (fallbackPath) router.push(fallbackPath || '/');
        message.success('编辑成功');
      } else {
        await create(data);
        if (fallbackPath) router.push(fallbackPath || '/');
        message.success('创建成功');
      }
    } catch (e) {
      if (e instanceof NetworkError) {
        return message.error(e.bizMessage);
      }
      message.error('操作失败');
    }

  }, [isEditMode, edit, itemId, router, fallbackPath, create]);


  return {
    cardTitle,
    isEditMode,
    itemId,
    router,
    handleSubmit,
    handleCancel,
    loading,
    initialValues: data
  }

}
