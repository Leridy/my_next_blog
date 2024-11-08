import kr from './36kr.spider';
import ithome from './ithome.spider';
import hupu from './hupu.spider';
import bilibili from "@/server/Spider/bilibili.spider";
import juejin from "@/server/Spider/juejin.spider";
import v2ex from "@/server/Spider/v2ex.spider";
import toutiao from "@/server/Spider/toutiao.spider";
import {MyNRError} from "@/utils/MyNRError";

export default async function Spider() {
  try {
    // const tasks = [v2ex()]; // for test
    const tasks = [kr, ithome, hupu, bilibili, juejin, v2ex, toutiao];
    const updateResult = [];
    // 为什么不用 Promise.all 呢？因为 Promise.all 会在其中一个任务出错时就直接 reject，而我们希望所有任务都执行完，然后返回所有结果
    // 还有一个原因是，我们希望在出错时，能够知道是哪个任务出错了，所以我们需要一个一个任务的执行
    // 边缘计算性能较差，所以我们需要担心并发过高的问题，所以我们需要一个一个任务的执行
    for (let i = 0; i < tasks.length; i++) {
      try {
        // const result = await tasks[i]; // for test
        const result = tasks[i]() ;
        updateResult.push(result);
      } catch (e) {
        if (e instanceof MyNRError) throw e;
        if (e instanceof Error) {
          console.error(e);
          throw new MyNRError(`爬虫出错 ${e.message}`, 500, {originError: e});
        }

      }
    }
    return {state: 'success', data: updateResult};
    // return updateResult;
  } catch (e) {
    if (e instanceof MyNRError) throw e;
    if (e instanceof Error) {
      throw new MyNRError(`爬虫出错 ${e.message}`, 500, {originError: e});
    }

  }
}
