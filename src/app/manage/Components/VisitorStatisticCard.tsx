import CommonStatisticCard from "./CommonStatisticCard";
import { useCallback, useEffect } from "react";
import useApi from "../hooks/useApi";
import MyPieChart from "./MyPieChart";

export default function VisitorStatisticCard() {
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
  }, [getVisitorCount]);

  return (
    <CommonStatisticCard
      title={"访客统计"}
      onRefresh={handleRefresh}
      loading={visitorLoading || visitedLoading}
    >
      <h3>新访客数: {visitorCount?.newVisitorCount}</h3>

      <MyPieChart
        style={{
          height: "300px",
          width: "50%",
        }}
        options={{
          series: [
            {
              type: "pie",
              radius: "70%",
              // center: ['50%', '50%'],
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
          height: "300px",
          width: "50%",
        }}
        options={{
          series: [
            {
              type: "pie",
              radius: "70%",
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
    </CommonStatisticCard>
  );
}
