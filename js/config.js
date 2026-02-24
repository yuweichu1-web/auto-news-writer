// config.js - 新闻源配置

// 预设新闻源
const NEWS_SOURCES = [
  {
    id: 'autohome',
    name: '汽车之家',
    url: 'https://www.autohome.com.cn',
    icon: '🚗',
    category: '权威汽车媒体'
  },
  {
    id: 'yiche',
    name: '易车',
    url: 'https://www.yiche.com',
    icon: '🚙',
    category: '汽车垂直平台'
  },
  {
    id: 'dongche',
    name: '懂车帝',
    url: 'https://www.dongche.com',
    icon: '🏎️',
    category: '字节跳动汽车'
  },
  {
    id: 'pcauto',
    name: '太平洋汽车',
    url: 'https://www.pcauto.com.cn',
    icon: '🚘',
    category: '汽车门户'
  },
  {
    id: 'sina',
    name: '新浪汽车',
    url: 'https://auto.sina.com.cn',
    icon: '🚔',
    category: '综合汽车媒体'
  }
];

// 写作风格配置
const WRITING_STYLES = {
  vlog: {
    name: 'vlog风',
    emoji: '🎬',
    description: '活泼口语，像拍视频时说的话',
    prompt: `你是一位资深的汽车博主，用生动的vlog风格来改写这段新闻。要求：
1. 使用口语化、活泼的语言
2. 适当加入语气词和感叹
3. 就像在和观众聊天一样
4. 保持内容的真实性
5. 长度控制在100-300字`
  },
  review: {
    name: '专业评测风',
    emoji: '📊',
    description: '客观数据感，像老司机点评',
    prompt: `你是一位资深的汽车评测师，用专业但易懂的语言来改写这段新闻。要求：
1. 保持客观理性的态度
2. 适当加入数据和专业术语
3. 像老司机分享经验一样
4. 分析产品的优缺点
5. 长度控制在100-300字`
  },
  push: {
    name: '种草安利风',
    emoji: '❤️',
    description: '夸张情绪强，推荐购买',
    prompt: `你是一位热情的种草博主，用极具感染力的语言来推荐这款车型。要求：
1. 充满热情和激情
2. 突出产品的亮点和优势
3. 适当使用夸张的表达
4. 激发读者的购买欲望
5. 长度控制在100-300字`
  },
  news: {
    name: '新闻报道风',
    emoji: '📰',
    description: '简洁客观，保持新闻性',
    prompt: `你是一位专业的汽车编辑，用新闻报道的方式来呈现这条资讯。要求：
1. 语言简洁明了
2. 保持客观中立
3. 突出新闻价值点
4. 使用规范的新闻语言
5. 长度控制在100-300字`
  }
};

// 输出格式配置
const OUTPUT_FORMATS = {
  short: {
    name: '短文案',
    emoji: '📝',
    description: '适合朋友圈、微博、头条号',
    wordCount: '100-300字'
  },
  long: {
    name: '长文章',
    emoji: '📄',
    description: '适合公众号、博客、百家号',
    wordCount: '500-1500字'
  }
};

// 时间范围选项
const TIME_RANGES = {
  1: { name: '今天', hours: 24 },
  3: { name: '3天内', hours: 72 },
  7: { name: '7天内', hours: 168 }
};
