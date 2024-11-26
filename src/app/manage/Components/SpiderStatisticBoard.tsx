import {Button, ButtonProps, Card, message, Tooltip} from "antd";
import useApi from "@/app/manage/hooks/useApi";
import {HotSpider} from "@prisma/client";
import {useCallback, useEffect, useMemo} from "react";
import {NetworkError} from "@/http";
import BrandIcon from "@/Components/MainBoard/HotBoard/BrandIcon";
import {SyncOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";

const headers = {
  'x-no-cache': 'true'
}

const buttonColors: ButtonProps['color'][] = [
  'default',
  'primary',
  'danger'
]

export default function SpiderStatisticBoard() {
  const router = useRouter();
  const {get: getSpiders, items: spiders, loading} = useApi<HotSpider>({
    apiURL: 'spider',
    headers,
  });

  const {
    get: triggerSpiderRefresh,
    loading: triggerLoading
  } = useApi({
    apiURL: 'spider/trigger',
    headers: {
      'x-ignore-error': 'true',
      'x-no-cache': 'true'
    }
  });

  const handleManage = useCallback(() => {
    router.push('/manage/hot/spider')
  }, [router])

  const handleRefresh = useCallback(async (name: string) => {
    try {
      // @ts-expect-error name is ok
      await triggerSpiderRefresh({name});
      message.success('更新成功');
    } catch (e) {
      message.error((e as NetworkError).message);
    } finally {
      getSpiders()
    }

  }, [triggerSpiderRefresh]);

  const renderTags = useMemo(() => {
    const now = new Date();
    return spiders.map((spider) => {
      const lastUpdate = new Date(spider.updatedAt);
      const diff = now.getTime() - lastUpdate.getTime()
      let color = buttonColors[0]
      if (diff > 1000 * 60 * 60) {
        color = buttonColors[1]
      }
      if (diff > 1000 * 60 * 60 * 24) {
        color = buttonColors[2]
      }

      return (
        <Tooltip
          title={`最后更新时间:${lastUpdate.toLocaleString()}`}
          key={spider.id}
        >
          <Button
            color={color}
            variant={'outlined'}
            onClick={() => handleRefresh(spider.name)}
          >
            <BrandIcon src={spider.name}/>
            {spider.name}
          </Button>
        </Tooltip>
      )
    })
  }, [handleRefresh, spiders]);

  const renderTitle = useMemo(() => {
    return (
      <div
        className={'flex justify-between items-center'}
      >
        爬虫状态概览

        <div>
          <Button
            onClick={
              () => {
                getSpiders();
              }
            }
            type={'link'}
            size={'small'}
          >
            <SyncOutlined
              spin={
                loading || triggerLoading
              }
            />
            刷新
          </Button>
          <Button
            type={'link'}
            size={'small'}
            onClick={handleManage}
          >
            管理
          </Button>
        </div>
      </div>
    )
  }, [getSpiders, loading, triggerLoading]);

  useEffect(() => {
    getSpiders()
  }, [getSpiders])

  return (
    <Card
      title={renderTitle}
      size={'small'}
      styles={{
        body: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill ,minmax(100px, 1fr))',
          gap: '8px',
        }
      }}
    >{renderTags}</Card>
  )
}
