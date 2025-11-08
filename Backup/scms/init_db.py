import sqlite3
from app import app

def init_db():
    with app.app_context():
        db = sqlite3.connect('cms.db')
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

if __name__ == '__main__':
    init_db()
    print("Database initialized.")