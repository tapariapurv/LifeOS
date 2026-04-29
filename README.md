# Life OS

A complete Life OS dashboard with Tasks/Homework, Classes, Goals, Notes, Knowledge categories, and Prompts.

## Fastest way (HTML-only)

No setup needed:

1. Open `index.html` directly in your browser.
2. The app will run in **local demo mode** using `localStorage`.
3. All added tasks/classes/goals/notes/prompts persist in your browser.

## Flask mode (API + SQLite)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5000`.

## Database / migrations

- SQLite schema is in `schema.sql`.
- On first Flask run, `app.py` initializes `lifeos.db` automatically.
- To reset DB, delete `lifeos.db` and run `python app.py` again.

## Project structure

- `index.html`: standalone HTML entry (works without backend).
- `templates/index.html`: Flask-served template.
- `static/css/styles.css`: design system + component styles.
- `static/js/app.js`: rendering logic + CRUD + local demo fallback.
- `app.py`: Flask app + REST API + bootstrap data.
- `schema.sql`: SQLite schema.
