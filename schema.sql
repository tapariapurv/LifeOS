CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#78a9ff',
    time TEXT,
    type TEXT DEFAULT 'regular',
    room TEXT,
    recurring_day TEXT
);

CREATE TABLE IF NOT EXISTS category_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8ea8ff',
    parent_group_id INTEGER,
    FOREIGN KEY(parent_group_id) REFERENCES category_groups(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    class_id INTEGER,
    category_id INTEGER,
    due_date TEXT,
    status TEXT DEFAULT 'todo',
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    class_id INTEGER,
    category_id INTEGER,
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER,
    tags TEXT,
    created_at TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);
