const API_BASE = 'http://localhost:8080/api';
const DENTIST_ID = 1;

function generateCalendar(year, month) {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("month-year").textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const adjustedFirstDay = (firstDay + 6) % 7;
    for (let i = 0; i < adjustedFirstDay; i++) grid.appendChild(document.createElement("div"));

    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement("div");
        div.textContent = day;
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            div.classList.add("today");
        }
        grid.appendChild(div);
    }
}

let currentDate = new Date();
generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
document.getElementById("prev-month").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
};
document.getElementById("next-month").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
};

document.addEventListener('DOMContentLoaded', function() {
    loadAppointmentRequests();
    loadUpcomingAppointments();
    loadRecentPatients();
    loadStats();
});

async function loadAppointmentRequests() {
    try {
        const response = await fetch(`${API_BASE}/appointments/dentist/${DENTIST_ID}/pending`);
        const appointments = await response.json();

        const tbody = document.querySelector("#requests-table tbody");
        tbody.innerHTML = '';

        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #7f8c8d;">No pending appointments</td></tr>';
        } else {
            appointments.forEach(appt => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', appt.appointmentId);
                row.innerHTML = `
                    <td>${appt.appointmentId}</td>
                    <td><img src="defaultprofile.jpg"> ${appt.patientName}</td>
                    <td><span class="tooltip">?<span class="tooltiptext">${appt.notes || 'No notes'}</span></span></td>
                    <td>${formatDateTime(appt.appointmentDateTime)}</td>
                    <td>
                        <button class="btn btn-accept" onclick="acceptAppointment('${appt.appointmentId}')">Accept</button>
                        <button class="btn btn-reject" onclick="rejectAppointment('${appt.appointmentId}')">Reject</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading appointment requests:', error);
        const tbody = document.querySelector("#requests-table tbody");
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading appointments</td></tr>';
    }
}

async function loadUpcomingAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments/dentist/${DENTIST_ID}/upcoming`);
        const appointments = await response.json();

        const tbody = document.querySelector("#upcoming-table tbody");
        tbody.innerHTML = '';

        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #7f8c8d;">No upcoming appointments</td></tr>';
        } else {
            appointments.forEach(appt => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', appt.appointmentId);
                row.innerHTML = `
                    <td>${appt.appointmentId}</td>
                    <td>${appt.patientName}</td>
                    <td>${appt.notes || 'No notes'}</td>
                    <td>${formatDateTime(appt.appointmentDateTime)}</td>
                    <td>${appt.status}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading upcoming appointments:', error);
    }
}

async function loadRecentPatients() {
    try {
        const response = await fetch(`${API_BASE}/appointments/dentist/${DENTIST_ID}/recent`);
        const appointments = await response.json();

        const tbody = document.querySelector("#recent-table tbody");
        tbody.innerHTML = '';

        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No recent patients</td></tr>';
        } else {
            appointments.forEach(appt => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="defaultprofile.jpg"> ${appt.patientName}</td>
                    <td>${appt.patientGender || 'N/A'}</td>
                    <td>${appt.patientAge || 'N/A'}</td>
                    <td>Consultation</td>
                    <td>${formatDate(appt.appointmentDateTime)}</td>
                    <td>Completed</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading recent patients:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/appointments/dentist/${DENTIST_ID}/stats`);
        const stats = await response.json();

        document.getElementById("appointments-count").textContent = stats.pending || 0;
        document.getElementById("new-patients-count").textContent = stats.accepted || 0;
        document.getElementById("recent-patients-count").textContent = stats.recent || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById("appointments-count").textContent = "0";
        document.getElementById("new-patients-count").textContent = "0";
        document.getElementById("recent-patients-count").textContent = "0";
    }
}

async function acceptAppointment(appointmentId) {
    if (!confirm('Are you sure you want to accept this appointment?')) return;

    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACCEPTED' })
        });

        if (response.ok) {
            alert('Appointment accepted successfully!');
            loadAppointmentRequests();
            loadUpcomingAppointments();
            loadStats();
        } else {
            alert('Error accepting appointment');
        }
    } catch (error) {
        console.error('Error accepting appointment:', error);
        alert('Error accepting appointment');
    }
}

async function rejectAppointment(appointmentId) {
    if (!confirm('Are you sure you want to reject this appointment?')) return;

    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'REJECTED' })
        });

        if (response.ok) {
            alert('Appointment rejected successfully!');
            loadAppointmentRequests();
            loadStats();
        } else {
            alert('Error rejecting appointment');
        }
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        alert('Error rejecting appointment');
    }
}

function formatDateTime(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
        return dateTimeString;
    }
}

function formatDate(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
        return dateTimeString;
    }
}

function toggleMenu() {
    const menu = document.getElementById('profile-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'login.html';
    }
    document.getElementById('profile-menu').style.display = 'none';
}

document.addEventListener('click', function(event) {
    const menu = document.getElementById('profile-menu');
    const icon = document.querySelector('.menu-icon');
    if (!icon.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = 'none';
    }
});

document.getElementById('card-new-patients').onclick = function() {
    window.location.href = 'patients.html';
};
