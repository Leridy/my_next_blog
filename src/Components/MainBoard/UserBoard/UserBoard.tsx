'use client'
import Card from "../../Card";
import {UserOutlined} from "@ant-design/icons";

/**
 * UserBoard
 * @constructor
 * @description 这个组件是用来展示用户信息的,
 */
export default function UserBoard() {
  return (
    <div className={'grid gap-6 h-full overflow-y-scroll'}>
      <Card
        header={'Tips'}
      >
        按 <code>Esc</code> 切换 fake 模式
      </Card>
      <Card
        header={
          <h1>
            <UserOutlined className={'mr-2'}/>
            你好，<span className={'text-amber-500'}>张三</span>
          </h1>
        }
      >
        Here is your user part, you can see your information here,
        and there also have some entries for you to manage your account.
        like change your password, change your nickname, and so on.
      </Card>
      <Card
        header={
          <h1>待会吃啥</h1>
        }
      >
        todo here should be a small game, it generate a random food for you to eat.
        you can also add your food or manage delete the food you don&#39;t want to eat.
      </Card>

      <Card
        header={'小游戏'}
      >
        todo 做一个敲木鱼的小游戏，可以用来放松一下
      </Card>

      <Card header={'小工具'}>
        todo 做一个 todo list
      </Card>
    </div>

  )
}
