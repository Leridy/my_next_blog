import Card from "@/Components/Card";
import DigitalClock from "@/Components/MainBoard/UserBoard/TipsAndNotification/DigitalClock/DigitalClock";

export default function TipsAndNotification() {
  return (
    <Card
      header={'Tips & Notification'}
    >
      <DigitalClock
        showDate={true}
        showTitle={true}
      />

      1. 按 <code>Esc</code> 切换 fake 模式
      <br/>
      2. 当窗口切换到后台时，自动进入 fake 模式
      <br/>
      3. fake 模式的必应搜索是可用的

      <br/>

    </Card>
  )
}
