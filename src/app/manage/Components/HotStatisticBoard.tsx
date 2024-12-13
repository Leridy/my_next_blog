import MyPieChart from "@/app/manage/Components/MyPieChart";
import useApi from "@/app/manage/hooks/useApi";
import {useCallback, useEffect} from "react";
import {useRouter} from "next/navigation";
import CommonStatisticCard from "./CommonStatisticCard";

const headers = {
  "x-no-cache": "true",
};

interface NewsRankItem {
  newsId: number;
  clickCount: number;
  url: string;
  title: string;
}

export default function HotStatisticBoard() {
  const router = useRouter();
  const {
    get: getNewsRank,
    items: NewsRank,
    loading,
  } = useApi<NewsRankItem>({
    apiURL: "statistic/news/top20News",
    headers,
  });

  const {
    getOne: getNewsStatistic,
    data: countData,
    loading: newsStatLoading,
  } = useApi<{
    todayNewsCount: number;
    allNewsCount: number;
  }>({
    apiURL: "statistic/news",
    headers,
  });

  const {
    getOne: getVisitorStatistic,
    data: visitorData,
    loading: visitorStatLoading,
  } = useApi<{
    todayClickCount: number;
    allClickCount: number;
  }>({
    apiURL: "statistic/news",
    headers,
  });

  const {
    getOne: getClickedTopic,
    data: topicData,
    loading: topicLoading,
  } = useApi<{
    todayClickedNewsCount: number;
  }>({
    apiURL: "statistic/news",
    headers,
  });

  const {
    getOne: getTopicClickStatistic,
    data: topicClickData,
    loading: topicClickLoading,
  } = useApi<{
    topicTodayVisitedInfo: {
      name: string,
      clickCount: number
      topicId: number
    }[]
  }>({
    apiURL: "statistic/news/topic",
    headers,
  });

  const handleRefresh = useCallback(() => {
    getNewsRank();
    getNewsStatistic("count");
    getVisitorStatistic("visitor");
    getClickedTopic("todayClickedNewsCount");
    getTopicClickStatistic("");
  }, [getClickedTopic, getNewsRank, getNewsStatistic, getTopicClickStatistic, getVisitorStatistic]);

  const handleManage = useCallback(() => {
    router.push("/manage/hot");
  }, [router]);

  useEffect(() => {
    getNewsRank();
  }, [getNewsRank]);

  useEffect(() => {
    getNewsStatistic("count");
  }, [getNewsStatistic]);

  useEffect(() => {
    getVisitorStatistic("visitor");
  }, [getVisitorStatistic]);

  useEffect(() => {
    getClickedTopic('todayClickedNewsCount');
  }, [getClickedTopic]);

  useEffect(() => {
    getTopicClickStatistic("");
  }, [getTopicClickStatistic]);

  return (
    <CommonStatisticCard
      title={"热门数据统计"}
      loading={loading || newsStatLoading || visitorStatLoading || topicLoading || topicClickLoading}
      onRefresh={handleRefresh}
      onGoManage={handleManage}
    >
      <div className="grid grid-cols-5 gap-4 p-4 mb-4">
        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">今日新增话题</span>
          <span className="text-2xl font-bold mt-2">
            {countData?.todayNewsCount || 0}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">今日热门话题</span>
          <span className="text-2xl font-bold mt-2">
            {topicData?.todayClickedNewsCount || 0}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">今日话题点击次数</span>
          <span className="text-2xl font-bold mt-2">
            {visitorData?.todayClickCount || 0}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">总点击次数</span>
          <span className="text-2xl font-bold mt-2">
            {visitorData?.allClickCount || 0}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">总话题数</span>
          <span className="text-2xl font-bold mt-2">
            {countData?.allNewsCount || 0}
          </span>
        </div>
      </div>

      <div
        className={"grid grid-cols-4 gap-4 p-4 mb-4"}
        style={{
          width: "100%",
          minHeight: "200px",
          flexWrap: "wrap",
        }}
      >
        <MyPieChart
          style={{
            height: "200px",
          }}
          options={{
            tooltip: {
              trigger: 'item',
              formatter: "{b}: {c} ({d}%)",
            },
            series: [
              {
                type: "pie",
                radius: "70%",
                // center: ['50%', '50%'],
                label: {
                  show: false,
                  position: 'center',
                  formatter: "{b}: {c} ({d}%)",
                },
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 5,
                  borderColor: "#fff",
                  borderWidth: 2,
                },
                data: [
                  {
                    name: "近24小时点击量",
                    value: visitorData?.todayClickCount,
                  },
                  {
                    name: "早前总点击量",
                    value:
                      (visitorData?.allClickCount || 0) -
                      (visitorData?.todayClickCount || 0),
                  },
                ],
              },
            ],
          }}
        />

        <MyPieChart
          style={{
            height: "200px",
          }}
          options={{
            tooltip: {
              trigger: 'item',
              formatter: "{b}: {c} ({d}%)",
            },
            series: [
              {
                type: "pie",
                radius: "70%",
                // center: ['50%', '50%'],
                label: {
                  show: false,
                  position: 'center',
                  formatter: "{b}: {c} ({d}%)",
                },
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 5,
                  borderColor: "#fff",
                  borderWidth: 2,
                },
                data: [
                  {
                    name: "今日访问主题数",
                    value: topicData?.todayClickedNewsCount,
                  },
                  {name: "今日总主题数", value: countData?.todayNewsCount},
                ],
              },
            ],
          }}
        />

        <MyPieChart
          style={{
            height: "200px",
          }}
          options={{
            tooltip: {
              trigger: 'item',
              formatter: "{b}: {c} ({d}%)",
            },
            series: [
              {
                type: "pie",
                radius: "70%",
                // center: ['50%', '50%'],
                label: {
                  show: false,
                  position: 'center',
                  formatter: "{b}: {c} ({d}%)",
                },
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 5,
                  borderColor: "#fff",
                  borderWidth: 2,
                },
                data: [
                  {name: "今日数据", value: countData?.todayNewsCount},
                  {
                    name: "往日数据",
                    value:
                      (countData?.allNewsCount || 0) -
                      (countData?.todayNewsCount || 0),
                  },
                ],
              },
            ],
          }}
        />

        <MyPieChart
          style={{
            height: "200px",
          }}
          options={{
            tooltip: {
              trigger: 'item',
              formatter: "{b}: {c} ({d}%)",
            },
            series: [
              {
                type: "pie",
                radius: "70%",
                label: {
                  show: false,
                  position: 'center',
                  formatter: "{b}: {c} ({d}%)",
                },
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 5,
                  borderColor: "#fff",
                  borderWidth: 2,
                },
                data: topicClickData?.topicTodayVisitedInfo.map(item => ({
                  name: item.name,
                  value: item.clickCount
                })) || []
              },
            ],
          }}
        />
      </div>

      <div className="max-h-[200px] overflow-auto">
        {NewsRank.map((item, index) => {
          return (
            <div key={index} className={"flex justify-between items-center"}>

              <a
                href={item.url}
                target={"_blank"}
                rel={"noreferrer"}
                className={" hover:underline flex"}
              >
                <span
                  className={` w-6 flex items-center justify-center text-sm `}
                >
                  {index + 1}.
                </span>
                {item.title}
              </a>
              <span>{item.clickCount}</span>
            </div>
          );
        })}
      </div>
    </CommonStatisticCard>
  );
}
