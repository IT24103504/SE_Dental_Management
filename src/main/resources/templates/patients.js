const API_BASE = 'http://localhost:8080/api';
const DENTIST_ID = 1;

document.addEventListener('DOMContentLoaded', async () => {
    await loadAcceptedAppointments();
    await loadNewPatients();
});

// Search and display X-ray images for a patient
async function searchXRayImages() {
    const patientName = document.getElementById('patient-search').value.trim();

    if (!patientName) {
        alert('Please enter a patient name');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/xray-requests/patient/${encodeURIComponent(patientName)}`);
        const xrayRequests = await response.json();

        const container = document.getElementById('xray-images-container');
        const noImages = document.getElementById('no-xray-images');

        if (xrayRequests.length === 0) {
            noImages.style.display = 'block';
            container.style.display = 'none';
            noImages.innerHTML = `No X-ray images found for patient: ${patientName}`;
        } else {
            noImages.style.display = 'none';
            container.style.display = 'grid';
            container.innerHTML = '';

            xrayRequests.forEach(request => {
                if (request.imagePath) {
                    const xrayCard = createXRayCard(request);
                    container.appendChild(xrayCard);
                }
            });

            // If no images found but requests exist
            if (container.innerHTML === '') {
                noImages.style.display = 'block';
                container.style.display = 'none';
                noImages.innerHTML = `X-ray requests found but no images uploaded yet for patient: ${patientName}`;
            }
        }
    } catch (error) {
        console.error('Error loading X-ray images:', error);
        document.getElementById('no-xray-images').style.display = 'block';
        document.getElementById('no-xray-images').innerHTML = 'Error loading X-ray images';
    }
}

function createXRayCard(request) {
    const card = document.createElement('div');
    card.className = 'xray-card';
    card.innerHTML = `
        <div class="xray-card-header">
            <h4>${request.patientName}</h4>
            <span class="xray-date">${formatDate(request.requestDate)}</span>
        </div>
        <div class="xray-card-body">
            <img src="${request.imagePath}" alt="X-ray Image" class="xray-thumbnail" onclick="openXRayModal('${request.imagePath}', '${request.patientName}', '${formatDate(request.requestDate)}')">
            <div class="xray-info">
                <p><strong>Status:</strong> ${request.status}</p>
                <p><strong>Notes:</strong> ${request.notes || 'No notes'}</p>
            </div>
        </div>
    `;
    return card;
}

function openXRayModal(imageSrc, patientName, date) {
    const modal = document.getElementById('xray-modal');
    const modalImg = document.getElementById('modal-image');
    const caption = document.getElementById('modal-caption');

    modal.style.display = 'block';
    modalImg.src = imageSrc;
    caption.innerHTML = `<strong>${patientName}</strong> - ${date}`;
}

// Load all accepted appointments for management
async function loadAcceptedAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments/accepted`);
        const appointments = await response.json();

        const table = document.getElementById('accepted-table');
        const tbody = table.querySelector('tbody');
        const noAccepted = document.getElementById('no-accepted');

        if (appointments.length === 0) {
            noAccepted.style.display = 'block';
            table.style.display = 'none';
        } else {
            noAccepted.style.display = 'none';
            table.style.display = 'table';
            tbody.innerHTML = '';

            appointments.forEach(appt => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appt.appointmentId}</td>
                    <td>${appt.patientName}</td>
                    <td>${appt.patientGender || 'N/A'}</td>
                    <td>${appt.patientAge || 'N/A'}</td>
                    <td>${appt.patientContact || 'N/A'}</td>
                    <td>${formatDateTime(appt.appointmentDateTime)}</td>
                    <td>${appt.status}</td>
                    <td>
                        <button class="btn btn-reject" onclick="deleteAppointment('${appt.appointmentId}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading accepted appointments:', error);
    }
}

