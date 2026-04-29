# Life OS

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

## Database
- SQLite database auto-creates on first app run via `schema.sql`.
- Tables: classes, category_groups, categories, tasks, notes, goals, prompts.

## Structure
- `app.py`: Flask app + REST API + bootstrap data.
- `schema.sql`: SQLite schema.
- `templates/index.html`: app layout.
- `static/css/styles.css`: design system and reusable UI styles.
- `static/js/app.js`: dashboard state, rendering, CRUD actions.
