# app.py - Flask后端服务
from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../', static_url_path='')
CORS(app)

# 导入爬虫和模拟数据
from backend.crawler import crawler
from backend.fetcher import generate_mock_news

@app.route('/')
def index():
    """提供前端页面"""
    return app.send_static_file('index.html')

@app.route('/api/news')
def get_news():
    """获取新闻API"""
    sources = request.args.get('sources', '').split(',')
    hours = int(request.args.get('hours', 24))

    # 过滤空字符串
    sources = [s.strip() for s in sources if s.strip()]

    if not sources:
        return jsonify({'success': False, 'error': '请选择新闻源'}), 400

    try:
        # 尝试爬取真实新闻
        news = crawler.fetch_news(sources, hours)
        return jsonify({
            'success': True,
            'data': news,
            'count': len(news)
        })
    except Exception as e:
        print(f"爬取出错: {e}")
        # 爬取失败时使用模拟数据
        news = generate_mock_news(sources, hours)
        return jsonify({
            'success': True,
            'data': news,
            'count': len(news),
            'note': '使用模拟数据（爬取失败）'
        })

@app.route('/api/sources')
def get_sources():
    """获取支持的新闻源"""
    sources = [
        {'id': 'autohome', 'name': '汽车之家', 'icon': '🚗'},
        {'id': 'yiche', 'name': '易车', 'icon': '🚙'},
        {'id': 'dongche', 'name': '懂车帝', 'icon': '🏎️'},
        {'id': 'pcauto', 'name': '太平洋汽车', 'icon': '🚘'},
        {'id': 'sina', 'name': '新浪汽车', 'icon': '🚔'}
    ]
    return jsonify({'success': True, 'data': sources})

@app.route('/api/rewrite', methods=['POST'])
def rewrite_news():
    """AI改写API（模拟）"""
    data = request.json
    content = data.get('content', '')
    format_type = data.get('format', 'short')
    style = data.get('style', 'vlog')

    if not content:
        return jsonify({'success': False, 'error': '内容不能为空'}), 400

    # 这里可以接入真实的AI API
    # 目前返回模拟的改写结果
    from backend.writer import generate_content
    result = generate_content(content, format_type, style)

    return jsonify({
        'success': True,
        'data': result
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 服务启动: http://localhost:{port}")
    print(f"📰 前端页面: http://localhost:{port}/")
    app.run(host='0.0.0.0', port=port, debug=True)
