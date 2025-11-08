import sqlite3
import os
import shutil
import schedule
import time
from datetime import datetime

BACKUP_DIR = 'database_backups'

def create_backup(database_path, backup_type):
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"{backup_type}_backup_{timestamp}.db"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    
    # Create a copy of the database
    shutil.copy2(database_path, backup_path)
    print(f"{backup_type.capitalize()} backup created: {backup_filename}")

def weekly_backup(database_path):
    create_backup(database_path, 'weekly')

def monthly_backup(database_path):
    create_backup(database_path, 'monthly')

def run_backup_scheduler(database_path):
    # Schedule weekly backup every Sunday at 1:00 AM
    schedule.every().sunday.at("01:00").do(weekly_backup, database_path)
    
    # Schedule monthly backup on the first day of every month at 2:00 AM
    schedule.every().day.at("02:00").do(lambda: monthly_backup(database_path) if datetime.now().day == 1 else None)

    while True:
        schedule.run_pending()
        time.sleep(60)  # Sleep for 1 minute

if __name__ == "__main__":
    # This block won't be executed when imported, so it's safe to leave it
    from app import DATABASE
    run_backup_scheduler(DATABASE)