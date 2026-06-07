// 写一个方法传入的内容是上面注释的html，返回一个对象，对象的属性是开奖时间，开奖号码，开奖类型，开奖名称

import { load } from 'cheerio';

/**
 * 需要说明的是他们的对照关系
 * 彩票代码是 kj-list-item 对应的 id
 * 彩票名称是 kj-list-item > a > span > div.kj-list-item__title__left > span.name
 * 开奖时间是 kj-list-item > a > span > div.kj-list-item__title__left > span.kj-info-scale > span.kj-date
 * 开奖号码是 kj-list-item > a > span > div.kj-list-item__number > div.number-list > span.red-ball 或 span.blue-ball 或 span.orange-ball //记得处理完之后将他们按颜色规则拼接起来， 如果有试机号 'div.kaij-sjh'，也要将试机号拼接起来末尾
 * 开奖期数是 kj-list-item > a > span > div.kj-list-item__title__left > span.kj-info-scale > span.kj-num
 * 跳转链接是 kj-list-item > a
 */

export interface LotteryResult {
  code: string; // 彩票代码
  name: string; // 彩票名称
  date: string; // 开奖时间
  numbers: string; // 开奖号码
  period: string; // 开奖期数
  link: string; // 跳转链接
}

export function parseLotteryHtml(html: string): LotteryResult[] {
  const results: LotteryResult[] = [];

  // 使用cheerio解析HTML
  const $ = load(html);

  // 获取所有开奖项
  $('.kj-list-item').each((_, item) => {
    const $item = $(item);
    const result: LotteryResult = {
      code: $item.attr('id') || '',
      name: $item.find('.name').text() || '',
      date: $item.find('.kj-date').text() || '',
      period: $item.find('.kj-num').text() || '',
      link: 'https://m.500.com' + $item.find('a').attr('data-href') || '',
      numbers: '',
    };

    // 获取所有号码球
    const numbers: string[] = [];
    $item.find('.number-list .ball').each((_, ball) => {
      const className = $(ball).attr('class') || '';
      const number = $(ball).text() || '';

      const colorMap: Record<string, string> = {
        'red-ball': '红',
        'blue-ball': '蓝',
        'orange-ball': '橙',
      };

      // 遍历颜色
      for (const color in colorMap) {
        if (className.includes(color)) {
          numbers.push(colorMap[color] + number);
        }
      }
    });

    // 获取试机号(如果有)
    const testNumbers = $item.find('.kaij-sjh');
    if (testNumbers.length) {
      numbers.push(` ${testNumbers.text()}`);
    }

    result.numbers = numbers.join(',');
    results.push(result);
  });

  return results;
}
