document.addEventListener('DOMContentLoaded', () => {
    const doctorAccessBtn = document.getElementById('doctorAccessBtn');
    const patientAccessBtn = document.getElementById('patientAccessBtn');
    const viewAccessBtn = document.getElementById('viewAccessBtn');
    const doctorLoginBtn = document.getElementById('doctorLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToHomeBtn = document.querySelectorAll('.backToHomeBtn');
    const backToHomeBtnGeneral = document.querySelector('.backToHomeBtnGeneral');
    const doctorForm = document.getElementById('doctor-form');
    const patientForm = document.getElementById('patient-form');
    const doctorLoginForm = document.getElementById('doctor-login');
    const viewDiv = document.getElementById('visor');
    const visorGeneral = document.getElementById('visor-general');
    const historyModal = document.getElementById('historyModal');
    const historyModalClose = document.getElementById('historyModalClose');
    const newDiagnosis = document.getElementById('newDiagnosis');
    const saveDiagnosisBtn = document.getElementById('saveDiagnosisBtn');
    const clinicalHistory = document.getElementById('clinicalHistory');
    const searchPatientBtn = document.getElementById('searchPatientBtn');
    const patientNombreInput = document.getElementById('patientNombre');
 
 
    doctorForm.style.display = 'none';
    patientForm.style.display = 'none';
    doctorLoginForm.style.display = 'none';
    viewDiv.style.display = 'none';
    visorGeneral.style.display = 'none';
    logoutBtn.style.display = 'none';
    let currentPatientDni = null;
    let currentDoctorDni = null; 
 
    
    
    searchPatientBtn.addEventListener('click', () => {
        const dni = document.getElementById('patientDni').value;

        fetch(`/get_patient/${dni}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    patientNombreInput.value = data.patient.nombre;
                } else {
                    alert('Paciente no encontrado');
                    patientNombreInput.value = ''; 
                }
            })
            .catch(error => {
                console.error('Error fetching patient:', error);
                alert('Error al buscar paciente');
            });
    });


    doctorAccessBtn.addEventListener('click', () => {
        doctorForm.style.display = 'flex';
        patientForm.style.display = 'none';
        doctorLoginForm.style.display = 'none';
        viewDiv.style.display = 'none';
        visorGeneral.style.display = 'none';
    });
 
 
    patientAccessBtn.addEventListener('click', () => {
        patientForm.style.display = 'flex';
        doctorForm.style.display = 'none';
        doctorLoginForm.style.display = 'none';
        viewDiv.style.display = 'none';
        visorGeneral.style.display = 'none';
        fetchSpecialties();
    });
 
 
    doctorLoginBtn.addEventListener('click', () => {
        doctorLoginForm.style.display = 'flex';
        doctorForm.style.display = 'none';
        patientForm.style.display = 'none';
        viewDiv.style.display = 'none';
        visorGeneral.style.display = 'none';
    });
 
 
    viewAccessBtn.addEventListener('click', () => {
        visorGeneral.style.display = 'flex';
        doctorForm.style.display = 'none';
        patientForm.style.display = 'none';
        doctorLoginForm.style.display = 'none';
        viewDiv.style.display = 'none';
        updateVisorGeneral();
    });
 
 
    backToHomeBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            viewDiv.style.display = 'none';
            doctorForm.style.display = 'none';
            patientForm.style.display = 'none';
            doctorLoginForm.style.display = 'none';
            visorGeneral.style.display = 'none';
        });
    });
 
 
    backToHomeBtnGeneral.addEventListener('click', () => {
        visorGeneral.style.display = 'none';
        doctorForm.style.display = 'none';
        patientForm.style.display = 'none';
        doctorLoginForm.style.display = 'none';
        viewDiv.style.display = 'none';
    });
 
 
    logoutBtn.addEventListener('click', () => {
        logoutBtn.style.display = 'none';
        doctorLoginForm.style.display = 'flex';
        viewDiv.style.display = 'none';
        visorGeneral.style.display = 'none';
        document.getElementById('turnosTableBody').innerHTML = '';
        document.getElementById('visorGeneralBody').innerHTML = '';
        currentDoctorDni = null;
    });
 
 
    document.getElementById('confirmDoctorBtn').addEventListener('click', () => {
        const dni = document.getElementById('doctorDni').value;
        const nombre = document.getElementById('doctorNombre').value;
        const especialidad = document.getElementById('doctorEspecialidad').value;
        const consultorio = document.getElementById('doctorConsultorio').value;
        
        
        fetch('/add_doctor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni, nombre, especialidad, consultorio })
        }).then(response => {
            if (response.ok) {
                alert('Doctor registrado correctamente');
                document.getElementById('doctorDni').value = '';
                document.getElementById('doctorNombre').value = '';
                document.getElementById('doctorEspecialidad').value = '';
                document.getElementById('doctorConsultorio').value = '';
                doctorForm.style.display = 'none';
            } else {
                alert('Error al registrar doctor');
            }
        });
    });
 
 
    document.getElementById('confirmPatientBtn').addEventListener('click', () => {
        const dni = document.getElementById('patientDni').value;
        const nombre = document.getElementById('patientNombre').value;
        const especialidad = document.getElementById('patientEspecialidad').value;
    
        fetch('/add_patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni, nombre, especialidad })
        }).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        document.getElementById('patientDni').value = '';
                        document.getElementById('patientNombre').value = '';
                        document.getElementById('patientEspecialidad').value = '';
                    } else {
                        alert(data.message);
                    }
                });
            } else {
                alert('Error al registrar paciente');
            }
        });
    });
    
 
 
    document.getElementById('doctorLoginSubmit').addEventListener('click', () => {
        const dni = document.getElementById('loginDni').value;
 
 
        fetch('/doctor_login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni })
        }).then(response => response.json())
          .then(data => {
              if (data.status === 'success') {
                  currentDoctorDni = dni; 
                  showDoctorInterface(data.patients);
                  document.getElementById('loginDni').value = '';
              } else {
                  alert('Doctor no encontrado');
              }
          });
    });
 
 
    function fetchSpecialties() {
        fetch('/get_specialties')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('patientEspecialidad');
                select.innerHTML = '';
                data.forEach(specialty => {
                    const option = document.createElement('option');
                    option.textContent = specialty;
                    option.value = specialty;
                    select.appendChild(option);
                });
            });
    }
 
 
    function showDoctorInterface(patients) {
        doctorLoginForm.style.display = 'none';
        viewDiv.style.display = 'flex';
        logoutBtn.style.display = 'block';
 
 
        const tableBody = document.getElementById('turnosTableBody');
        tableBody.innerHTML = '';
        patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.nombre}</td>
                <td>${patient.especialidad}</td>
                <td>${patient.consultorio}</td>
                <td>
                    <button onclick="llamarPaciente(${patient.dni})">Llamar paciente</button>
                    <button onclick="liberarPaciente(${patient.dni})">Liberar paciente</button>
                </td>
                `;
            tableBody.appendChild(row);
        });
    }
 
 
    historyModalClose.onclick = function() {
        historyModal.style.display = 'none';
    }
 
 
    saveDiagnosisBtn.addEventListener('click', () => {
        const diagnosis = newDiagnosis.value;
        if (diagnosis.trim() !== '') {
            fetch('/add_diagnosis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patient_dni: currentPatientDni, doctor_dni: currentDoctorDni, diagnosis })
            }).then(response => response.json())
              .then(data => {
                  if (data.status === 'success') {
                      alert('Diagnóstico guardado correctamente');
                      newDiagnosis.value = '';
                      openHistoryModal(currentPatientDni); 
                  } else {
                      alert('Error al guardar diagnóstico');
                  }
              });
        } else {
            alert('El diagnóstico no puede estar vacío');
        }
    });
 
 
    window.llamarPaciente = function(dni) {
        fetch(`/get_patient/${dni}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    currentPatientDni = dni; 
                    alert('Paciente llamado correctamente');
                    updateVisorGeneral();
                    openHistoryModal(dni);
                } else {
                    alert('Error al llamar paciente');
                }
            });
    }
 
 
    window.liberarPaciente = function(dni) {
        fetch(`/liberar_paciente/${dni}`, {
            method: 'POST',
        }).then(response => response.json())
          .then(data => {
              if (data.status === 'success') {
                  alert('Paciente liberado correctamente');
                  updateVisorGeneral();
                  removePatientFromDoctorView(dni);
              } else {
                  alert('Error al liberar paciente');
              }
          });
    }
 
 
    function removePatientFromDoctorView(dni) {
        const tableBody = document.getElementById('turnosTableBody');
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.querySelector(`button[onclick="liberarPaciente(${dni})"]`)) {
                row.remove();
            }
        });
    }
 
 
    function openHistoryModal(dni) {
        fetch(`/get_clinical_history/${dni}`)
            .then(response => response.json())
            .then(data => {
                clinicalHistory.innerHTML = '';
                data.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('history-entry');
                    entryDiv.innerHTML = `
                        <p><strong>Doctor:</strong> ${entry.doctor_nombre}</p>
                        <p><strong>Diagnóstico:</strong> ${entry.diagnosis}</p>
                        <p><strong>Fecha:</strong> ${entry.timestamp}</p>
                    `;
                    clinicalHistory.appendChild(entryDiv);
                });
                historyModal.style.display = 'block';
            });
    }
 
 
    function updateVisorGeneral() {
        fetch('/get_called_patients')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('visorGeneralBody');
                tableBody.innerHTML = '';
                data.forEach(patient => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${patient.nombre}</td>
                        <td>${patient.especialidad}</td>
                        <td>${patient.consultorio}</td>
                    `;
                    tableBody.appendChild(row);
                });
            });
    }

 });
 