// Load new patients (upcoming appointments)
async function loadNewPatients() {
    try {
        const response = await fetch(`${API_BASE}/appointments/dentist/${DENTIST_ID}/upcoming`);
        const appointments = await response.json();

        const table = document.getElementById('patients-table');
        const tbody = table.querySelector('tbody');
        const noPatients = document.getElementById('no-patients');

        if (appointments.length === 0) {
            noPatients.style.display = 'block';
            table.style.display = 'none';
        } else {
            noPatients.style.display = 'none';
            table.style.display = 'table';
            tbody.innerHTML = '';

            appointments.forEach((appt, index) => {
                const mainRow = createPatientRow(appt, index);
                tbody.appendChild(mainRow);

                const detailsRow = createXrayDetailsRow(appt, index);
                tbody.appendChild(detailsRow);
            });
        }
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

function createPatientRow(appt, index) {
    const detailsPopup = `
        Gender: ${appt.patientGender || 'Not specified'}<br>
        Age: ${appt.patientAge || 'Not specified'}<br>
        Contact No: ${appt.patientContact || 'Not specified'}<br>
        Reason: ${appt.notes || 'No notes'}<br>
        Date/Time: ${formatDateTime(appt.appointmentDateTime)}
    `;

    const mainRow = document.createElement('tr');
    mainRow.dataset.id = appt.appointmentId;
    mainRow.innerHTML = `
        <td><span class="tooltip">${appt.appointmentId}<span class="tooltiptext">${detailsPopup}</span></span></td>
        <td><span class="tooltip">${appt.patientName}<span class="tooltiptext">${detailsPopup}</span></span></td>
        <td>${appt.patientGender || 'N/A'}</td>
        <td>${appt.patientAge || 'N/A'}</td>
        <td>${appt.patientContact || 'N/A'}</td>
        <td>${appt.notes || 'No notes'}</td>
        <td>${formatDateTime(appt.appointmentDateTime)}</td>
        <td>Approved</td>
        <td>
            <button class="btn btn-details" onclick="toggleDetails(this)">Xray</button>
        </td>
    `;
    return mainRow;
}

function createXrayDetailsRow(appt, index) {
    const detailsRow = document.createElement('tr');
    detailsRow.classList.add('details-row');
    detailsRow.style.display = 'none';
    detailsRow.innerHTML = `
        <td colspan="9">
            <div class="xray-request">
                <h4>X-ray Request for Patient: ${appt.patientName} (ID: ${appt.appointmentId})</h4>
                <textarea id="instructions-${appt.appointmentId}" placeholder="Type instructions for X-ray (e.g., full mouth, specific tooth)"></textarea>
                <button class="btn btn-accept" onclick="sendRequest('${appt.appointmentId}', '${appt.patientName}')">Send Request</button>
                <div id="xray-status-${appt.appointmentId}" style="margin-top: 10px;"></div>
            </div>
        </td>
    `;
    return detailsRow;
}

async function sendRequest(appointmentId, patientName) {
    const textarea = document.getElementById(`instructions-${appointmentId}`);
    const instructions = textarea.value.trim();
    const statusDiv = document.getElementById(`xray-status-${appointmentId}`);

    if (!instructions) {
        statusDiv.innerHTML = '<p style="color: red;">Please enter instructions for the X-ray.</p>';
        return;
    }

    try {
        statusDiv.innerHTML = '<p style="color: blue;">Sending X-ray request...</p>';

        const requestData = {
            patientName: patientName,
            dentistName: "Dr. Nilusha Sudharaka",
            notes: `Appointment ID: ${appointmentId}. Instructions: ${instructions}`
        };

        const response = await fetch(`${API_BASE}/xray-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            statusDiv.innerHTML = '<p style="color: green;">✅ X-ray request sent successfully!</p>';
            textarea.value = '';
        } else {
            const errorText = await response.text();
            statusDiv.innerHTML = `<p style="color: red;">Error: ${errorText}</p>`;
        }
    } catch (error) {
        console.error('Error sending X-ray request:', error);
        statusDiv.innerHTML = `<p style="color: red;">Network error</p>`;
    }
}

// Delete accepted appointment
async function deleteAppointment(appointmentId) {
    if (confirm('Are you sure you want to delete this accepted appointment?')) {
        try {
            const response = await fetch(`${API_BASE}/appointments/accepted/${appointmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Accepted appointment deleted successfully!');
                loadAcceptedAppointments();
            } else {
                alert('Error deleting appointment');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Error deleting appointment');
        }
    }
}

function toggleDetails(button) {
    const row = button.closest('tr');
    const detailsRow = row.nextElementSibling;
    if (detailsRow && detailsRow.classList.contains('details-row')) {
        detailsRow.style.display = detailsRow.style.display === 'none' ? 'table-row' : 'none';
    }
}

function closeModal() {
    const modal = document.getElementById('xray-modal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('xray-modal');
    if (event.target === modal) {
        closeModal();
    }
};

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}