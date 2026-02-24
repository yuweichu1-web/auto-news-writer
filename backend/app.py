# app.py - Flask后端服务 (火山引擎版)
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import json
import hashlib
import hmac
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 导入配置
from config import (
    VOLCENGINE_ACCESS_KEY, VOLCENGINE_SECRET_KEY,
    VOLCENGINE_ENDPOINT, VOLCENGINE_MODEL_SEARCH, VOLCENGINE_MODEL_DEEP,
    TAVILY_API_KEY, SEARCH_MAX_RESULTS
)

# 新闻源配置
NEWS_SOURCES = {
    'weibo': {'name': '微博汽车', 'keyword': 'site:weibo.com 汽车热榜 新车'},
    'all': {'name': '全网', 'keyword': '汽车 新车 上市 政策 行业'},
    'autohome': {'name': '汽车之家', 'keyword': 'site:autohome.com.cn/news 新车 上市'},
    'dongche': {'name': '懂车帝', 'keyword': 'site:dongchedi.com 新车 上市'},
    'yiche': {'name': '易车', 'keyword': 'site:yiche.com 新车 上市'}
}

# 风格配置
WRITING_STYLES = {
    'vlog': {
        'name': 'vlog风',
        'prompt': '''你是一位资深的汽车博主，用生动的vlog风格来改写这段新闻。要求：
1. 使用口语化、活泼的语言
2. 适当加入语气词和感叹
3. 就像在和观众聊天一样
4. 保持内容的真实性
5. 长度控制在100-300字'''
    },
    'review': {
        'name': '专业评测风',
        'prompt': '''你是一位资深的汽车评测师，用专业但易懂的语言来改写这段新闻。要求：
1. 保持客观理性的态度
2. 适当加入数据和专业术语
3. 像老司机分享经验一样
4. 分析产品的优缺点
5. 长度控制在100-300字'''
    },
    'push': {
        'name': '种草安利风',
        'prompt': '''你是一位热情的种草博主，用极具感染力的语言来推荐这款车型。要求：
1. 充满热情和激情
2. 突出产品的亮点和优势
3. 适当使用夸张的表达
4. 激发读者的购买欲望
5. 长度控制在100-300字'''
    },
    'news': {
        'name': '新闻报道风',
        'prompt': '''你是一位专业的汽车编辑，用新闻报道的方式来呈现这条资讯。要求：
1. 语言简洁明了
2. 保持客观中立
3. 突出新闻价值点
4. 使用规范的新闻语言
5. 长度控制在100-300字'''
    }
}

