import { Button, ButtonProps, message, Tooltip } from "antd";
import useApi from "@/app/manage/hooks/useApi";
import { HotSpider } from "@prisma/client";
import { useCallback, useEffect, useMemo } from "react";
import { NetworkError } from "@/http";
import BrandIcon from "@/Components/MainBoard/HotBoard/BrandIcon";
import { useRouter } from "next/navigation";
import CommonStatisticCard from "./CommonStatisticCard";
import MyPieChart from "./MyPieChart";

const headers = {
  "x-no-cache": "true",
};

const buttonColors: ButtonProps["color"][] = ["default", "primary", "danger"];

export default function SpiderStatisticBoard() {
  const router = useRouter();
  const {
    get: getSpiders,
    items: spiders,
    loading,
  } = useApi<HotSpider>({
    apiURL: "spider",
    headers,
  });

  const { get: triggerSpiderRefresh, loading: triggerLoading } = useApi({
    apiURL: "spider/trigger",
    headers: {
      "x-ignore-error": "true",
      "x-no-cache": "true",
    },
  });

  const {
    oldestSpider,
    hourlyCount,
    dailyCount,
    outdatedCount,
    hourlyRate,
    dailyRate,
    oldestSpiderLastUpdate,
  } = useMemo(() => {
    const now = new Date().getTime();
    
    // 计算各时间段的爬虫数量
    const counts = spiders.reduce((acc, spider) => {
      const diff = now - new Date(spider.updatedAt).getTime();
      
      if (diff < 1000 * 60 * 60) {
        acc.hourly++;
      } else if (diff < 1000 * 60 * 60 * 24) {
        acc.daily++; 
      } else {
        acc.outdated++;
      }
      
      // 追踪最旧的爬虫
      if (!acc.oldest || diff > now - new Date(acc.oldest.updatedAt).getTime()) {
        acc.oldest = spider;
      }
      
      return acc;
    }, {
      hourly: 0,
      daily: 0, 
      outdated: 0,
      oldest: null as HotSpider | null
    });

    const total = spiders.length;
    
    return {
      oldestSpider: counts.oldest,
      oldestSpiderLastUpdate: counts.oldest,
      hourlyCount: counts.hourly,
      dailyCount: counts.daily,
      outdatedCount: counts.outdated,
      hourlyRate: Math.round((counts.hourly / total) * 100),
      dailyRate: Math.round(((counts.hourly + counts.daily) / total) * 100)
    };
  }, [spiders]);

  const handleManage = useCallback(() => {
    router.push("/manage/hot/spider");
  }, [router]);

  const handleRefresh = useCallback(
    async (name: string) => {
      try {
        // @ts-expect-error name is ok
        await triggerSpiderRefresh({ name });
        message.success("更新成功");
      } catch (e) {
        message.error((e as NetworkError).message);
      } finally {
        getSpiders();
      }
    },
    [triggerSpiderRefresh, getSpiders]
  );

  const renderTags = useMemo(() => {
    const now = new Date();
    return spiders.map((spider) => {
      const lastUpdate = new Date(spider.updatedAt);
      const diff = now.getTime() - lastUpdate.getTime();
      let color = buttonColors[0];
      if (diff > 1000 * 60 * 60) {
        color = buttonColors[1];
      }
      if (diff > 1000 * 60 * 60 * 24) {
        color = buttonColors[2];
      }

      return (
        <Tooltip
          title={`最后更新时间:${lastUpdate.toLocaleString()}`}
          key={spider.id}
        >
          <Button
            color={color}
            variant={"outlined"}
            onClick={() => handleRefresh(spider.name)}
            disabled={triggerLoading}
          >
            <BrandIcon src={spider.name} />
            {spider.name}
          </Button>
        </Tooltip>
      );
    });
  }, [handleRefresh, spiders, triggerLoading]);

  useEffect(() => {
    getSpiders();
  }, [getSpiders]);

  return (
    <CommonStatisticCard
      title={"爬虫状态概览"}
      loading={loading || triggerLoading}
      onRefresh={() => {
        getSpiders();
      }}
      onGoManage={handleManage}
    >
      <div className="grid grid-cols-4 gap-4 p-4 mb-4">
        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">最久未更新</span>
          <div className="flex items-center mt-2">
            {oldestSpider && <BrandIcon src={oldestSpider.name} />}
            <span className="text-xl font-bold">
              {oldestSpider?.name || "-"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">{oldestSpider?.name} 上次更新时间</span>
          <span className="text-xl font-bold mt-2">
            {oldestSpiderLastUpdate?.updatedAt ? new Date(oldestSpiderLastUpdate.updatedAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : "-"}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">24小时内更新率</span>
          <span className="text-2xl font-bold mt-2">{dailyRate}%</span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50">
          <span className="text-gray-600 text-sm">1小时内更新率</span>
          <span className="text-2xl font-bold mt-2">{hourlyRate}%</span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          minHeight: "200px",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <MyPieChart
          style={{
            height: "200px",
            width: "100%",
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
                    name: "1小时内更新",
                    value: hourlyCount,
                  },
                  {
                    name: "24小时内更新",
                    value: dailyCount,
                  },
                  {
                    name: "超过24小时未更新",
                    value: outdatedCount,
                  },
                ],
              },
            ],
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill ,minmax(100px, 1fr))",
          gap: "8px",
        }}
      >
        {renderTags}
      </div>
    </CommonStatisticCard>
  );
}
