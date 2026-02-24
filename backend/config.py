# config.py - 配置文件
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys - 在Render后台设置环境变量
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
TAVILY_API_KEY = os.environ.get('TAVILY_API_KEY', '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')

# Claude模型
CLAUDE_MODEL = 'claude-sonnet-4-20250514'

# 搜索配置
SEARCH_MAX_RESULTS = 10
