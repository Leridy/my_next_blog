import kr from './36kr.spider';
import ithome from './ithome.spider';
import hupu from './hupu.spider';
import bilibili from "@/server/Spider/bilibili.spider";
import juejin from "@/server/Spider/juejin.spider";
import v2ex from "@/server/Spider/v2ex.spider";
import toutiao from "@/server/Spider/toutiao.spider";
import zhihu from "@/server/Spider/zhihu.spider";
import huxiu from "@/server/Spider/huxiu.spider";
import sina from "@/server/Spider/sina.spider";
import {MyNRError} from "@/utils/MyNRError";

interface SpiderProps {
  spiderNames?: string[];
}

export default async function Spider(props?: SpiderProps) {
  const {spiderNames = []} = props || {};
  try {
    const updateResult = [];
    let tasks = [];
    if (spiderNames.length === 0) {
      tasks = [kr, ithome, hupu, bilibili, juejin, v2ex, toutiao, zhihu, huxiu, sina];
    } else {
      tasks = spiderNames.map((name) => {
        switch (name) {
          case '36kr':
            return kr;
          case 'ithome':
            return ithome;
          case 'hupu':
            return hupu;
          case 'bilibili':
            return bilibili;
          case 'juejin':
            return juejin;
          case 'v2ex':
            return v2ex;
          case 'toutiao':
            return toutiao;
          case 'zhihu':
            return zhihu;
          case 'huxiu':
            return huxiu;
          case 'sina':
            return sina;
          default:
            return () => {
              throw new MyNRError(`爬虫 ${name} 不存在`, 404);
            }
        }
      });
    }

    // 为什么不用 Promise.all 呢？因为 Promise.all 会在其中一个任务出错时就直接 reject，而我们希望所有任务都执行完，然后返回所有结果
    // 还有一个原因是，我们希望在出错时，能够知道是哪个任务出错了，所以我们需要一个一个任务的执行
    // 边缘计算性能较差，所以我们需要担心并发过高的问题，所以我们需要一个一个任务的执行
    for (let i = 0; i < tasks.length; i++) {
      try {
        if (spiderNames.length > 0) {
          const result = await tasks[i](); // for test
          updateResult.push(result || {});
        } else {
          // 为了避免并发过高，我们需要设置一个间隔时间
          setTimeout(() => {
            tasks[i]()
          }, 10000 * i);
        }

      } catch (e) {
        if (e instanceof MyNRError) throw e;
        if (e instanceof Error) {
          console.error(e);
          throw new MyNRError(`爬虫出错 ${e.message}`, 500, {originError: e});
        }
      }
    }

    return {state: 'success', message: '已经成功触发爬虫，正在爬取数据', updateResult};
  } catch (e) {
    if (e instanceof MyNRError) throw e;
    if (e instanceof Error) {
      throw new MyNRError(`爬虫出错 ${e.message}`, 500, {originError: e});
    }

  }
}
