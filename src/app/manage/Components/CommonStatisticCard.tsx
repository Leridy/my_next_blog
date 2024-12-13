import { Button, Card } from "antd";
import { ReactNode, useCallback, useMemo } from "react";
import { SyncOutlined } from "@ant-design/icons";

interface CommonStatisticCardProps {
  title?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  onRefresh?: () => Promise<void> | void;
  onGoManage?: () => void;
}

export default function CommonStatisticCard(props: CommonStatisticCardProps) {
  const { title, children, onRefresh, onGoManage, loading } = props;

  const handleManage = useCallback(() => {
    onGoManage?.();
  }, [onGoManage]);

  const renderTitle = useMemo(() => {
    return (
      <div className={"flex justify-between items-center"}>
        {title}

        <div>
          <Button
            onClick={onRefresh}
            type={"link"}
            size={"small"}
            className={onRefresh ? "" : "none"}
          >
            <SyncOutlined spin={loading} />
            刷新
          </Button>
          <Button
            className={onGoManage ? "" : "none"}
            type={"link"}
            size={"small"}
            onClick={handleManage}
          >
            管理
          </Button>
        </div>
      </div>
    );
  }, [title, onRefresh, handleManage, loading, onGoManage]);

  return (
    <Card title={renderTitle} size={"small"}>
      {children}
    </Card>
  );
}
