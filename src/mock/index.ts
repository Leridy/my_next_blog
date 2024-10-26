import {News} from "@/Components/MainBoard/HotBoard/NewsItem";

/**
 * mock data schema
 *   id          Int      @id @default(autoincrement())
 *   name        String   @unique
 *   description String   @default("")
 *   url         String   @unique
 *   image       String   @default("")
 *   // newsList is the JSON string of the news list
 *   newsList    Json
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 */
export const mockHotTopic = [
  {
    id: 1,
    name: '知乎日报',
    icon: 'zhihu',
    description: '知乎日报是知乎官方发布的日报，每天推送最新的知乎热点内容。',
    url: 'https://daily.zhihu.com/',
    image: 'https://example.com/zhihu.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'V2EX',
    icon: 'v2ex',
    description: 'V2EX 是一个关于分享和探索的地方，每天都有大量的新内容发布。',
    url: 'https://www.v2ex.com/',
    image: 'https://example.com/v2ex.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Github',
    icon: 'github',
    description: 'Github ��全球最大的开源代码托管平台，每天都有大量的新项目发布。',
    url: 'http://github.com',
    image: 'https://example.com/github.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 4,
    name: '掘金',
    icon: 'juejin',
    description: '掘金是一个面向开发者的社区，每天都有大量的新内容发布。',
    url: 'https://juejin.cn/',
    image: 'https://example.com/juejin.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 5,
    name: '微博热搜',
    icon: 'weibo',
    description: '微博热搜是微博官方发布的热门话题，每天都有大量的新内容发布。',
    url: 'https://s.weibo.com/top/summary',
    image: 'https://example.com/weibo.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 6,
    name: 'IT之家',
    icon: 'ithome',
    description: 'IT之家是一个关于科技新闻的网站，每天都有大量的新内容发布。',
    url: 'https://www.ithome.com/',
    image: 'https://example.com/ithome.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 7,
    name: '今日头条',
    icon: 'toutiao',
    description: '头条是一个关于新闻资讯的网站，每天都有大量的新内容发布。',
    url: 'https://www.toutiao.com/',
    image: 'https://example.com/toutiao.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 8,
    name: '抖音',
    icon: 'tiktok',
    description: '抖音是一个短视频分享平台，每天都有大量的新内���发布。',
    url: 'https://www.douyin.com/',
    image: 'https://example.com/douyin.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 9,
    name: '中关村在线',
    icon: 'zol',
    description: '中关村在线是一个关于科技新闻的网站，每天都有大量的新内容发布。',
    url: 'https://www.zol.com.cn/',
    image: 'https://example.com/zol.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 10,
    name: '36氪',
    icon: '36kr',
    description: '36氪是一个关于创业新闻的网站，每天都有大量的新内容发布。',
    url: 'https://36kr.com/',
    image: 'https://example.com/36kr.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 11,
    name: '虎扑步行街',
    icon: 'hupu',
    description: '虎扑步行街是一个关于体育新闻的网站，每天都有大量的新内容发布。',
    url: 'https://bbs.hupu.com/bxj',
    image: 'https://example.com/hupu.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 12,
    name: '新浪',
    icon: 'sina',
    description: '新浪是一个关于新闻资讯的��站，每天都有大量的新内容发布。',
    url: 'https://www.sina.com.cn/',
    image: 'https://example.com/sina.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 13,
    name: '虎嗅',
    icon: 'huxiu',
    description: '虎嗅是一个关于创业新闻的网站，每天都有大量的新内容发布。',
    url: 'https://www.huxiu.com/',
    image: 'https://example.com/huxiu.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 14,
    name: '什么值得买',
    icon: 'smzdm',
    description: '什么值得买是一个关于购物优惠的网站，每天都有大量的新内容发布。',
    url: 'https://www.smzdm.com/',
    image: 'https://example.com/smzdm.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 15,
    name: '豆瓣',
    icon: 'douban',
    description: '豆瓣是一个关于影视音乐的网站，每天都有大量的新内容发布。',
    url: 'https://www.douban.com/',
    image: 'https://example.com/douban.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  },
  {
    id: 16,
    name: 'B站',
    icon: 'bilibili',
    description: '知乎日报是知乎官方发布的日报，每天推送最新的知乎热点内容。',
    url: 'https://www.bilibili.com/',
    image: 'https://example.com/bilibili.jpg',
    newsList: [],
    createdAt: '2021-10-01T00:00:00Z',
    updatedAt: '2021-10-01T00:00:00Z',
  }
]

export const mockNews: News[] = [
  {
    "id": "1",
    "title": "名家讲经典：阎晶明全新阐释鲁迅《祝福》",
    "description": "读书频道今日推荐，名家讲经典系列，阎晶明全新阐释鲁迅作品《祝福》。",
    "cover": "http://example.com/cover1.jpg",
    "url": "https://news.sina.com.cn/c/2024-10-25/doc-ikyvckzq8119947.shtml",
    "hotCount": 5000,
    "tags": ["读书", "文学", "鲁迅"]
  },
  {
    "id": "2",
    "title": "十月少年文学名家创作分享会举办",
    "description": "十月少年文学系列活动，名家创作分享会成功举办，分享创作心得。",
    "cover": "http://example.com/cover2.jpg",
    "url": "https://news.sina.com.cn/o/2024-10-25/doc-ikyvckzq8119948.shtml",
    "hotCount": 4500,
    "tags": ["少年文学", "创作分享", "文化活动"]
  },
  {
    "id": "3",
    "title": "《黑龙江纪事》：细节中找到历史真相",
    "description": "新书《黑龙江纪事》发布，作者通过细节挖掘，还原历史真相。",
    "cover": "http://example.com/cover3.jpg",
    "url": "https://news.sina.com.cn/h/2024-10-25/doc-ikyvckzq8119949.shtml",
    "hotCount": 4200,
    "tags": ["历史", "新书发布", "黑龙江"]
  },
  {
    "id": "4",
    "title": "女作家们谈“小说家笔下的女性力量”",
    "description": "多位女性作家就小说中的女性形象和力量进行深入讨论。",
    "cover": "http://example.com/cover4.jpg",
    "url": "https://news.sina.com.cn/w/2024-10-25/doc-ikyvckzq8119950.shtml",
    "hotCount": 3900,
    "tags": ["女性作家", "女性力量", "文学讨论"]
  },
  {
    "id": "5",
    "title": "《双面爱人》相差二十岁的姐弟恋",
    "description": "新书《双面爱人》探讨了年龄差异较大的恋爱关系，引发读者共鸣。",
    "cover": "http://example.com/cover5.jpg",
    "url": "https://news.sina.com.cn/d/2024-10-25/doc-ikyvckzq8119951.shtml",
    "hotCount": 3700,
    "tags": ["小说", "姐弟恋", "情感"]
  },
  {
    "id": "6",
    "title": "《情绪自由》如何走出职场情绪困境",
    "description": "《情绪自由》一书提供职场情绪管理的实用建议，帮助读者摆脱情绪困境。",
    "cover": "http://example.com/cover6.jpg",
    "url": "https://news.sina.com.cn/f/2024-10-25/doc-ikyvckzq8119952.shtml",
    "hotCount": 3500,
    "tags": ["职场", "情绪管理", "自我提升"]
  },
  {
    "id": "7",
    "title": "普京：解决乌克兰危机的和平协议方案必须基于现实",
    "description": "俄罗斯总统普京就乌克兰危机发表看法，强调和平协议必须基于现实情况。",
    "cover": "http://example.com/cover7.jpg",
    "url": "https://news.sina.com.cn/r/2024-10-25/doc-ikyvckzq8119953.shtml",
    "hotCount": 3300,
    "tags": ["国际政治", "乌克兰危机", "普京"]
  },
  {
    "id": "8",
    "title": "台风“潭美”在菲律宾已造成至少27人死亡",
    "description": "台风“潭美”登陆菲律宾，造成至少27人死亡，多地受灾严重。",
    "cover": "http://example.com/cover8.jpg",
    "url": "https://news.sina.com.cn/t/2024-10-25/doc-ikyvckzq8119954.shtml",
    "hotCount": 3100,
    "tags": ["台风", "自然灾害", "菲律宾"]
  },
  {
    "id": "9",
    "title": "布林肯访问卡塔尔讨论加沙和黎巴嫩局势",
    "description": "美国国务卿布林肯访问卡塔尔，就加沙和黎巴嫩地区局势进行讨论。",
    "cover": "http://example.com/cover9.jpg",
    "url": "https://news.sina.com.cn/y/2024-10-25/doc-ikyvckzq8119955.shtml",
    "hotCount": 2900,
    "tags": ["国际关系", "中东局势", "布林肯"]
  },
  {
    "id": "10",
    "title": "美高轨卫星解体影响有多大？业内专家解读",
    "description": "美国一颗高轨卫星解体，业内专家分析其可能带来的影响。",
    "cover": "http://example.com/cover10.jpg",
    "url": "https://news.sina.com.cn/u/2024-10-25/doc-ikyvckzq8119956.shtml",
    "hotCount": 2700,
    "tags": ["航天", "卫星解体", "专家解读"]
  },
  {
    "id": "11",
    "title": "美媒：美国大选结果可能引发欧洲“经济噩梦”",
    "description": "美国大选结果出炉，美媒分析其对欧洲经济可能产生的负面影响。",
    "cover": "http://example.com/cover11.jpg",
    "url": "https://news.sina.com.cn/i/2024-10-25/doc-ikyvckzq8119957.shtml",
    "hotCount": 2500,
    "tags": ["美国大选", "欧洲经济", "国际影响"]
  },
  {
    "id": "12",
    "title": "英媒：日本人口减少，女子大学以变求存",
    "description": "英国媒体报道，面对人口减少的挑战，日本女子大学寻求变革以求生存。",
    "cover": "http://example.com/cover12.jpg",
    "url": "https://news.sina.com.cn/o/2024-10-25/doc-ikyvckzq8119958.shtml",
    "hotCount": 2300,
    "tags": ["日本", "人口问题", "教育变革"]
  },
  {
    "id": "13",
    "title": "乌克兰对逃兵役丑闻追责，乌克兰总检察长辞职",
    "description": "乌克兰总检察长因涉及逃兵役丑闻而辞职，乌克兰政府对此事件进行追责。",
    "cover": "http://example.com/cover13.jpg",
    "url": "https://news.sina.com.cn/z/2024-10-25/doc-ikyvckzq8119959.shtml",
    "hotCount": 2100,
    "tags": ["乌克兰", "政治丑闻", "总检察长辞职"]
  },
  {
    "id": "14",
    "title": "黎真主党称使用“卡德尔2”型导弹打击以军基地",
    "description": "黎巴嫩真主党声称使用“卡德尔2”型导弹对以色列军事基地进行打击。",
    "cover": "http://example.com/cover14.jpg",
    "url": "https://news.sina.com.cn/a/2024-10-25/doc-ikyvckzq8119960.shtml",
    "hotCount": 1900,
    "tags": ["中东冲突", "黎巴嫩", "以色列"]
  },
  {
    "id": "15",
    "title": "美联储“褐皮书”：美多数地区制造业活动有所下降",
    "description": "美联储发布褐皮书，指出美国多数地区的制造业活动出现下降趋势。",
    "cover": "http://example.com/cover15.jpg",
    "url": "https://news.sina.com.cn/k/2024-10-25/doc-ikyvckzq8119961.shtml",
    "hotCount": 1700,
    "tags": ["美联储", "经济报告", "制造业"]
  },
  {
    "id": "16",
    "title": "美国对华芯片出口限制升级，中国外交部回应",
    "description": "美国对华芯片出口限制进一步升级，中国外交部对此作出回应。",
    "cover": "http://example.com/cover16.jpg",
    "url": "https://news.sina.com.cn/j/2024-10-25/doc-ikyvckzq8119962.shtml",
    "hotCount": 1500,
    "tags": ["中美关系", "芯片出口", "外交部回应"]
  },
  {
    "id": "17",
    "title": "中国外交部：美方应停止对台军售",
    "description": "中国外交部发言人表示，美方应停止对台湾地区的军事销售。",
    "cover": "http://example.com/cover17.jpg",
    "url": "https://news.sina.com.cn/l/2024-10-25/doc-ikyvckzq8119963.shtml",
    "hotCount": 1300,
    "tags": ["中美关系", "台湾问题", "外交部"]
  },
  {
    "id": "18",
    "title": "中国外交部：美方应停止在南海问题上挑衅",
    "description": "中国外交部发言人表示，美方应停止在南海问题上的挑衅行为。",
    "cover": "http://example.com/cover18.jpg",
    "url": "https://news.sina.com.cn/m/2024-10-25/doc-ikyvckzq8119964.shtml",
    "hotCount": 1100,
    "tags": ["中美关系", "南海问题", "外交部"]
  },
  {
    "id": "19",
    "title": "中国外交部：美方应停止对中国内政的干涉",
    "description": "中国外交部发言人表示，美方应停止对中国内政的干涉行为。",
    "cover": "http://example.com/cover19.jpg",
    "url": "https://news.sina.com.cn/n/2024-10-25/doc-ikyvckzq8119965.shtml",
    "hotCount": 900,
    "tags": ["中美关系", "中国内政", "外交部"]
  },
  {
    "id": "20",
    "title": "中国外交部：美方应停止对中国的无端指责",
    "description": "中国外交部发言人表示，美方应停止对中国的无端指责和污蔑。",
    "cover": "http://example.com/cover20.jpg",
    "url": "https://news.sina.com.cn/b/2024-10-25/doc-ikyvckzq8119966.shtml",
    "hotCount": 700,
    "tags": ["中美关系", "无端指责", "外交部"]
  },
  {
    "id": "21",
    "title": "中国外交部：美方应停止对中国的贸易战",
    "description": "中国外交部发言人表示，美方应停止对中国的贸易战行为。",
    "cover": "http://example.com/cover21.jpg",
    "url": "https://news.sina.com.cn/v/2024-10-25/doc-ikyvckzq8119967.shtml",
    "hotCount": 500,
    "tags": ["中美关系", "贸易战", "外交部"]
  },
  {
    "id": "22",
    "title": "中国外交部：美方应停止对中国的科技封锁",
    "description": "中国外交部发言人表示，美方应停止对中国的科技封锁行为。",
    "cover": "http://example.com/cover22.jpg",
    "url": "https://news.sina.com.cn/w/2024-10-25/doc-ikyvckzq8119968.shtml",
    "hotCount": 300,
    "tags": ["中美关系", "科技封锁", "外交部"]
  },
  {
    "id": "23",
    "title": "中国外交部：美方应停止对中国的网络攻击",
    "description": "中国外交部发言人表示，美方应停止对中国的网络攻击行为。",
    "cover": "http://example.com/cover23.jpg",
    "url": "https://news.sina.com.cn/x/2024-10-25/doc-ikyvckzq8119969.shtml",
    "hotCount": 100,
    "tags": ["中美关系", "网络攻击", "外交部"]
  },
  {
    "id": "24",
    "title": "中国外交部：美方应停止对中国的诽谤",
    "description": "中国外交部发言人表示，美方应停止对中国的诽谤和污蔑行为。",
    "cover": "http://example.com/cover24.jpg",
    "url": "https://news.sina.com.cn/c/2024-10-25/doc-ikyvckzq8119970.shtml",
    "hotCount": 150,
    "tags": ["中美关系", "诽谤", "外交部"]
  },
  {
    "id": "25",
    "title": "中国外交部：美方应停止对中国的污蔑",
    "description": "中国外交部发言人表示，美方应停止对中国的污蔑和诽谤行为。",
    "cover": "http://example.com/cover25.jpg",
    "url": "https://news.sina.com.cn/z/2024-10-25/doc-ikyvckzq8119971.shtml",
    "hotCount": 200,
    "tags": ["中美关系", "污蔑", "外交部"]
  },
  {
    "id": "26",
    "title": "中国外交部：美方应停止对中国的诋毁",
    "description": "中国外交部发言人表示，美方应停止对中国的诋毁和污蔑行为。",
    "cover": "http://example.com/cover26.jpg",
    "url": "https://news.sina.com.cn/d/2024-10-25/doc-ikyvckzq8119972.shtml",
    "hotCount": 250,
    "tags": ["中美关系", "诋毁", "外交部"]
  },
  {
    "id": "27",
    "title": "中国外交部：美方应停止对中国的抹黑",
    "description": "中国外交部发言人表示，美方应停止对中国的抹黑和污蔑行为。",
    "cover": "http://example.com/cover27.jpg",
    "url": "https://news.sina.com.cn/f/2024-10-25/doc-ikyvckzq8119973.shtml",
    "hotCount": 300,
    "tags": ["中美关系", "抹黑", "外交部"]
  },
  {
    "id": "28",
    "title": "中国外交部：美方应停止对中国的攻击",
    "description": "中国外交部发言人表示，美方应停止对中国的攻击和污蔑行为。",
    "cover": "http://example.com/cover28.jpg",
    "url": "https://news.sina.com.cn/g/2024-10-25/doc-ikyvckzq8119974.shtml",
    "hotCount": 350,
    "tags": ["中美关系", "攻击", "外交部"]
  },
  {
    "id": "29",
    "title": "中国外交部：美方应停止对中国的干涉",
    "description": "中国外交部发言人表示，美方应停止对中国的干涉和污蔑行为。",
    "cover": "http://example.com/cover29.jpg",
    "url": "https://news.sina.com.cn/h/2024-10-25/doc-ikyvckzq8119975.shtml",
    "hotCount": 400,
    "tags": ["中美关系", "干涉", "外交部"]
  },
  {
    "id": "30",
    "title": "中国外交部：美方应停止对中国的无理指责",
    "description": "中国外交部发言人表示，美方应停止对中国的无理指责和污蔑行为。",
    "cover": "http://example.com/cover30.jpg",
    "url": "https://news.sina.com.cn/t/2024-10-25/doc-ikyvckzq8119976.shtml",
    "hotCount": 450,
  },
];

export const mockedGithub: News[] = [
  {
    "id": '981',
    "title": "996icu",
    "description": "反对996工作制的项目",
    "cover": "http://example.com/cover1.jpg",
    "url": "https://github.com/996icu/996.ICU",
    "hotCount": 255000,
    "tags": ["996", "劳动权益"]
  },
  {
    "id": '982',
    "title": "JavaGuide",
    "description": "Java面试指南",
    "cover": "http://example.com/cover2.jpg",
    "url": "https://github.com/Snailclimb/JavaGuide",
    "hotCount": 100000,
    "tags": ["Java", "面试"]
  },
  {
    "id": '983',
    "title": "labuladong's Algorithms",
    "description": "算法学习指南",
    "cover": "http://example.com/cover3.jpg",
    "url": "https://github.com/labuladong/fucking-algorithm",
    "hotCount": 95000,
    "tags": ["算法", "LeetCode"]
  },
  {
    "id": '984',
    "title": "FreeComputerBooks",
    "description": "免费的计算机编程类中文书籍",
    "cover": "http://example.com/cover4.jpg",
    "url": "https://github.com/FreeComputerBooks/free-computer-science",
    "hotCount": 90000,
    "tags": ["免费书籍", "编程"]
  },
  {
    "id": '985',
    "title": "Hello-Algorithm",
    "description": "动画图解、一键运行的数据结构与算法教程",
    "cover": "http://example.com/cover5.jpg",
    "url": "https://github.com/haoel/hello-algorithm",
    "hotCount": 85000,
    "tags": ["算法", "教程"]
  },
  {
    "id": '986',
    "title": "Ant-Design",
    "description": "企业级UI设计语言和React组件库",
    "cover": "http://example.com/cover6.jpg",
    "url": "https://github.com/ant-design/ant-design",
    "hotCount": 80000,
    "tags": ["UI框架", "React"]
  },
  {
    "id": "987",
    "title": "share-github-projects",
    "description": "分享GitHub上有趣、入门级的开源项目",
    "cover": "http://example.com/cover7.jpg",
    "url": "https://github.com/MunGell/awesome-for-beginners",
    "hotCount": 75000,
    "tags": ["开源项目", "入门级"]
  },
  {
    "id": "988",
    "title": "vue-element-admin",
    "description": "后台前端解决方案",
    "cover": "http://example.com/cover8.jpg",
    "url": "https://github.com/PanJiaChen/vue-element-admin",
    "hotCount": 70000,
    "tags": ["Vue", "后台"]
  },
  {
    "id": "989",
    "title": "frp",
    "description": "内网穿透的高性能反向代理应用",
    "cover": "http://example.com/cover9.jpg",
    "url": "https://github.com/fatedier/frp",
    "hotCount": 65000,
    "tags": ["内网穿透", "代理"]
  },
  {
    "id": "9810",
    "title": "GitHub-Chinese-Top-Charts",
    "description": "GitHub中文排行榜",
    "cover": "http://example.com/cover10.jpg",
    "url": "https://github.com/2noise/ChatTTS",
    "hotCount": 60000,
    "tags": ["中文项目", "排行榜"]
  }
];
