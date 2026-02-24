// fetcher.js - 新闻抓取模块

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

  // 获取新闻
  async fetchNews(timeRange = 1) {
    if (this.selectedSources.size === 0) {
      throw new Error('请至少选择一个新闻源');
    }

    const selectedSources = this.getSelectedSources();

    // 模拟新闻数据（实际应用中需要从后端API获取）
    const mockNews = this.generateMockNews(selectedSources, timeRange);

    // 按时间排序
    mockNews.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));

    this.newsData = mockNews;
    return mockNews;
  }

  // 生成模拟新闻数据
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
      },
      {
        title: '方程豹豹5销量破万 硬派越野市场再掀波澜',
        summary: '方程豹官方宣布，豹5上市首月销量突破1万台。凭借DMO超级混动越野平台，成为硬派越野市场新宠。',
        source: 'autohome'
      },
      {
        title: '小鹏X9正式发布 定位纯电智能MPV',
        summary: '小鹏汽车正式发布X9，定位纯电智能MPV，配备后轮转向、空气悬架等配置，预售价38.8万元起。',
        source: 'yiche'
      }
    ];

    const news = [];
    sourceIds.forEach(sourceId => {
      // 每个源随机取2-4条新闻
      const count = Math.floor(Math.random() * 3) + 2;
      const shuffled = [...newsTemplates].filter(n => n.source === sourceId || Math.random() > 0.5);

      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const template = shuffled[i];
        const hoursAgo = Math.floor(Math.random() * timeRange * 24);

        news.push({
          id: `${sourceId}_${Date.now()}_${i}`,
          title: template.title,
          summary: template.summary,
          source: sourceId,
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
