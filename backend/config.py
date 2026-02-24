# config.py - 配置文件
import os
from dotenv import load_dotenv

load_dotenv()

# 火山引擎配置 - 通过环境变量设置
VOLCENGINE_ACCESS_KEY = os.environ.get('VOLCENGINE_ACCESS_KEY', '')
VOLCENGINE_SECRET_KEY = os.environ.get('VOLCENGINE_SECRET_KEY', '')

# 火山引擎模型配置
# 搜索用轻量模型: doubao-lite-4k
# 深度改写用: doubao-4-8k
VOLCENGINE_ENDPOINT = os.environ.get('VOLCENGINE_ENDPOINT', 'ark.cn-beijing.volces.com')
VOLCENGINE_MODEL_SEARCH = os.environ.get('VOLCENGINE_MODEL_SEARCH', 'doubao-lite-4k')
VOLCENGINE_MODEL_DEEP = os.environ.get('VOLCENGINE_MODEL_DEEP', 'doubao-4-8k')

# Tavily API
TAVILY_API_KEY = os.environ.get('TAVILY_API_KEY', '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')

# 搜索配置
SEARCH_MAX_RESULTS = 10
