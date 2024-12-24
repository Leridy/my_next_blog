import CommonStatisticCard from "./CommonStatisticCard";
import {useCallback, useEffect, useMemo} from "react";
import useApi from "../hooks/useApi";
import MyPieChart from "./MyPieChart";
import {visitor} from "@prisma/client";

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

  const {
    get: getVisitorRankList,
    loading: visitorRankLoading,
    items: visitorRankList,
  } = useApi<visitor>({
    apiURL: "/statistic/visitor/rank",
  });

  const averagePagePerVisitor = useMemo(() => {
    // 注意这里的除数不能为 0，向上取整
    return Math.ceil((visitedCount?.todayVisitedCount || 0) / (visitorCount?.todayVisitorCount || 1));
  }, [visitorCount, visitedCount]);
  useEffect(() => {
    getVisitorCount("count");
  }, [getVisitorCount]);

  useEffect(() => {
    getVisitedCount("visited");
  }, [getVisitedCount]);

  useEffect(() => {
    getVisitorRankList();
  }, [getVisitorRankList]);

  const handleRefresh = useCallback(() => {
    getVisitorCount("count");
    getVisitedCount("visited");
    getVisitorRankList();
  }, [getVisitedCount, getVisitorCount, getVisitorRankList]);

  return (
    <CommonStatisticCard
      title={"访客统计"}
      onRefresh={handleRefresh}
      loading={visitorLoading || visitedLoading || visitorRankLoading}
    >
      <div className="grid grid-cols-5 gap-4 p-4 mb-4">
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
          <span className="text-gray-600 text-sm">今日访客平均次数</span>
          <span
            className="text-2xl font-bold mt-2">{averagePagePerVisitor}</span>
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
                  {name: "今日访客", value: visitorCount?.todayVisitorCount},
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
      </div>

      <h5 className="text-xs font-bold mt-4">访客排行榜</h5>

      <div className="max-h-[200px] overflow-auto">
        {visitorRankList.map((item, index) => {
          return (
            <div key={index} className={"flex justify-between items-center"}>

              <a
                href={`https://www.ip138.com/iplookup.php?ip=${item.ip}&action=2`}
                target={"_blank"}
                rel={"noreferrer"}
                className={" hover:underline flex"}
              >
                <span
                  className={` w-6 flex items-center justify-center text-sm `}
                >
                  {index + 1}.
                </span>
                {item.ip} - {item.browserSign}
              </a>
              <span>{item.todayCount}</span>
            </div>
          );
        })}
      </div>
    </CommonStatisticCard>
  );
}
