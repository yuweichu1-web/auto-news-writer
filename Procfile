build: pip install -r backend/requirements.txt
web: PYTHONPATH=. gunicorn backend.app:app --bind 0.0.0.0:$PORT
