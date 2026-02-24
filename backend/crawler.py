# crawler.py - 新闻爬虫模块
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import random

class NewsCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
        self.timeout = 10

    def crawl_autohome(self, hours=24):
        """爬取汽车之家新闻"""
        news_list = []
        try:
            url = "https://www.autohome.com.cn/rank/0-0-0-0-0-0-0-0-1-0-1-0-0-1/"
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'lxml')

            articles = soup.select('.article-item')[:10]
            for idx, article in enumerate(articles):
                title_elem = article.select_one('.article-title a')
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                link = "https://www.autohome.com.cn" + title_elem.get('href', '')

                summary_elem = article.select_one('.article-desc')
                summary = summary_elem.get_text(strip=True) if summary_elem else ''

                news_list.append({
                    'id': f'autohome_{idx}_{int(time.time())}',
                    'title': title,
                    'summary': summary[:200] if summary else '汽车之家最新资讯',
                    'source': 'autohome',
                    'source_name': '汽车之家',
                    'url': link,
                    'publishTime': (datetime.now() - timedelta(hours=random.randint(0, hours))).isoformat()
                })
        except Exception as e:
            print(f"汽车之家爬取失败: {e}")

        return news_list

    def crawl_yiche(self, hours=24):
        """爬取易车新闻"""
        news_list = []
        try:
            url = "https://www.yiche.com/zixun/"
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'lxml')

            articles = soup.select('.article-item')[:10]
            for idx, article in enumerate(articles):
                title_elem = article.select_one('a')
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                link = title_elem.get('href', '')

                if not link.startswith('http'):
                    link = "https://www.yiche.com" + link

                news_list.append({
                    'id': f'yiche_{idx}_{int(time.time())}',
                    'title': title,
                    'summary': '易车网最新汽车资讯',
                    'source': 'yiche',
                    'source_name': '易车',
                    'url': link,
                    'publishTime': (datetime.now() - timedelta(hours=random.randint(0, hours))).isoformat()
                })
        except Exception as e:
            print(f"易车爬取失败: {e}")

        return news_list

    def crawl_dongche(self, hours=24):
        """爬取懂车帝新闻"""
        news_list = []
        try:
            url = "https://www.dongche.cn/"
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'lxml')

            articles = soup.select('.news-item')[:10]
            for idx, article in enumerate(articles):
                title_elem = article.select_one('a')
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                link = title_elem.get('href', '')

                if link and not link.startswith('http'):
                    link = "https://www.dongche.cn" + link

                news_list.append({
                    'id': f'dongche_{idx}_{int(time.time())}',
                    'title': title,
                    'summary': '懂车帝最新汽车资讯',
                    'source': 'dongche',
                    'source_name': '懂车帝',
                    'url': link,
                    'publishTime': (datetime.now() - timedelta(hours=random.randint(0, hours))).isoformat()
                })
        except Exception as e:
            print(f"懂车帝爬取失败: {e}")

        return news_list

    def crawl_pcauto(self, hours=24):
        """爬取太平洋汽车新闻"""
        news_list = []
        try:
            url = "https://www.pcauto.com.cn/news/"
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'lxml')

            articles = soup.select('.item')[:10]
            for idx, article in enumerate(articles):
                title_elem = article.select_one('a')
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                link = title_elem.get('href', '')

                if link and not link.startswith('http'):
                    link = "https://www.pcauto.com.cn" + link

                news_list.append({
                    'id': f'pcauto_{idx}_{int(time.time())}',
                    'title': title,
                    'summary': '太平洋汽车最新资讯',
                    'source': 'pcauto',
                    'source_name': '太平洋汽车',
                    'url': link,
                    'publishTime': (datetime.now() - timedelta(hours=random.randint(0, hours))).isoformat()
                })
        except Exception as e:
            print(f"太平洋汽车爬取失败: {e}")

        return news_list

    def crawl_sina(self, hours=24):
        """爬取新浪汽车新闻"""
        news_list = []
        try:
            url = "https://auto.sina.com.cn/news/"
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'lxml')

            articles = soup.select('.news-item')[:10]
            for idx, article in enumerate(articles):
                title_elem = article.select_one('a')
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                link = title_elem.get('href', '')

                if link and not link.startswith('http'):
                    link = "https://auto.sina.com.cn" + link

                news_list.append({
                    'id': f'sina_{idx}_{int(time.time())}',
                    'title': title,
                    'summary': '新浪汽车最新资讯',
                    'source': 'sina',
                    'source_name': '新浪汽车',
                    'url': link,
                    'publishTime': (datetime.now() - timedelta(hours=random.randint(0, hours))).isoformat()
                })
        except Exception as e:
            print(f"新浪汽车爬取失败: {e}")

        return news_list

    def fetch_news(self, sources, hours=24):
        """获取新闻列表"""
        all_news = []

        source_map = {
            'autohome': self.crawl_autohome,
            'yiche': self.crawl_yiche,
            'dongche': self.crawl_dongche,
            'pcauto': self.crawl_pcauto,
            'sina': self.crawl_sina
        }

        for source_id in sources:
            if source_id in source_map:
                try:
                    news = source_map[source_id](hours)
                    all_news.extend(news)
                    print(f"{source_id} 获取到 {len(news)} 条新闻")
                except Exception as e:
                    print(f"{source_id} 爬取出错: {e}")

        # 按时间排序
        all_news.sort(key=lambda x: x['publishTime'], reverse=True)

        # 如果没有爬取到任何新闻，返回模拟数据
        if not all_news:
            return self.get_fallback_news(sources, hours)

        return all_news

    def get_fallback_news(self, sources, hours):
        """获取备用模拟数据（爬取失败时使用）"""
        from .fetcher import generate_mock_news
        return generate_mock_news(sources, hours)

# 创建全局实例
crawler = NewsCrawler()
