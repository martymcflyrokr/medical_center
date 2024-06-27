from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Doctor(db.Model):
   dni = db.Column(db.Integer, primary_key=True)
   nombre = db.Column(db.String(100), nullable=False)
   especialidad = db.Column(db.String(100), nullable=False)
   consultorio = db.Column(db.Integer, nullable=False)


class Patient(db.Model):
   dni = db.Column(db.Integer, primary_key=True)
   nombre = db.Column(db.String(100), nullable=False)
   especialidad = db.Column(db.String(100), nullable=False)
   consultorio = db.Column(db.Integer, nullable=False)
   called = db.Column(db.Boolean, default=False)


class ClinicalHistory(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   patient_dni = db.Column(db.Integer, db.ForeignKey('patient.dni'), nullable=False)
   doctor_dni = db.Column(db.Integer, db.ForeignKey('doctor.dni'), nullable=False)
   diagnosis = db.Column(db.String(500), nullable=False)
   timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())




with app.app_context():
   db.create_all()


@app.route('/get_clinical_history/<int:dni>', methods=['GET'])
def get_clinical_history(dni):
   history_entries = ClinicalHistory.query.filter_by(patient_dni=dni).all()
   history_list = [{
       'doctor_nombre': Doctor.query.filter_by(dni=entry.doctor_dni).first().nombre,
       'diagnosis': entry.diagnosis,
       'timestamp': entry.timestamp,
   } for entry in history_entries]
   return jsonify(history_list)
  
@app.route('/add_diagnosis', methods=['POST'])
def add_diagnosis():
   data = request.get_json()
   new_entry = ClinicalHistory(
       patient_dni=data['patient_dni'],
       doctor_dni=data['doctor_dni'],
       diagnosis=data['diagnosis']
   )
   db.session.add(new_entry)
   db.session.commit()
   return jsonify({'status': 'success'})
@app.route('/')
def index():
   return render_template('index.html')


@app.route('/add_doctor', methods=['POST'])
def add_doctor():
   data = request.get_json()
   new_doctor = Doctor(
       dni=data['dni'],
       nombre=data['nombre'],
       especialidad=data['especialidad'],
       consultorio=data['consultorio']
   )
   db.session.add(new_doctor)
   db.session.commit()
   return jsonify({'status': 'success'})


@app.route('/add_patient', methods=['POST'])
def add_patient():
   data = request.get_json()
   especialidad = data['especialidad']
   doctor = Doctor.query.filter_by(especialidad=especialidad).first()
   if doctor:
       new_patient = Patient(
           dni=data['dni'],
           nombre=data['nombre'],
           especialidad=especialidad,
           consultorio=doctor.consultorio
       )
       db.session.add(new_patient)
       db.session.commit()
       return jsonify({'status': 'success'})
   else:
       return jsonify({'status': 'error', 'message': 'No doctor available for this specialty'})


@app.route('/get_specialties', methods=['GET'])
def get_specialties():
   specialties = [doctor.especialidad for doctor in Doctor.query.distinct(Doctor.especialidad)]
   return jsonify(specialties)


@app.route('/get_turnos', methods=['GET'])
def get_turnos():
   turnos = Patient.query.all()
   turnos_list = [{'nombre': turno.nombre, 'especialidad': turno.especialidad, 'consultorio': turno.consultorio} for turno in turnos]
   return jsonify(turnos_list)


@app.route('/get_called_patients', methods=['GET'])
def get_called_patients():
   called_patients = Patient.query.filter_by(called=True).all()
   called_list = [{'nombre': patient.nombre, 'especialidad': patient.especialidad, 'consultorio': patient.consultorio} for patient in called_patients]
   return jsonify(called_list)


@app.route('/doctor_login', methods=['POST'])
def doctor_login():
   data = request.get_json()
   dni = data['dni']
   doctor = Doctor.query.filter_by(dni=dni).first()
   if doctor:
       patients = Patient.query.filter_by(especialidad=doctor.especialidad).all()
       patients_list = [{'nombre': patient.nombre, 'dni': patient.dni, 'especialidad': patient.especialidad, 'consultorio': patient.consultorio, 'called': patient.called} for patient in patients]
       return jsonify({'status': 'success', 'patients': patients_list})
   else:
       return jsonify({'status': 'error', 'message': 'Doctor not found'})


@app.route('/get_patient/<int:dni>', methods=['GET'])
def get_patient(dni):
   patient = Patient.query.filter_by(dni=dni).first()
   if patient:
       patient.called = True
       db.session.commit()
       return jsonify({'status': 'success', 'patient': {'nombre': patient.nombre, 'especialidad': patient.especialidad, 'consultorio': patient.consultorio}})
   else:
       return jsonify({'status': 'error', 'message': 'Patient not found'})


@app.route('/liberar_paciente/<int:dni>', methods=['POST'])
def liberar_paciente(dni):
   patient = Patient.query.filter_by(dni=dni).first()
   if patient:
       patient.called = False
       db.session.commit()
       return jsonify({'status': 'success'})
   else:
       return jsonify({'status': 'error', 'message': 'Patient not found'})


if __name__ == '__main__':
   app.run(debug=True)