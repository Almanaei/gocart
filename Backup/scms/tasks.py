from flask import current_app

def backup_database():
    with current_app.app_context():
        # Perform backup tasks here
        print("Database backup started.")
        # Add your backup logic here