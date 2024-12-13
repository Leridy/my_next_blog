import CommonStatisticCard from "./CommonStatisticCard";
import { useCallback, useEffect } from "react";
import useApi from "../hooks/useApi";
import MyPieChart from "./MyPieChart";

export default function VisitorStatisticBoard() {
  // 模仿 HotStatisticBoard 实现 VisitorStatisticCard
  const {
    getOne: getVisitorCount,
    loading: visitorLoading,
    data: visitorCount,
  } = useApi<{
    todayVisitorCount: number;
    totalVisitorCount: number;
    newVisitorCount: number;
  }>({
    apiURL: "/statistic/visitor",
  });

  const {
    getOne: getVisitedCount,
    loading: visitedLoading,
    data: visitedCount,
  } = useApi<{
    todayVisitedCount: number;
    totalVisitedCount: number;
  }>({
    apiURL: "/statistic/visitor",
  });

  useEffect(() => {
    getVisitorCount("count");
  }, [getVisitorCount]);

  useEffect(() => {
    getVisitedCount("visited");
  }, [getVisitedCount]);

  const handleRefresh = useCallback(() => {
    getVisitorCount("count");
    getVisitedCount("visited");
  }, [getVisitedCount, getVisitorCount]);

  return (
    <CommonStatisticCard
      title={"访客统计"}
      onRefresh={handleRefresh}
      loading={visitorLoading || visitedLoading}
    >
      <div className="grid grid-cols-4 gap-4 p-4 mb-4">
        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">今日访客</span>
          <span className="text-2xl font-bold mt-2">{visitorCount?.todayVisitorCount || 0}</span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">新增访客</span>
          <span className="text-2xl font-bold mt-2">{visitorCount?.newVisitorCount || 0}</span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">今日访问</span>
          <span className="text-2xl font-bold mt-2">{visitedCount?.todayVisitedCount || 0}</span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">总访问量</span>
          <span className="text-2xl font-bold mt-2">{visitedCount?.totalVisitedCount || 0}</span>
        </div>
      </div>
      
      <div
        style={{
          width: "100%",
          display: "flex", 
          minHeight: "200px",
          flexWrap: "wrap",
        }}
      >
        <MyPieChart
          style={{
            height: "200px",
            width: "50%",
          }}
          options={{
            series: [
              {
                type: "pie",
                radius: "50%",
                label: {
                  show: true,
                  formatter: "{b}: {c} ({d}%)",
                },
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 5,
                  borderColor: "#fff",
                  borderWidth: 2,
                },
                data: [
                  { name: "今日访客", value: visitorCount?.todayVisitorCount },
                  {
                    name: "历史访客", 
                    value:
                      (visitorCount?.totalVisitorCount || 0) -
                      (visitorCount?.todayVisitorCount || 0),
                  },
                ],
              },
            ],
          }}
        />

        <MyPieChart
          style={{
            height: "200px",
            width: "50%",
          }}
          options={{
            series: [
              {
                type: "pie",
                radius: "50%",
                label: {
                  show: true,
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
                    name: "今日访问次数",
                    value: visitedCount?.todayVisitedCount,
                  },
                  {
                    name: "历史访问次数",
                    value:
                      (visitedCount?.totalVisitedCount || 0) -
                      (visitedCount?.todayVisitedCount || 0),
                  },
                ],
              },
            ],
          }}
        />
      </div>
    </CommonStatisticCard>
  );
}
