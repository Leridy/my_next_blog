'use client'
import {Card} from "antd";
import HotForm from "@/app/manage/hot/Components/HotForm";
import {usePathname, useRouter} from "next/navigation";
import {useCallback, useEffect, useMemo} from "react";
import {HotTopic} from "@prisma/client";
import {useHotData} from "@/app/manage/hot/hooks/useHotData";


export default function HotEditor() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const {create, edit, loading, fetchOne, data} = useHotData();

  const isEditMode = useMemo(
    () => !pathname.includes('create')
    , [])

  const cardTitle = useMemo((): string => isEditMode ? '编辑栏目信息' : '创建新的栏目', [isEditMode]);
  const itemId = useMemo(() => {
    const id = pathname.split('/').pop();
    return id === 'create' ? undefined : id;
  }, [pathname]);

  const handleSubmit = useCallback(async (data: Partial<HotTopic>) => {
    if (isEditMode) {
      await edit(
        itemId || '',
        data
      )
      router.push('/manage/hot')
    } else {
      await create(data);
      router.push('/manage/hot')
    }
  }, [isEditMode, edit, itemId, router, create]);

  useEffect(
    () => {
      itemId && itemId !== 'create' && fetchOne(itemId)
    }, [itemId]
  )

  return (
    <Card
      title={cardTitle}
      size={"small"}
      className={'h-full'}
    >
      <HotForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/manage/hot')}
        loading={loading}
        initialValues={data}
      />
    </Card>
  );
}
