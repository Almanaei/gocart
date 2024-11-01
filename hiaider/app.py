from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'postgresql://user:password@host:port/database'  # Replace with your PostgreSQL connection string
db = SQLAlchemy(app)


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text)


@app.route('/')
def index():
    appointments = Appointment.query.all()
    return render_template('index.html', appointments=appointments)


@app.route('/add', methods=['GET', 'POST'])
def add_appointment():
    if request.method == 'POST':
        title = request.form['title']
        start_time = request.form['start_time']
        end_time = request.form['end_time']
        description = request.form['description']

        appointment = Appointment(title=title, start_time=start_time, end_time=end_time, description=description)
        db.session.add(appointment)
        db.session.commit()

        return redirect(url_for('index'))

    return render_template('add.html')

@app.route('/delete/<int:appointment_id>', methods=['POST'])
def delete_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    db.session.delete(appointment)
    db.session.commit()
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)
