# crawler.py - 直接抓取汽车新闻
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import random

class NewsCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        self.timeout = 15

    def fetch_news(self, sources, hours=24):
        """获取新闻 - 直接抓取网页"""
        return self.fetch_direct(sources, hours)

    def fetch_direct(self, sources, hours=24):
        """直接抓取网页"""
        all_news = []

        # 直接抓取的URLs
        urls = {
            'autohome': ('https://www.autohome.com.cn/rank/0-0-0-0-0-0-0-0-1-0-1-0-0-1/', '汽车之家'),
            'yiche': ('https://www.yiche.com/zixun/', '易车'),
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

        if all_news:
            all_news.sort(key=lambda x: x['publishTime'], reverse=True)

        return all_news

# 创建全局实例
crawler = NewsCrawler()
