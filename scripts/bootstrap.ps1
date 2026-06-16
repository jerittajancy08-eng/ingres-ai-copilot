Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm install
python -m venv .venv
.\.venv\Scripts\pip install -r apps/api/requirements.txt
