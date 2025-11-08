import click
from flask.cli import with_appcontext
from .models import User, db
from werkzeug.security import generate_password_hash

@click.command('create-admin')
@click.option('--username', prompt=True, help='The username of the admin user')
@click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True, help='The password of the admin user')
@with_appcontext
def create_admin(username, password):
    user = User.query.filter_by(username=username).first()
    if user:
        click.echo('User already exists. Please choose a different username.')
        return

    new_user = User(username=username, email=f"{username}@admin.com", is_admin=True)
    new_user.password_hash = generate_password_hash(password)
    db.session.add(new_user)
    db.session.commit()
    click.echo(f'Admin user {username} created successfully.')