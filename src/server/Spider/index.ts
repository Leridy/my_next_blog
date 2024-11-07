import kr from './36kr.spider';
import ithome from './ithome.spider';
import hupu from './hupu.spider';
import bilibili from "@/server/Spider/bilibili.spider";
import {MyNRError} from "@/utils/MyNRError";

export default async function Spider() {
  try {
    const tasks = [kr(), ithome(), hupu(), bilibili()];
    // const tasks = [bilibili()];
    return await Promise.all(tasks);
  } catch (e) {
    if (e instanceof MyNRError) throw e;
    if (e instanceof Error) {
      throw new MyNRError(`爬虫出错 ${e.message}`, 500, {originError: e});
    }

  }
}
