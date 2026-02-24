# 汽车新闻快编 - 启动脚本

## 前置要求

需要安装 Python 3.8+

```bash
# 安装依赖
cd backend
pip install -r requirements.txt
```

## 启动方式

### 方式1: 一键启动（推荐）

```bash
# 在项目根目录运行
./run.sh
```

### 方式2: 手动启动

```bash
cd backend
python app.py
```

然后打开浏览器访问: http://localhost:5000

## 功能说明

- 前端页面: http://localhost:5000/
- 新闻API: http://localhost:5000/api/news?sources=autohome,yiche&hours=24
- AI改写API: http://localhost:5000/api/rewrite
