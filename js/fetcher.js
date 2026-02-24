// fetcher.js - 新闻抓取模块（调用后端API）

class NewsFetcher {
  constructor() {
    this.selectedSources = new Set();
    this.newsData = [];
    // 后端API地址
    this.apiBase = 'https://auto-news-writer-1.onrender.com';
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

  // 获取新闻 - 调用后端API
  async fetchNews(timeRange = 1) {
    const selectedSources = this.getSelectedSources();

    // 如果没有选择任何新闻源，默认使用全网搜索
    if (selectedSources.length === 0) {
      this.selectedSources = new Set(['all']);
    }

    const sources = this.getSelectedSources().join(',');

    try {
      const response = await fetch(`${this.apiBase}/api/news?sources=${sources}&timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const result = await response.json();

      if (result.success) {
        this.newsData = result.data;
        // 保存到历史
        if (result.data.length > 0) {
          this.addToHistory(result.data);
        }
        return result.data;
      } else {
        throw new Error(result.error || '获取新闻失败');
      }
    } catch (e) {
      console.log('获取新闻失败，使用模拟数据:', e);
      // 失败时使用模拟数据
      return this.generateMockNews(['weibo', 'all'], timeRange);
    }
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

  // 生成模拟新闻数据（备用）
  generateMockNews(sourceIds, timeRange) {
    const now = new Date();
    const newsTemplates = [
      {
        title: '比亚迪秦L DM-i正式上市 售价7.98万起',
        summary: '比亚迪官方宣布，秦L DM-i正式上市，共推出5款车型，售价区间7.98-12.98万元。新车搭载第五代DM-i混动技术，NEDC工况下综合续航可达2000km。',
        source: 'weibo'
      },
      {
        title: '特斯拉Model Y新版车型申报 续航提升至600km',
        summary: '工信部最新申报信息显示，特斯拉Model Y将推出新版本车型，配备更大容量电池组，续航里程提升至600km以上，预计年内上市。',
        source: 'autohome'
      },
      {
        title: '小米SU7订单突破10万 创最快交付纪录',
        summary: '小米汽车官方数据显示，SU7上市仅7天大定订单突破10万台，创下新能源车最快交付纪录。目前已开启全国交付。',
        source: 'weibo'
      },
      {
        title: '全新宝马5系正式发布 搭载最新iDrive 8.5系统',
        summary: '宝马官方正式发布全新一代5系轿车，内饰全面升级，配备最新iDrive 8.5操作系统，提供燃油和纯电两种动力版本。',
        source: 'dongche'
      },
      {
        title: '理想汽车销量突破20万 新款L6将于下月发布',
        summary: '理想汽车宣布累计交付量突破20万台，同时透露全新车型L6将于下月正式发布，定位中大型SUV，预售价25万元起。',
        source: 'yiche'
      }
    ];

    const sourceNames = {
      weibo: '微博汽车',
      autohome: '汽车之家',
      dongche: '懂车帝',
      yiche: '易车'
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
