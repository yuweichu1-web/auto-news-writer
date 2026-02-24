// writer.js - AI改写模块（调用后端API）

class NewsWriter {
  constructor() {
    this.currentResult = '';
    this.currentNews = null;
    this.currentStyle = 'vlog';
    this.currentFormat = 'short';
    // 后端API地址
    this.apiBase = '';
  }

  // 改写新闻
  async rewrite(news, format = 'short', style = 'vlog') {
    this.currentNews = news;
    this.currentFormat = format;
    this.currentStyle = style;

    try {
      const response = await fetch(`${this.apiBase}/api/rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          news: news,
          format: format,
          style: style
        })
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const result = await response.json();

      if (result.success) {
        this.currentResult = result.data;
        return result.data;
      } else {
        throw new Error(result.error || '改写失败');
      }
    } catch (e) {
      console.log('改写失败，使用本地生成:', e);
      // 失败时使用本地生成
      return this.generateContent(news, format, style);
    }
  }

  // 生成内容（本地备用）
  generateContent(news, format, style) {
    if (format === 'short') {
      return this.generateShortContent(news, style);
    } else {
      return this.generateLongContent(news, style);
    }
  }

  // 生成短文案
  generateShortContent(news, style) {
    const templates = {
      vlog: `哇塞！兄弟们，最新消息来了！${news.title}，这波真的有点东西！\n\n讲真，看完这个我整个人都激动了。${news.summary.substring(0, 60)}...\n\n兄弟们，你们觉得这车怎么样？评论区聊聊！🚗💨`,
      review: `【新车快讯】${news.title}\n\n${news.summary}\n\n从专业角度来看，这次更新确实很有诚意。产品力提升明显，无论是配置还是价格都很有竞争力。建议感兴趣的朋友可以关注一下实车表现。`,
      push: `🔥重磅推荐！${news.title}！\n\n${news.summary}\n\n真的！这次太给力了！宝子们，这波绝对不能错过！\n\n私我了解详情，还有额外福利！先到先得！冲鸭！🎉`,
      news: `【汽车资讯】${news.title}\n\n${news.summary}\n\n记者了解到，该车型/技术的推出将进一步丰富消费者的选择空间。具体售价及配置信息，请关注官方后续报道。`
    };

    return templates[style] || templates.vlog;
  }

  // 生成长文章
  generateLongContent(news, style) {
    return `🚗 ${news.title}\n\n——我是分割线——\n\n家人们！今天来聊聊刚刚收到的重磅消息！${news.title}！\n\n说实话，当我第一眼看到这个新闻的时候，整个人都精神了！${news.summary}\n\n今天咱们就好好聊聊这个事儿。首先呢，这个时间点发布，确实很有意思。大家都知道，最近汽车圈那是相当的卷，各大厂商都在发力。\n\n从目前曝光的信息来看，这次的新品/新技术确实有不少亮点：\n\n1️⃣ 第一个亮点...（此处省略100字）\n2️⃣ 第二个亮点...（此处省略100字）\n3️⃣ 第三个亮点...（此处省略100字）\n\n总的来说呢，这次的诚意还是相当足的。当然，具体表现怎么样，还得看实车。\n\n好了，今天的分享就到这里。兄弟们有什么看法，欢迎评论区聊聊！咱们下期再见！👋`;
  }

  // 重新生成
  async regenerate() {
    if (!this.currentNews) {
      throw new Error('没有可重新生成的内容');
    }
    return this.rewrite(this.currentNews, this.currentFormat, this.currentStyle);
  }

  // 获取当前结果
  getCurrentResult() {
    return this.currentResult;
  }
}

// 创建全局实例
const newsWriter = new NewsWriter();
