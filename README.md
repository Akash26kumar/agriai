# AgriAI

An agricultural intelligence platform: a chat assistant backed by an LLM agent and a set of farming tools (weather, climate, rainfall, crop advice, storage, buyers, market prices, aggregation pools), plus a small ML service for crop recommendation and yield prediction.

## Architecture

| Folder | Stack | Purpose |
| --- | --- | --- |
| `frontend/` | Next.js | Chat UI and tool pages (crop, yield, storage, buyers, market) |
| `backend/` | Node.js, Express, Socket.IO, LangChain (Google Gemini) | REST API + real-time agent chat |
| `mservice/` | Python, FastAPI, scikit-learn | ML endpoints: `/predict/crop`, `/predict/yield`, `/health` |

## Getting started

### Prerequisites
- Node.js 18+
- Python 3.11+ (only for the ML service)
- A Google AI API key from https://aistudio.google.com/

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
Then edit `backend/.env` and set `GOOGLE_API_KEY`.

| Variable | Where | Required | Description |
| --- | --- | --- | --- |
| `GOOGLE_API_KEY` | backend | Yes | Google Gemini API key |
| `PORT` | backend | No | Backend port (default 5000) |
| `ML_SERVICE_URL` | backend | No | ML service URL (default `http://localhost:8000`) |
| `MARKET_API_URL` / `MARKET_API_KEY` | backend | No | External market price API |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | Yes | Backend URL, e.g. `http://localhost:5000` |

### 3. Run the app
```bash
npm run dev
```
Frontend: http://localhost:3000, backend: http://localhost:5000.

### 4. (Optional) Run the ML service
```bash
cd mservice
pip install -r requirements.txt
python train_model.py
uvicorn main:app --port 8000
```
Or with Docker: `docker build -t agriai-ml mservice && docker run -p 8000:8000 agriai-ml`

## Notes
This is a demo project. CORS is open to all origins and the write endpoints have no authentication or rate limiting, so add both before deploying publicly.

## License
MIT, see [LICENSE](LICENSE).
