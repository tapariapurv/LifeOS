# Life OS

## Run options

### Option A (fastest, click-to-run)
Open `index.html` directly in your browser.

### Option B (localhost:9000)
```bash
python -m http.server 9000
```
Then open `http://localhost:9000`.

### Option C (Flask + SQLite)
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Then open `http://127.0.0.1:5000`.

## Notes
- UI is image-matched and HTML-first.
- `index.html` is the primary entrypoint.
