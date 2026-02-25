# app.py - Flask后端服务 (火山引擎AI搜索版)
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import json
import random
from datetime import datetime

import os
from flask import send_from_directory

# 获取当前目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)

# 确保根路径返回 index.html
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

# 提供 js 目录下的静态文件
@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'js'), filename)

# 提供 css 目录下的静态文件
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'css'), filename)

# 提供 assets 目录下的静态文件
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'assets'), filename)

# 导入配置
from config import (
    VOLCENGINE_ACCESS_KEY, VOLCENGINE_SECRET_KEY,
    VOLCENGINE_ENDPOINT, VOLCENGINE_MODEL_SEARCH, VOLCENGINE_MODEL_DEEP
)

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

def call_volcano_api(prompt, model='lite'):
    """调用火山引擎API"""
    if not VOLCENGINE_ACCESS_KEY:
        print("错误: 未配置 VOLCENGINE_ACCESS_KEY 环境变量")
        return None

    url = f"https://{VOLCENGINE_ENDPOINT}/api/v3/chat/completions"

    # 选择模型
    if model == 'deep':
        model_name = VOLCENGINE_MODEL_DEEP
    else:
        model_name = VOLCENGINE_MODEL_SEARCH

    print(f"调用火山引擎 - 模型: {model_name}")

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {VOLCENGINE_ACCESS_KEY}'
    }

    payload = {
        'model': model_name,
        'messages': [
            {'role': 'user', 'content': prompt}
        ],
        'max_tokens': 4096,
        'temperature': 0.8
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)

        if response.ok:
            data = response.json()
            print(f"火山引擎响应成功")
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


def search_news_with_ai(sources, time_range):
    """使用火山引擎AI搜索最新汽车新闻"""

    # 构建搜索提示词
    source_names = {
        'weibo': '微博汽车热榜',
        'all': '全网',
        'autohome': '汽车之家',
        'dongche': '懂车帝',
        'yiche': '易车'
    }

    source_text = '、'.join([source_names.get(s, s) for s in sources])

    search_prompt = f"""你是一个专业的汽车新闻搜索助手。请帮我搜索最新的汽车行业新闻。

要求：
1. 搜索{source_text}上最新的汽车新闻
2. 只搜索以下类型的新闻：
   - 新车上市、预售、发布
   - 行业重磅新闻
   - 政策变化
   - 重大合作、投资
   - 热门车型销量
3. 返回5条最新、最热的汽车新闻
4. 每条新闻必须包含：标题、摘要、原文链接

请用JSON格式返回，格式如下：
[
  {{"title": "新闻标题", "summary": "新闻摘要", "url": "原文链接", "publishTime": "发布时间"}},
  ...
]

只返回JSON数组，不要其他内容。"""

    # 调用AI搜索
    result = call_volcano_api(search_prompt, model='lite')

    if not result:
        # 如果AI调用失败，返回模拟数据
        return generate_mock_news()

    # 解析JSON结果
    try:
        # 尝试提取JSON部分
        import re
        json_match = re.search(r'\[.*\]', result, re.DOTALL)
        if json_match:
            news_list = json.loads(json_match.group())
        else:
            news_list = json.loads(result)

        # 转换为标准格式
        formatted_news = []
        for idx, item in enumerate(news_list):
            formatted_news.append({
                'id': f"ai_{datetime.now().timestamp()}_{idx}",
                'title': item.get('title', ''),
                'summary': item.get('summary', ''),
                'url': item.get('url', '#'),
                'source': sources[0] if sources else 'ai',
                'source_name': 'AI搜索',
                'publishTime': item.get('publishTime') or datetime.now().isoformat()
            })

        return formatted_news[:5]

    except Exception as e:
        print(f"解析AI结果失败: {e}, 结果: {result}")
        return generate_mock_news()


def generate_mock_news():
    """生成模拟新闻数据（备用）"""
    templates = [
        {
            'title': '比亚迪秦L DM-i正式上市 售价7.98万起',
            'summary': '比亚迪官方宣布，秦L DM-i正式上市，共推出5款车型，售价区间7.98-12.98万元。新车搭载第五代DM-i混动技术，NEDC工况下综合续航可达2000km。',
            'url': 'https://example.com/news/1'
        },
        {
            'title': '特斯拉Model Y新版车型申报 续航提升至600km',
            'summary': '工信部最新申报信息显示，特斯拉Model Y将推出新版本车型，配备更大容量电池组，续航里程提升至600km以上，预计年内上市。',
            'url': 'https://example.com/news/2'
        },
        {
            'title': '小米SU7订单突破10万 创最快交付纪录',
            'summary': '小米汽车官方数据显示，SU7上市仅7天大定订单突破10万台，创下新能源车最快交付纪录。目前已开启全国交付。',
            'url': 'https://example.com/news/3'
        },
        {
            'title': '全新宝马5系正式发布 搭载最新iDrive 8.5系统',
            'summary': '宝马官方正式发布全新一代5系轿车，内饰全面升级，配备最新iDrive 8.5操作系统，提供燃油和纯电两种动力版本。',
            'url': 'https://example.com/news/4'
        },
        {
            'title': '理想汽车销量突破20万 新款L6将于下月发布',
            'summary': '理想汽车宣布累计交付量突破20万台，同时透露全新车型L6将于下月正式发布，定位中大型SUV，预售价25万元起。',
            'url': 'https://example.com/news/5'
        }
    ]

    news = []
    for idx, item in enumerate(templates):
        news.append({
            'id': f"mock_{datetime.now().timestamp()}_{idx}",
            'title': item['title'],
            'summary': item['summary'],
            'url': item['url'],
            'source': 'ai',
            'source_name': 'AI搜索',
            'publishTime': datetime.now().isoformat()
        })

    return news


@app.route('/api/news')
def get_news():
    """AI搜索新闻API"""
    sources = request.args.get('sources', '').split(',')
    time_range = int(request.args.get('timeRange', 1))

    sources = [s.strip() for s in sources if s.strip()]

    if not sources:
        sources = ['all']

    try:
        news = search_news_with_ai(sources, time_range)
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
    use_deep = data.get('deep', False)

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
    style_config = WRITING_STYLES.get(style, WRITING_STYLES['vlog'])
    prompt = style_config['prompt']

    title = news_item.get('title', '')
    summary = news_item.get('summary', '')

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
    model = 'deep' if use_deep else 'lite'

    result = call_volcano_api(full_prompt, model)

    if result:
        return result
    else:
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
    print(f"🔥 使用火山引擎豆包AI搜索+改写")
    print(f"📡 端口: {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
