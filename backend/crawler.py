# crawler.py - 使用RSS订阅源获取汽车新闻
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import random
import feedparser

class NewsCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        self.timeout = 15

    def fetch_rss_news(self, sources, hours=24):
        """通过RSS获取新闻"""
        all_news = []

        # RSS订阅源
        rss_sources = {
            'autohome': {
                'name': '汽车之家',
                'rss': 'https://www.autohome.com.cn/rss/news.xml',
            },
            'yiche': {
                'name': '易车',
                'rss': 'https://www.yiche.com/rss/news.xml',
            },
            '163': {
                'name': '网易汽车',
                'rss': 'https://auto.163.com/rss/ENT03.xml',
            },
            'sohu': {
                'name': '搜狐汽车',
                'rss': 'https://auto.sohu.com/index.xml',
            },
            'sina': {
                'name': '新浪汽车',
                'rss': 'https://auto.sina.com.cn/rss.xml',
            }
        }

        for source_id in sources:
            if source_id in rss_sources:
                source = rss_sources[source_id]
                try:
                    print(f"正在获取 {source['name']} RSS...")
                    feed = feedparser.parse(source['rss'], agent=self.headers['User-Agent'])

                    for idx, entry in enumerate(feed.entries[:10]):
                        all_news.append({
                            'id': f'{source_id}_{idx}_{int(time.time())}',
                            'title': entry.get('title', '').strip(),
                            'summary': entry.get('summary', '').strip()[:200] or f'{source["name"]}最新资讯',
                            'source': source_id,
                            'source_name': source['name'],
                            'url': entry.get('link', ''),
                            'publishTime': entry.get('published', datetime.now().isoformat())
                        })
                    print(f"{source['name']} 获取到 {len(feed.entries)} 条")
                except Exception as e:
                    print(f"{source['name']} 获取失败: {e}")

        if all_news:
            all_news.sort(key=lambda x: x['publishTime'], reverse=True)

        return all_news

    def fetch_news(self, sources, hours=24):
        """获取新闻 - 优先使用RSS"""
        news = self.fetch_rss_news(sources, hours)

        # 如果RSS失败，尝试直接抓取
        if not news:
            print("RSS获取失败，尝试直接抓取...")
            news = self.fetch_direct(sources, hours)

        return news

    def fetch_direct(self, sources, hours=24):
        """直接抓取网页"""
        all_news = []

        # 直接抓取的URLs
        urls = {
            'autohome': ('https://www.autohome.com.cn/rank/0-0-0-0-0-0-0-0-1-0-1-0-0-1/', '汽车之家'),
            'yiche': ('https://www.yiche.com/zixun/', '易车'),
            '163': ('https://auto.163.com/', '网易汽车'),
        }

        for source_id in sources:
            if source_id in urls:
                url, name = urls[source_id]
                try:
                    print(f"直接抓取 {name}...")
                    resp = requests.get(url, headers=self.headers, timeout=self.timeout)
                    resp.encoding = 'utf-8'

                    soup = BeautifulSoup(resp.text, 'lxml')

                    # 尝试多种选择器
                    selectors = [
                        '.article-item a',
                        '.news-item a',
                        '.list-item a',
                        '.item a',
                        'a[href*="article"]',
                    ]

                    links = []
                    for sel in selectors:
                        links = soup.select(sel)
                        if links:
                            break

                    for idx, a in enumerate(links[:10]):
                        title = a.get_text(strip=True)
                        if title and len(title) > 10:
                            all_news.append({
                                'id': f'{source_id}_{idx}_{int(time.time())}',
                                'title': title,
                                'summary': f'{name}最新汽车资讯',
                                'source': source_id,
                                'source_name': name,
                                'url': a.get('href', ''),
                                'publishTime': (datetime.now() - timedelta(hours=random.randint(0, hours))).isoformat()
                            })

                    print(f"{name} 获取到 {len(all_news)} 条")
                except Exception as e:
                    print(f"{name} 抓取失败: {e}")

        return all_news

# 创建全局实例
crawler = NewsCrawler()
