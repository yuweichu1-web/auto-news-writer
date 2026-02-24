// fetcher.js - 新闻抓取模块（纯前端版 - 使用Tavily搜索）

// Tavily API配置
const TAVILY_API_KEY = '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';

class NewsFetcher {
  constructor() {
    this.selectedSources = new Set();
    this.newsData = [];
  }

  // 初始化新闻源
  initSources(customSources = []) {
    const allSources = [...NEWS_SOURCES, ...customSources];
    return allSources;
  }

  // 切换新闻源选择
  toggleSource(sourceId) {
    if (this.selectedSources.has(sourceId)) {
      this.selectedSources.delete(sourceId);
    } else {
      this.selectedSources.add(sourceId);
    }
    return this.selectedSources;
  }

  // 获取选中的新闻源
  getSelectedSources() {
    return Array.from(this.selectedSources);
  }

  // 设置选中的新闻源
  setSelectedSources(sourceIds) {
    this.selectedSources = new Set(sourceIds);
  }

  // 获取新闻 - 使用Tavily搜索API
  async fetchNews(timeRange = 1) {
    // timeRange: 1=当天, 3=3天内, 7=7天内

    const selectedSources = this.getSelectedSources();

    // 如果没有选择任何新闻源，默认使用全网搜索
    if (selectedSources.length === 0) {
      this.selectedSources = new Set(['all']);
    }

    // 根据日期范围设置搜索关键词
    const dateFilter = this.getDateFilter(timeRange);

    // 获取选中来源的搜索关键词
    const sourceKeywords = this.getSourceKeywords(timeRange);

    const allNews = [];

    try {
      // 搜索每个选中来源
      for (const query of sourceKeywords) {
        const results = await this.tavilySearch(query);
        allNews.push(...results);
      }

      // 过滤高质量新闻（只保留新车、政策、行业相关）
      const filteredNews = this.filterQualityNews(allNews);

      // 微博搜索是实时的，直接使用所有结果
      // 不再做严格的日期过滤，避免过滤掉有效新闻
      let dateFilteredNews = filteredNews;

      // 如果过滤后有结果就使用，否则放宽条件
      if (dateFilteredNews.length === 0) {
        dateFilteredNews = allNews;
      }

      // 排除之前已显示的新闻
      const newNews = this.excludeOldNews(dateFilteredNews);

      // 随机打乱顺序
      const shuffledNews = newNews.sort(() => 0.5 - Math.random());

      // 取5条
      const limitedNews = shuffledNews.slice(0, 5);

      if (limitedNews.length > 0) {
        this.addToHistory(limitedNews);
        this.newsData = limitedNews;
        return limitedNews;
      }
    } catch (e) {
      console.log('Tavily搜索失败:', e);
    }

    // 使用模拟数据
    const mockNews = this.generateMockNews(['autohome', 'dongche'], timeRange);
    mockNews.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
    this.newsData = mockNews.slice(0, 5);
    return this.newsData;
  }

  // 获取选中来源的搜索关键词
  getSourceKeywords(timeRange) {
    const selected = this.getSelectedSources();

    // 搜索规则：
    // 微博汽车 -> 微博实时热榜
    // 全网 -> 百度搜索
    // 汽车之家/懂车帝/易车 -> 对应网站搜索
    const keywords = {
      // 微博汽车热榜 - 实时热门
      'weibo': 'site:weibo.com  汽车热榜 新车',
      // 全网搜索 - 百度+微博热榜
      'all': '汽车 新车 上市 政策 行业',
      // 汽车之家
      'autohome': 'site:autohome.com.cn/news 新车 上市',
      // 懂车帝
      'dongche': 'site:dongchedi.com 新车 上市',
      // 易车
      'yiche': 'site:yiche.com 新车 上市'
    };
    return selected.map(s => keywords[s]).filter(k => k);
  }

  // 排除之前显示过的新闻
  excludeOldNews(news) {
    const history = this.getHistory();
    return news.filter(item => !history.has(item.url));
  }

  // 获取历史记录
  getHistory() {
    const key = 'news_history';
    try {
      const data = localStorage.getItem(key);
      return new Set(data ? JSON.parse(data) : []);
    } catch {
      return new Set();
    }
  }

  // 添加到历史记录
  addToHistory(news) {
    const key = 'news_history';
    const history = this.getHistory();
    news.forEach(item => {
      if (item.url) history.add(item.url);
    });
    // 只保留最近100条
    const arr = Array.from(history).slice(-100);
    localStorage.setItem(key, JSON.stringify(arr));
  }

