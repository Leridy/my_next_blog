import {Button, Input} from "antd";
import {useState} from "react";
import './FakeMask.style.scss'

interface FakeMaskProps {
  onExit?: () => void;
}

/**
 * FakeMask
 * @constructor
 * @description 这是一个模仿搜索的组件，它看起来像百度搜索的搜索结果，使用 Bing 的搜索引擎
 */
export default function FakeMask(props: FakeMaskProps) {
  const {onExit} = props;
  const [searchValue, setSearchValue] = useState<string>('');


  const handleSearch = () => {
    if(searchValue) window.open(`https://cn.bing.com/search?q=${searchValue}`);
  }

  const exitFakeMode = () => {
    onExit?.();
  }

  return (
    <div
      className={'fixed top-0 left-0 w-full h-full bg-white flex items-center justify-center fake-mask'}
      style={{
        zIndex: 9999,
        transition: 'all 0.5s',
        // todo: 这里是为了让这个组件不显示，为了开发方便，你可以删除这个 style
        display: 'none',
      }}
    >
      <div
        className={'flex flex-col items-center justify-start cursor-pointer'}
        style={{
          transform: 'translateY(-220px)',
        }}
      >
        <div
          className={'mb-8 flex logo'}
          onDoubleClick={exitFakeMode}
        >
          <img
            className={'w-60'}
            src={'/icons/bing.svg'} alt={'bing'}
            title={'双击 logo 关闭'}
          />
        </div>

        <div>
          <Input
            placeholder={''}
            style={{width: '400px'}}
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            onPressEnter={handleSearch}
          />
          <Button
            type={'primary'}
            style={{marginLeft: '1rem'}}
            onClick={handleSearch}
          >必应搜索</Button>
        </div>


      </div>

    </div>
  )
}