def call_volcano_api(prompt, model='doubao-lite-4k'):
    """调用火山引擎API"""
    # 构建请求 - 使用ARK API
    url = f"https://{VOLCENGINE_ENDPOINT}/api/v3/chat/completions"

    # 选择模型
    if model == 'deep':
        model_name = VOLCENGINE_MODEL_DEEP
    else:
        model_name = VOLCENGINE_MODEL_SEARCH

    # 火山引擎使用 API Key 认证
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {VOLCENGINE_ACCESS_KEY}'
    }

    payload = {
        'model': model_name,
        'messages': [
            {'role': 'user', 'content': prompt}
        ],
        'max_tokens': 2048,
        'temperature': 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)

        if response.ok:
            data = response.json()
            print(f"火山引擎响应: {data}")
            # 火山引擎返回格式
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content']
            elif 'content' in data:
                return data['content']
        else:
            print(f"火山引擎API错误: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"调用火山引擎出错: {e}")
        return None

@app.route('/')
def index():
    return jsonify({
        'name': '汽车新闻快编 API',
        'version': '3.0',
        'provider': '火山引擎',
        'models': {
            'search': VOLCENGINE_MODEL_SEARCH,
            'deep': VOLCENGINE_MODEL_DEEP
        },
        'endpoints': {
            '/api/news': '获取新闻',
            '/api/rewrite': 'AI改写'
        }
    })

@app.route('/api/news')
def get_news():
    """AI搜索新闻API"""
    sources = request.args.get('sources', '').split(',')
    time_range = int(request.args.get('timeRange', 1))

    # 过滤空字符串
    sources = [s.strip() for s in sources if s.strip()]

    if not sources:
        return jsonify({'success': False, 'error': '请选择新闻源'}), 400

    try:
        news = search_news_ai(sources, time_range)
        return jsonify({
            'success': True,
            'data': news,
            'count': len(news)
        })
    except Exception as e:
        print(f"搜索出错: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def search_news_ai(sources, time_range):
    """使用Tavily API搜索新闻"""
    all_news = []

    for source_id in sources:
        keyword = NEWS_SOURCES.get(source_id, {}).get('keyword', '')

        # 调用Tavily API
        url = 'https://api.tavily.com/search'
        payload = {
            'api_key': TAVILY_API_KEY,
            'query': keyword,
            'max_results': SEARCH_MAX_RESULTS,
            'include_answer': True,
            'include_images': False
        }

        try:
            response = requests.post(url, json=payload, timeout=10)
            if response.ok:
                data = response.json()
                results = data.get('results', [])

                for idx, item in enumerate(results):
                    news_item = {
                        'id': f"{source_id}_{datetime.now().timestamp()}_{idx}",
                        'title': item.get('title', ''),
                        'summary': item.get('content', ''),
                        'url': item.get('url', '#'),
                        'source': source_id,
                        'source_name': NEWS_SOURCES.get(source_id, {}).get('name', source_id),
                        'publishTime': item.get('published_date') or datetime.now().isoformat()
                    }
                    all_news.append(news_item)
        except Exception as e:
            print(f"搜索 {source_id} 出错: {e}")
            continue

    # 过滤高质量新闻
    filtered = filter_quality_news(all_news)

    # 随机打乱
    import random
    random.shuffle(filtered)

    return filtered[:5]

def filter_quality_news(news):
    """过滤高质量新闻"""
    include_keywords = [
        '新车', '上市', '发布', '预售', '亮相', '首发',
        '政策', '补贴', '法规', '标准', '规划',
        '行业', '销量', '交付', '财报', '投资', '合作',
        '新能源', '电动车', '智驾', '电池', '续航',
        '比亚迪', '特斯拉', '小米', '华为', '吉利', '长城', '长安', '奇瑞',
        '问界', '理想', '蔚来', '小鹏', '零跑', '哪吒', '极氪', '领克'
    ]

    exclude_keywords = [
        '视频', '短视频', '直播', '带货', '评测', '试驾',
        '车祸', '事故', '维权', '投诉', '召回',
        '二手车', '降价', '优惠'
    ]

    filtered = []
    for item in news:
        content = (item.get('title', '') + ' ' + item.get('summary', '')).lower()

        # 排除
        if any(kw.lower() in content for kw in exclude_keywords):
            continue

        # 必须包含
        if any(kw.lower() in content for kw in include_keywords):
            filtered.append(item)

    return filtered

@app.route('/api/sources')
def get_sources():
    """获取新闻源列表"""
    sources = [
        {'id': 'weibo', 'name': '微博汽车', 'icon': '📱', 'category': '微博热榜'},
        {'id': 'all', 'name': '全网', 'icon': '🌐', 'category': '全网搜索'},
        {'id': 'autohome', 'name': '汽车之家', 'icon': '🚗', 'category': '权威汽车媒体'},
        {'id': 'dongche', 'name': '懂车帝', 'icon': '🏎️', 'category': '字节跳动汽车'},
        {'id': 'yiche', 'name': '易车', 'icon': '🚙', 'category': '汽车垂直平台'}
    ]
    return jsonify({'success': True, 'data': sources})

@app.route('/api/rewrite', methods=['POST'])
def rewrite_news():
    """AI改写API"""
    data = request.json
    news_item = data.get('news', {})
    format_type = data.get('format', 'short')
    style = data.get('style', 'vlog')
    use_deep = data.get('deep', False)  # 是否使用深度模型

    if not news_item:
        return jsonify({'success': False, 'error': '新闻内容不能为空'}), 400

    try:
        result = rewrite_with_ai(news_item, format_type, style, use_deep)
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        print(f"改写出错: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def rewrite_with_ai(news_item, format_type, style, use_deep=False):
    """使用火山引擎API改写新闻"""
    # 构建提示词
    style_config = WRITING_STYLES.get(style, WRITING_STYLES['vlog'])
    prompt = style_config['prompt']

    # 构建用户消息
    title = news_item.get('title', '')
    summary = news_item.get('summary', '')

    # 根据格式控制长度
    length_hint = ""
    if format_type == 'short':
        length_hint = "长度控制在100-300字"
    else:
        length_hint = "长度控制在500-1500字，可以分点详细说明"

    user_message = f"""请根据以下新闻素材进行改写：

新闻标题：{title}

新闻内容：{summary}

{length_hint}

请按照以上风格要求进行改写。"""

    full_prompt = prompt + "\n\n" + user_message

    # 选择模型
    model = 'deep' if use_deep else 'lite'

    # 调用火山引擎API
    result = call_volcano_api(full_prompt, model)

    if result:
        return result
    else:
        # 如果API调用失败，返回模拟数据
        return generate_mock_rewrite(news_item, style)

def generate_mock_rewrite(news_item, style):
    """生成模拟改写结果"""
    title = news_item.get('title', '')
    summary = news_item.get('summary', '')

    templates = {
        'vlog': f'''哇塞！兄弟们，最新消息来了！{title}

讲真，看完这个我整个人都激动了。{summary[:60]}...

兄弟们，你们觉得这车怎么样？评论区聊聊！🚗💨''',
        'review': f'''【新车快讯】{title}

{summary}

从专业角度来看，这次更新确实很有诚意。产品力提升明显，无论是配置还是价格都很有竞争力。建议感兴趣的朋友可以关注一下实车表现。''',
        'push': f'''🔥重磅推荐！{title}！

{summary}

真的！这次太给力了！宝子们，这波绝对不能错过！

私我了解详情，还有额外福利！先到先得！冲鸭！🎉''',
        'news': f'''【汽车资讯】{title}

{summary}

记者了解到，该车型/技术的推出将进一步丰富消费者的选择空间。具体售价及配置信息，请关注官方后续报道。'''
    }

    return templates.get(style, templates['vlog'])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 汽车新闻快编 API 启动中...")
    print(f"🔥 使用火山引擎豆包模型")
    print(f"📡 端口: {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
