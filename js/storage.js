// storage.js - 本地存储模块

class StorageManager {
  constructor() {
    this.historyKey = 'auto_news_history';
    this.customSourcesKey = 'auto_news_custom_sources';
    this.settingsKey = 'auto_news_settings';
    this.maxHistorySize = 50;
  }

  // 保存历史记录
  saveHistory(item) {
    const history = this.getHistory();
    history.unshift({
      ...item,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });

    // 限制历史记录数量
    if (history.length > this.maxHistorySize) {
      history.pop();
    }

    localStorage.setItem(this.historyKey, JSON.stringify(history));
  }

  // 获取历史记录
  getHistory() {
    const data = localStorage.getItem(this.historyKey);
    return data ? JSON.parse(data) : [];
  }

  // 删除单条历史
  deleteHistory(id) {
    const history = this.getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(this.historyKey, JSON.stringify(filtered));
  }

  // 清空历史
  clearHistory() {
    localStorage.removeItem(this.historyKey);
  }

  // 保存自定义新闻源
  saveCustomSources(sources) {
    localStorage.setItem(this.customSourcesKey, JSON.stringify(sources));
  }

  // 获取自定义新闻源
  getCustomSources() {
    const data = localStorage.getItem(this.customSourcesKey);
    return data ? JSON.parse(data) : [];
  }

  // 添加自定义新闻源
  addCustomSource(source) {
    const sources = this.getCustomSources();
    const newSource = {
      id: `custom_${Date.now()}`,
      ...source,
      isCustom: true
    };
    sources.push(newSource);
    this.saveCustomSources(sources);
    return newSource;
  }

  // 删除自定义新闻源
  deleteCustomSource(id) {
    const sources = this.getCustomSources();
    const filtered = sources.filter(s => s.id !== id);
    this.saveCustomSources(filtered);
  }

  // 保存设置
  saveSettings(settings) {
    const current = this.getSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(this.settingsKey, JSON.stringify(merged));
  }

  // 获取设置
  getSettings() {
    const data = localStorage.getItem(this.settingsKey);
    return data ? JSON.parse(data) : {
      theme: 'light',
      defaultFormat: 'short',
      defaultStyle: 'vlog'
    };
  }

  // 导出历史记录
  exportHistory() {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  // 导入历史记录
  importHistory(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        const current = this.getHistory();
        const merged = [...imported, ...current].slice(0, this.maxHistorySize);
        localStorage.setItem(this.historyKey, JSON.stringify(merged));
        return true;
      }
    } catch (e) {
      console.error('导入失败:', e);
    }
    return false;
  }
}

// 创建全局实例
const storageManager = new StorageManager();
