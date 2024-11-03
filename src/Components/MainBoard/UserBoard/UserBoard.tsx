'use client'
import Card from "../../Card";
import UserProfile from "@/Components/MainBoard/UserBoard/UserProfile";
import TipsAndNotification from "@/Components/MainBoard/UserBoard/TipsAndNotification/TipsAndNotification";
// 用来获取配置信息的东西
const SITE_SETTING_KEY = 'UserBoard';
/**
 * UserBoard
 * @constructor
 * @description 这个组件是用来展示用户信息的,
 */
export default function UserBoard() {


  return (
    <div className={'grid gap-6 h-full overflow-y-scroll'}>
      <TipsAndNotification/>

      <UserProfile/>

      <Card
        header={<h1>What to Eat</h1>}
      >
        todo here should be a small game, it generate a random food for you to eat.
        you can also add your food or manage delete the food you don&#39;t want to eat.
      </Card>

      <Card
        header={'Game'}
      >
        todo 做一个敲木鱼的小游戏，可以用来放松一下
      </Card>

      <Card header={'Tool'}>
        todo 做一个 todo list
      </Card>
    </div>

  )
}
