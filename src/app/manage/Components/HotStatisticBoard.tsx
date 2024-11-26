import {Button, Card} from "antd";
import MyPieChart from "@/app/manage/Components/MyPieChart";
import useApi from "@/app/manage/hooks/useApi";
import {useCallback, useEffect, useMemo} from "react";
import {SyncOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";


const headers = {
  'x-no-cache': 'true'
}

interface NewsRankItem {
  newsId: number,
  clickCount: number,
  url: string,
  title: string
}

export default function HotStatisticBoard() {
  const router = useRouter();
  const {get: getNewsRank, items: NewsRank, loading} = useApi<NewsRankItem>({
    apiURL: 'statistic/news',
    headers,
  });
  const {getOne: getNewsStatistic, data: countData, loading: newsStatLoading} = useApi<{
    todayNewsCount: number,
    allNewsCount: number,
  }>({
    apiURL: 'statistic/news',
    headers,
  });

  const handleManage = useCallback(() => {
    router.push('/manage/hot')
  }, [router])

  const renderTitle = useMemo(() => {
    return (
      <div
        className={'flex justify-between items-center'}
      >
        热门数据统计

        <div>
          <Button
            onClick={() => {
              getNewsRank();
              getNewsStatistic('count')
            }}
            type={'link'}
            size={'small'}
          >
            <SyncOutlined
              spin={loading || newsStatLoading}
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
  }, [getNewsRank, getNewsStatistic, loading, newsStatLoading]);

  useEffect(() => {
    getNewsRank()
  }, [getNewsRank])

  useEffect(() => {
    getNewsStatistic('count')
  }, [getNewsStatistic])

  return (
    <Card
      title={renderTitle}
      size={'small'}
    >
      <MyPieChart
        style={{
          height: '300px',
          width: '100%'
        }}
        options={{
          series: [
            {
              type: 'pie',
              radius: '70%',
              // center: ['50%', '50%'],
              label: {
                show: true,
                formatter: '{b}: {c} ({d}%)'
              },
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              data: [
                {name: '今日数据', value: countData?.todayNewsCount},
                {name: '往日数据', value: (countData?.allNewsCount || 0) - (countData?.todayNewsCount || 0)}
              ]
            }
          ]
        }}/>

      {
        NewsRank.map((item, index) => {
          return (
            <div
              key={index}
              className={'flex justify-between items-center'}
            >
              <a
                href={item.url}
                target={'_blank'}
                rel={'noreferrer'}
                className={'text-blue-500'}
              >{item.title}</a>
              <span>{item.clickCount}</span>
            </div>
          )
        })
      }
    </Card>
  )
}
