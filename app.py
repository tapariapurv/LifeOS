from flask import Flask, jsonify, render_template, request
import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "lifeos.db"

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    schema = BASE_DIR / "schema.sql"
    conn = get_db_connection()
    with open(schema, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()

    # seed defaults
    conn.execute("INSERT OR IGNORE INTO category_groups (id, name) VALUES (1, 'School'), (2, 'Personal'), (3, 'Projects')")
    conn.commit()
    conn.close()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/bootstrap")
def bootstrap():
    conn = get_db_connection()
    data = {
        "classes": [dict(r) for r in conn.execute("SELECT * FROM classes ORDER BY name")],
        "category_groups": [dict(r) for r in conn.execute("SELECT * FROM category_groups ORDER BY name")],
        "categories": [dict(r) for r in conn.execute("SELECT * FROM categories ORDER BY name")],
        "tasks": [dict(r) for r in conn.execute("SELECT * FROM tasks ORDER BY due_date IS NULL, due_date, id DESC")],
        "notes": [dict(r) for r in conn.execute("SELECT * FROM notes ORDER BY id DESC")],
        "goals": [dict(r) for r in conn.execute("SELECT * FROM goals ORDER BY id DESC")],
        "prompts": [dict(r) for r in conn.execute("SELECT * FROM prompts ORDER BY id DESC")],
    }
    conn.close()
    return jsonify(data)


@app.route("/api/<entity>", methods=["POST"])
def create_entity(entity):
    payload = request.get_json(force=True)
    conn = get_db_connection()

    if entity == "classes":
        cur = conn.execute(
            "INSERT INTO classes(name, color, time, type, room, recurring_day) VALUES(?,?,?,?,?,?)",
            (payload["name"], payload.get("color", "#78a9ff"), payload.get("time"), payload.get("type", "regular"), payload.get("room"), payload.get("recurring_day")),
        )
    elif entity == "category_groups":
        cur = conn.execute("INSERT INTO category_groups(name) VALUES(?)", (payload["name"],))
    elif entity == "categories":
        cur = conn.execute(
            "INSERT INTO categories(name, color, parent_group_id) VALUES(?,?,?)",
            (payload["name"], payload.get("color", "#8ea8ff"), payload.get("parent_group_id")),
        )
    elif entity == "tasks":
        cur = conn.execute(
            "INSERT INTO tasks(title, description, type, class_id, category_id, due_date, status) VALUES(?,?,?,?,?,?,?)",
            (payload["title"], payload.get("description"), payload.get("type", "Task"), payload.get("class_id"), payload.get("category_id"), payload.get("due_date"), payload.get("status", "todo")),
        )
    elif entity == "notes":
        cur = conn.execute(
            "INSERT INTO notes(content, class_id, category_id) VALUES(?,?,?)",
            (payload["content"], payload.get("class_id"), payload.get("category_id")),
        )
    elif entity == "goals":
        cur = conn.execute("INSERT INTO goals(title, progress) VALUES(?,?)", (payload["title"], payload.get("progress", 0)))
    elif entity == "prompts":
        created_at = datetime.utcnow().isoformat(timespec="seconds")
        cur = conn.execute(
            "INSERT INTO prompts(title, content, category_id, tags, created_at) VALUES(?,?,?,?,?)",
            (payload["title"], payload["content"], payload.get("category_id"), payload.get("tags", ""), created_at),
        )
    else:
        conn.close()
        return jsonify({"error": "Unknown entity"}), 404

    conn.commit()
    new_id = cur.lastrowid
    row = conn.execute(f"SELECT * FROM {entity} WHERE id=?", (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201


@app.route("/api/<entity>/<int:item_id>", methods=["PUT", "DELETE"])
def mutate_entity(entity, item_id):
    conn = get_db_connection()
    if request.method == "DELETE":
        conn.execute(f"DELETE FROM {entity} WHERE id=?", (item_id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    payload = request.get_json(force=True)
    allowed = {
        "classes": ["name", "color", "time", "type", "room", "recurring_day"],
        "category_groups": ["name"],
        "categories": ["name", "color", "parent_group_id"],
        "tasks": ["title", "description", "type", "class_id", "category_id", "due_date", "status"],
        "notes": ["content", "class_id", "category_id"],
        "goals": ["title", "progress"],
        "prompts": ["title", "content", "category_id", "tags"],
    }
    fields = [f for f in allowed.get(entity, []) if f in payload]
    if not fields:
        conn.close()
        return jsonify({"error": "No valid fields"}), 400

    sets = ", ".join([f"{f}=?" for f in fields])
    vals = [payload[f] for f in fields] + [item_id]
    conn.execute(f"UPDATE {entity} SET {sets} WHERE id=?", vals)
    conn.commit()
    row = conn.execute(f"SELECT * FROM {entity} WHERE id=?", (item_id,)).fetchone()
    conn.close()
    return jsonify(dict(row) if row else {})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