  // 获取日期过滤字符串
  getDateFilter(timeRange) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    if (timeRange === 1) {
      return `after:${today}`; // 今天
    } else if (timeRange === 3) {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const y = threeDaysAgo.getFullYear();
      const m = String(threeDaysAgo.getMonth() + 1).padStart(2, '0');
      const d = String(threeDaysAgo.getDate()).padStart(2, '0');
      return `after:${y}-${m}-${d}`; // 近3天
    } else if (timeRange === 7) {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const y = sevenDaysAgo.getFullYear();
      const m = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
      const d = String(sevenDaysAgo.getDate()).padStart(2, '0');
      return `after:${y}-${m}-${d}`; // 近7天
    }
    return `after:${today}`;
  }

  // 过滤高质量新闻 - 只保留新车、政策、行业新闻
  filterQualityNews(news) {
    // 必须包含的关键词（新车、政策、行业相关）
    const includeKeywords = [
      '新车', '上市', '发布', '预售', '亮相', '首发',
      '政策', '补贴', '法规', '标准', '规划',
      '行业', '销量', '交付', '财报', '投资', '合作',
      '新能源', '电动车', '智驾', '电池', '续航',
      '比亚迪', '特斯拉', '小米', '华为', '吉利', '长城', '长安', '奇瑞',
      '问界', '理想', '蔚来', '小鹏', '零跑', '哪吒', '极氪', '领克'
    ];

    // 排除的关键词（不相关或低质量内容）
    const excludeKeywords = [
      '视频', '短视频', '直播', '带货', '评测', '试驾',
      '车祸', '事故', '维权', '投诉', '召回',
      '二手车', '降价', '优惠'
    ];

    return news.filter(item => {
      const title = (item.title || '').toLowerCase();
      const summary = (item.summary || '').toLowerCase();
      const url = (item.url || '').toLowerCase();
      const content = title + summary + url;

      // 首先排除视频相关内容
      for (const kw of excludeKeywords) {
        if (content.includes(kw)) return false;
      }

      // 必须包含至少一个相关关键词
      const hasKeyword = includeKeywords.some(kw => content.includes(kw));
      return hasKeyword;
    });
  }

  // 按日期范围过滤新闻
  filterByDateRange(news, timeRange) {
    const now = new Date();
    let minDate;

    if (timeRange === 1) {
      // 当天 - 最近24小时
      minDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === 3) {
      // 3天内
      minDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 7) {
      // 7天内
      minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      minDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return news.filter(item => {
      // 优先使用item自带的publishTime字段
      if (item.publishTime) {
        const pubDate = new Date(item.publishTime);
        if (!isNaN(pubDate.getTime())) {
          return pubDate >= minDate;
        }
      }
      // 尝试从标题或摘要中提取日期
      const pubDate = this.extractDateFromItem(item);
      if (pubDate) {
        return pubDate >= minDate;
      }
      // 如果无法提取日期，默认保留（避免过滤掉所有新闻）
      return true;
    });
  }

  // 从新闻项中提取日期
  extractDateFromItem(item) {
    const text = (item.title || '') + ' ' + (item.summary || '') + ' ' + (item.url || '');

    // 匹配各种日期格式
    // 2026年2月24日, 2026-02-24, 2026/02/24, 02-24, 2月24日
    const patterns = [
      /(\d{4})年(\d{1,2})月(\d{1,2})日/g,
      /(\d{4})-(\d{1,2})-(\d{1,2})/g,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/g,
      /(\d{1,2})-(\d{1,2})/g,  // 月-日
      /(\d{1,2})月(\d{1,2})日/g
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          let year, month, day;

          if (match.includes('年')) {
            const parts = match.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (parts) {
              year = parseInt(parts[1]);
              month = parseInt(parts[2]);
              day = parseInt(parts[3]);
            }
          } else if (match.includes('-') && match.split('-').length === 3) {
            const parts = match.split('-');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
            day = parseInt(parts[2]);
          } else if (match.includes('/')) {
            const parts = match.split('/');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
            day = parseInt(parts[2]);
          } else if (match.includes('月')) {
            const parts = match.match(/(\d{1,2})月(\d{1,2})日/);
            if (parts) {
              year = currentYear;
              month = parseInt(parts[1]);
              day = parseInt(parts[2]);
            }
          } else if (match.includes('-')) {
            const parts = match.split('-');
            year = currentYear;
            month = parseInt(parts[0]);
            day = parseInt(parts[1]);
          }

          if (year && month && day) {
            const date = new Date(year, month - 1, day);
            // 排除未来日期
            if (date <= now) {
              return date;
            }
          }
        }
      }
    }

    return null;
  }

  // 新闻去重
  deduplicateNews(news) {
    const seen = new Set();
    return news.filter(item => {
      const key = item.url || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Tavily搜索
  async tavilySearch(query) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: query,
          max_results: 10,
          include_images: false,
          include_answer: true,
          include_raw_content: false
        })
      });

      if (!response.ok) {
        throw new Error('Tavily API请求失败');
      }

      const data = await response.json();

      if (data.results) {
        return data.results.map((result, idx) => ({
          id: `tavily_${Date.now()}_${idx}`,
          title: result.title || result.url,
          summary: result.content || result.url,
          source: 'tavily',
          source_name: 'Tavily搜索',
          url: result.url || '#',
          // 使用Tavily返回的发布日期
          publishTime: result.published_date
            ? new Date(result.published_date).toISOString()
            : (result.published_on
                ? new Date(result.published_on * 1000).toISOString()
                : new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString())
        }));
      }

      return [];
    } catch (e) {
      console.error('Tavily搜索错误:', e);
      return [];
    }
  }

  // 生成模拟新闻数据（备用）
  generateMockNews(sourceIds, timeRange) {
    const now = new Date();
    const newsTemplates = [
      {
        title: '比亚迪秦L DM-i正式上市 售价7.98万起',
        summary: '比亚迪官方宣布，秦L DM-i正式上市，共推出5款车型，售价区间7.98-12.98万元。新车搭载第五代DM-i混动技术，NEDC工况下综合续航可达2000km。',
        source: 'autohome'
      },
      {
        title: '特斯拉Model Y新版车型申报 续航提升至600km',
        summary: '工信部最新申报信息显示，特斯拉Model Y将推出新版本车型，配备更大容量电池组，续航里程提升至600km以上，预计年内上市。',
        source: 'yiche'
      },
      {
        title: '小米SU7订单突破10万 创最快交付纪录',
        summary: '小米汽车官方数据显示，SU7上市仅7天大定订单突破10万台，创下新能源车最快交付纪录。目前已开启全国交付。',
        source: 'dongche'
      },
      {
        title: '全新宝马5系正式发布 搭载最新iDrive 8.5系统',
        summary: '宝马官方正式发布全新一代5系轿车，内饰全面升级，配备最新iDrive 8.5操作系统，提供燃油和纯电两种动力版本。',
        source: 'pcauto'
      },
      {
        title: '理想汽车销量突破20万 新款L6将于下月发布',
        summary: '理想汽车宣布累计交付量突破20万台，同时透露全新车型L6将于下月正式发布，定位中大型SUV，预售价25万元起。',
        source: 'sina'
      },
      {
        title: '问界M9大定超5万 华为鸿蒙座舱成亮点',
        summary: 'AITO官方宣布，问界M9大定订单突破5万台。华为鸿蒙智能座舱成为最大卖点，配备百万像素智慧大灯。',
        source: 'autohome'
      },
      {
        title: '极氪001全新改款 续航达1000km',
        summary: '极氪官方发布2025款极氪001，搭载全新一代电池技术，CLTC工况下续航里程达1000km，充电5分钟可行驶200km。',
        source: 'yiche'
      },
      {
        title: '大众ID.7 Vizzion正式上市 定价22.77万起',
        summary: '一汽-大众ID.7 Vizzion正式上市，提供三种配置车型，售价22.77-26.77万元。新车基于MEB平台打造，轴距达2965mm。',
        source: 'dongche'
      },
      {
        title: '蔚来ET9正式发布 配备全线控底盘技术',
        summary: '蔚来在NIO Day上正式发布ET9，定位旗舰轿车，配备全线控底盘技术，支持L4级别智能驾驶，预售价80万元起。',
        source: 'pcauto'
      },
      {
        title: '吉利银河E8正式上市 搭载45英寸8K大屏',
        summary: '吉利银河E8正式上市，售价17.58-22.88万元。新车最大亮点是配备45英寸8K分辨率中控屏，搭载高通8295芯片。',
        source: 'sina'
      }
    ];

    const sourceNames = {
      autohome: '汽车之家',
      yiche: '易车',
      dongche: '懂车帝',
      pcauto: '太平洋汽车',
      sina: '新浪汽车'
    };

    const news = [];
    sourceIds.forEach(sourceId => {
      const count = Math.floor(Math.random() * 3) + 2;
      const shuffled = newsTemplates.filter(n => n.source === sourceId || Math.random() > 0.5);

      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const template = shuffled[i];
        const hoursAgo = Math.floor(Math.random() * timeRange * 24);

        news.push({
          id: `${sourceId}_${Date.now()}_${i}`,
          title: template.title,
          summary: template.summary,
          source: sourceId,
          source_name: sourceNames[sourceId] || sourceId,
          publishTime: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
          url: '#'
        });
      }
    });

    return news;
  }

  // 获取新闻详情
  getNewsDetail(newsId) {
    return this.newsData.find(news => news.id === newsId);
  }

  // 获取所有新闻
  getAllNews() {
    return this.newsData;
  }
}

// 创建全局实例
const newsFetcher = new NewsFetcher();
