#!/bin/bash

# 汽车新闻快编 - 启动脚本

echo "🚀 启动汽车新闻快编..."

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python，请先安装Python 3.8+"
    exit 1
fi

# 进入backend目录
cd "$(dirname "$0")/backend" || exit 1

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "📦 安装依赖..."
pip install -r requirements.txt -q

# 启动服务
echo "🚀 启动服务..."
python app.py
