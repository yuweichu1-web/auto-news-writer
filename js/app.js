// app.js - 主应用逻辑

class App {
  constructor() {
    this.selectedNews = null;
    this.customSources = [];
    this.init();
  }

  // 初始化
  init() {
    this.loadCustomSources();
    this.renderSourceList();
    this.bindEvents();
    this.renderHistory();
    this.loadSettings();
    // 默认选中所有新闻源
    const allSources = newsFetcher.initSources(this.customSources);
    newsFetcher.setSelectedSources(['autohome', 'dongche', 'yiche', 'newcar', 'bignews']);
    this.renderSourceList();
  }

  // 加载自定义新闻源
  loadCustomSources() {
    this.customSources = storageManager.getCustomSources();
  }

  // 渲染新闻源列表
  renderSourceList() {
    const container = document.getElementById('sourceList');
    const allSources = newsFetcher.initSources(this.customSources);

    container.innerHTML = allSources.map(source => `
      <label class="source-item ${this.isSourceSelected(source.id) ? 'selected' : ''}" data-source-id="${source.id}">
        <input type="checkbox" class="source-checkbox" value="${source.id}" ${this.isSourceSelected(source.id) ? 'checked' : ''}>
        <span class="source-icon">${source.icon || '📰'}</span>
        <span class="source-name">${source.name}</span>
        ${source.isCustom ? '<span class="custom-badge">自定义</span>' : ''}
      </label>
    `).join('');

    // 绑定点击事件
    container.querySelectorAll('.source-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.type !== 'checkbox') {
          const checkbox = item.querySelector('input[type="checkbox"]');
          checkbox.checked = !checkbox.checked;
          this.onSourceChange(checkbox.value, checkbox.checked);
        }
      });
    });
  }

  // 检查新闻源是否被选中
  isSourceSelected(sourceId) {
    return newsFetcher.getSelectedSources().includes(sourceId);
  }

  // 新闻源变更
  onSourceChange(sourceId, checked) {
    if (checked) {
      newsFetcher.toggleSource(sourceId);
    } else {
      newsFetcher.toggleSource(sourceId);
    }
    this.renderSourceList();
  }

  // 绑定事件
  bindEvents() {
    // 获取新闻按钮
    document.getElementById('fetchNewsBtn').addEventListener('click', () => this.fetchNews());

    // 添加自定义新闻源
    document.getElementById('addSourceBtn').addEventListener('click', () => this.showAddSourceModal());
    document.getElementById('closeModalBtn').addEventListener('click', () => this.hideAddSourceModal());
    document.getElementById('cancelAddBtn').addEventListener('click', () => this.hideAddSourceModal());
    document.getElementById('confirmAddBtn').addEventListener('click', () => this.addCustomSource());

    // AI改写按钮
    document.getElementById('rewriteBtn').addEventListener('click', () => this.rewriteNews());

    // 复制按钮
    document.getElementById('copyBtn').addEventListener('click', () => this.copyResult());

    // 下载按钮
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadResult());

    // 重新生成按钮
    document.getElementById('regenerateBtn').addEventListener('click', () => this.regenerateResult());

    // 模态框点击背景关闭
    document.getElementById('customSourceModal').addEventListener('click', (e) => {
      if (e.target.id === 'customSourceModal') {
        this.hideAddSourceModal();
      }
    });
  }

  // 获取新闻
  async fetchNews() {
    const selectedSources = newsFetcher.getSelectedSources();

    if (selectedSources.length === 0) {
      this.showToast('请至少选择一个新闻源', 'error');
      return;
    }

    // 获取时间范围
    const timeRangeEl = document.querySelector('input[name="timeRange"]:checked');
    const timeRange = timeRangeEl ? parseInt(timeRangeEl.value) : 1;

    try {
      this.showLoading('正在获取新闻...');
      const news = await newsFetcher.fetchNews(timeRange);
      this.hideLoading();

      this.renderNewsList(news);
      this.showToast(`获取到 ${news.length} 条新闻`, 'success');
    } catch (error) {
      this.hideLoading();
      this.showToast(error.message, 'error');
    }
  }

  // 渲染新闻列表
  renderNewsList(news) {
    const container = document.getElementById('newsList');
    const section = document.getElementById('newsSection');
    const countEl = document.getElementById('newsCount');

    section.style.display = 'block';
    countEl.textContent = `${news.length} 条`;

    container.innerHTML = news.map((item, index) => `
      <div class="news-card bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 ${this.selectedNews?.id === item.id ? 'selected' : ''}" data-news-id="${item.id}">
        <div class="news-checkbox mt-1">
          <input type="radio" name="selectedNews" value="${item.id}" ${this.selectedNews?.id === item.id ? 'checked' : ''}>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${String(index + 1).padStart(2, '0')}</span>
            <span class="source-tag">${this.getSourceName(item.source)}</span>
            <span class="time-tag">${this.formatTime(item.publishTime)}</span>
            ${item.url && item.url !== '#' ? `<a href="${item.url}" target="_blank" class="text-xs text-blue-500 hover:underline" onclick="event.stopPropagation()">查看原文 →</a>` : ''}
          </div>
          <h3 class="font-medium text-gray-800 mb-1 truncate">${item.title}</h3>
          <p class="text-sm text-gray-500 line-clamp-2">${item.summary}</p>
        </div>
      </div>
    `).join('');

    // 绑定选择事件
    container.querySelectorAll('.news-card').forEach(card => {
      card.addEventListener('click', () => {
        const newsId = card.dataset.newsId;
        this.selectNews(newsId);
      });
    });
  }

  // 选择新闻
  selectNews(newsId) {
    const news = newsFetcher.getAllNews();
    this.selectedNews = news.find(n => n.id === newsId);

    // 更新UI
    document.querySelectorAll('.news-card').forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.newsId === newsId) {
        card.classList.add('selected');
      }
    });

    // 更新标题显示
    const titleEl = document.getElementById('selectedNewsTitle');
    if (titleEl && this.selectedNews) {
      titleEl.textContent = this.selectedNews.title;
    }

    // 显示编写区域
    document.getElementById('writeSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
  }

  // AI改写
  async rewriteNews() {
    if (!this.selectedNews) {
      this.showToast('请先选择一条新闻', 'error');
      return;
    }

    const formatEl = document.querySelector('input[name="outputFormat"]:checked');
    const format = formatEl ? formatEl.value : 'short';

    const styleSelect = document.getElementById('styleSelect');
    const style = styleSelect ? styleSelect.value : 'vlog';

    try {
      const result = await newsWriter.rewrite(this.selectedNews, format, style);
      this.displayResult(result);

      // 保存到历史
      storageManager.saveHistory({
        originalNews: this.selectedNews,
        result: result,
        format: format,
        style: style
      });

      this.renderHistory();
      this.showToast('改写完成！', 'success');
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }

  // 显示结果
  displayResult(content) {
    const container = document.getElementById('resultContent');
    const section = document.getElementById('resultSection');

    container.textContent = content;
    section.style.display = 'block';

    // 滚动到结果区域
    section.scrollIntoView({ behavior: 'smooth' });
  }

  // 复制结果
  copyResult() {
    const content = newsWriter.getCurrentResult();
    if (!content) {
      this.showToast('没有可复制的内容', 'error');
      return;
    }

    navigator.clipboard.writeText(content).then(() => {
      this.showToast('已复制到剪贴板', 'success');
    }).catch(() => {
      this.showToast('复制失败', 'error');
    });
  }

  // 下载结果
  downloadResult() {
    const content = newsWriter.getCurrentResult();
    if (!content) {
      this.showToast('没有可下载的内容', 'error');
      return;
    }

    // 提取标题作为文件名
    const title = this.selectedNews?.title || '汽车新闻';
    const filename = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    this.showToast('下载成功', 'success');
  }

  // 重新生成
  async regenerateResult() {
    try {
      const result = await newsWriter.regenerate();
      this.displayResult(result);
      this.showToast('重新生成完成！', 'success');
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }

  // 渲染历史记录
  renderHistory() {
    const history = storageManager.getHistory();
    const container = document.getElementById('historyList');

    if (history.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">暂无历史记录</p>';
      return;
    }

    container.innerHTML = history.slice(0, 10).map(item => `
      <div class="history-item" data-id="${item.id}">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-800 truncate">${item.originalNews?.title || '未知'}</div>
          <div class="text-xs text-gray-400">${item.format === 'short' ? '短文案' : '长文章'} · ${item.style}</div>
        </div>
        <div class="text-xs text-gray-400">${this.formatTime(item.timestamp)}</div>
      </div>
    `).join('');

    // 绑定点击事件
    container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const historyItem = history.find(h => h.id === id);
        if (historyItem) {
          this.selectedNews = historyItem.originalNews;
          this.displayResult(historyItem.result);
          document.getElementById('writeSection').style.display = 'block';
        }
      });
    });
  }

  // 显示添加自定义源弹窗
  showAddSourceModal() {
    document.getElementById('customSourceModal').classList.remove('hidden');
  }

  // 隐藏添加自定义源弹窗
  hideAddSourceModal() {
    document.getElementById('customSourceModal').classList.add('hidden');
    document.getElementById('sourceName').value = '';
    document.getElementById('sourceUrl').value = '';
  }

  // 添加自定义新闻源
  addCustomSource() {
    const name = document.getElementById('sourceName').value.trim();
    const url = document.getElementById('sourceUrl').value.trim();

    if (!name || !url) {
      this.showToast('请填写名称和URL', 'error');
      return;
    }

    storageManager.addCustomSource({ name, url });
    this.customSources = storageManager.getCustomSources();
    newsFetcher.initSources(this.customSources);
    this.renderSourceList();
    this.hideAddSourceModal();
    this.showToast('添加成功', 'success');
  }

  // 加载设置
  loadSettings() {
    const settings = storageManager.getSettings();

    // 设置默认值
    if (settings.defaultFormat) {
      const formatEl = document.querySelector(`input[name="outputFormat"][value="${settings.defaultFormat}"]`);
      if (formatEl) formatEl.checked = true;
    }

    if (settings.defaultStyle) {
      const styleSelect = document.getElementById('styleSelect');
      if (styleSelect) styleSelect.value = settings.defaultStyle;
    }
  }

  // 获取新闻源名称
  getSourceName(sourceId) {
    const sources = [...NEWS_SOURCES, ...this.customSources];
    const source = sources.find(s => s.id === sourceId);
    return source ? source.name : sourceId;
  }

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN');
  }

  // 显示加载
  showLoading(text) {
    const overlay = document.getElementById('loadingOverlay');
    const textEl = document.getElementById('loadingText');
    if (overlay && textEl) {
      textEl.textContent = text;
      overlay.classList.remove('hidden');
    }
  }

  // 隐藏加载
  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  // 显示Toast
  showToast(message, type = 'info') {
    // 移除已存在的toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
