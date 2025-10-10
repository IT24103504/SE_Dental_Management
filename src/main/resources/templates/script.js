// Configuration
const CONFIG = {
    API_BASE: 'http://localhost:8080/api/requests',
    EMERGENCY_API_BASE: 'http://localhost:8080/api/emergency-requests',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'dcm'],
    AUTO_REFRESH_INTERVAL: 30000 // 30 seconds
};

// State management
let currentRequestId = null;
let refreshInterval = null;

// Toast notification system
class Toast {
    static show(message, type = 'info', title = null) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title || type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Professional Dialog Management System
class DialogManager {
    static showDialog(dialogId, title, message) {
        const dialog = document.getElementById(dialogId);
        const titleElement = dialog.querySelector('.confirm-dialog-title');
        const messageElement = dialog.querySelector('.confirm-dialog-message');

        titleElement.textContent = title;
        messageElement.textContent = message;
        dialog.style.display = 'flex';

        // Add escape key listener
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideDialog(dialogId);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    static hideDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        dialog.style.display = 'none';
    }

    static createPromiseDialog(dialogId, title, message) {
        return new Promise((resolve) => {
            const dialog = document.getElementById(dialogId);
            const titleElement = dialog.querySelector('.confirm-dialog-title');
            const messageElement = dialog.querySelector('.confirm-dialog-message');

            titleElement.textContent = title;
            messageElement.textContent = message;
            dialog.style.display = 'flex';

            // Store resolve function
            dialog._resolve = resolve;

            // Add escape key listener
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.hideDialog(dialogId);
                    resolve(false);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }
}

// Specific dialog controllers
class ConfirmDialog {
    static callback = null;

    static async show(title, message) {
        return new Promise((resolve) => {
            this.callback = resolve;
            DialogManager.showDialog('confirmDialog', title, message);
        });
    }

    static confirm() {
        if (this.callback) {
            this.callback(true);
            this.callback = null;
        }
        DialogManager.hideDialog('confirmDialog');
    }

    static cancel() {
        if (this.callback) {
            this.callback(false);
            this.callback = null;
        }
        DialogManager.hideDialog('confirmDialog');
    }
}

class SuccessDialog {
    static callback = null;

    static show(title, message, callback = null) {
        this.callback = callback;
        DialogManager.showDialog('successDialog', title, message);
    }

    static close() {
        if (this.callback) {
            this.callback();
            this.callback = null;
        }
        DialogManager.hideDialog('successDialog');
    }
}

class WarningDialog {
    static callback = null;

    static async show(title, message) {
        return new Promise((resolve) => {
            this.callback = resolve;
            DialogManager.showDialog('warningDialog', title, message);
        });
    }

    static confirm() {
        if (this.callback) {
            this.callback(true);
            this.callback = null;
        }
        DialogManager.hideDialog('warningDialog');
    }

    static cancel() {
        if (this.callback) {
            this.callback(false);
            this.callback = null;
        }
        DialogManager.hideDialog('warningDialog');
    }
}

// Error handling utilities
class ErrorHandler {
    static handleNetworkError(error) {
        console.error('Network Error:', error);
        Toast.show(
            'Unable to connect to the server. Please check your internet connection and ensure the backend service is running.',
            'error',
            'Connection Error'
        );
    }

    static handleApiError(error, context) {
        console.error(`API Error in ${context}:`, error);

        if (error.message.includes('Failed to fetch')) {
            this.handleNetworkError(error);
        } else {
            Toast.show(
                `Operation failed: ${error.message}`,
                'error',
                `${context} Error`
            );
        }
    }

    static validateFile(file) {
        if (!file) {
            throw new Error('Please select a file to upload.');
        }

        if (file.size > CONFIG.MAX_FILE_SIZE) {
            throw new Error(`File size exceeds ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!CONFIG.ALLOWED_FILE_TYPES.includes(fileExtension)) {
            throw new Error(`Invalid file type. Allowed formats: ${CONFIG.ALLOWED_FILE_TYPES.join(', ')}`);
        }

        return true;
    }

    static validateForm(formData, requiredFields) {
        for (const field of requiredFields) {
            if (!formData.get(field)?.toString().trim()) {
                throw new Error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            }
        }
    }
}

// API service layer - UPDATED FOR PLAIN TEXT RESPONSES
class ApiService {
    static async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);

            // Handle both JSON and plain text responses
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // It's plain text - read as text
                data = await response.text();

                // For successful plain text responses, create a consistent format
                if (response.ok) {
                    return {
                        success: true,
                        message: data,
                        status: 'success'
                    };
                } else {
                    // For error responses in plain text
                    throw new Error(data);
                }
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            throw error;
        }
    }

    static async getPendingRequests() {
        return await this.fetchWithTimeout(`${CONFIG.API_BASE}/pending`);
    }

    static async getProcessedRequests() {
        return await this.fetchWithTimeout(`${CONFIG.API_BASE}/processed`);
    }

    static async getEmergencyRequests() {
        return await this.fetchWithTimeout(CONFIG.EMERGENCY_API_BASE);
    }

    static async uploadXRay(requestId, formData) {
        const result = await this.fetchWithTimeout(`${CONFIG.API_BASE}/${requestId}`, {
            method: 'PUT',
            body: formData
        });
        return result;
    }

    static async createEmergencyRequest(formData) {
        const result = await this.fetchWithTimeout(CONFIG.EMERGENCY_API_BASE, {
            method: 'POST',
            body: formData
        });
        return result;
    }

    static async deleteRequest(requestId) {
        const result = await this.fetchWithTimeout(`${CONFIG.API_BASE}/${requestId}`, {
            method: 'DELETE'
        });
        return result;
    }

    static async deleteEmergencyRequest(requestId) {
        const result = await this.fetchWithTimeout(`${CONFIG.EMERGENCY_API_BASE}/${requestId}`, {
            method: 'DELETE'
        });
        return result;
    }
}

// UI rendering functions
class UIRenderer {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static renderRequestsTable(requests, containerId, isProcessed = false) {
        const tbody = document.getElementById(containerId);

        if (!requests || requests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${isProcessed ? 6 : 7}" class="no-requests">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                        <br>
                        No ${isProcessed ? 'processed' : 'pending'} requests found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = requests.map(request => {
            const statusClass = request.status === 'Pending' ? 'status-pending' : 'status-processed';
            const statusIcon = request.status === 'Pending' ? 'fas fa-clock' : 'fas fa-check-circle';

            const baseRow = `
                <tr>
                    <td><strong>#${request.id}</strong></td>
                    <td>${this.escapeHtml(request.patientName)}</td>
                    <td>${this.escapeHtml(request.dentistName || '-')}</td>
                    <td>${this.formatDate(request.requestDate)}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <i class="${statusIcon}"></i>
                            ${request.status}
                        </span>
                    </td>
                    <td>${this.escapeHtml(request.notes || 'No notes provided')}</td>
            `;

            if (isProcessed) {
                return baseRow + `</tr>`;
            } else {
                return baseRow + `
                    <td>
                        <button class="btn btn-success" onclick="openModal(${request.id}, '${this.escapeHtml(request.patientName).replace(/'/g, "\\'")}')">
                            <i class="fas fa-upload"></i>
                            Upload
                        </button>
                        <button class="btn btn-danger" onclick="deleteRequest(${request.id})">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </td>
                </tr>`;
            }
        }).join('');
    }

    static renderEmergencyTable(requests) {
        const tbody = document.getElementById('emergencyTableBody');

        if (!requests || requests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-requests">
                        <i class="fas fa-ambulance" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                        <br>
                        No emergency requests found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = requests.map(request => {
            const statusClass = request.status === 'Pending' ? 'status-emergency' : 'status-processed';
            const statusIcon = request.status === 'Pending' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';

            return `
                <tr>
                    <td><strong>#${request.id}</strong></td>
                    <td>${this.escapeHtml(request.patientName)}</td>
                    <td>${this.formatDate(request.requestDate)}</td>
                    <td>${this.escapeHtml(request.type)}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <i class="${statusIcon}"></i>
                            ${request.status}
                        </span>
                    </td>
                    <td>${this.escapeHtml(request.notes || 'No notes provided')}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteEmergencyRequest(${request.id})">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    static updateStatistics(pendingRequests, processedRequests, emergencyRequests) {
        document.getElementById('pendingCount').textContent = pendingRequests?.length || 0;
        document.getElementById('processedCount').textContent = processedRequests?.length || 0;
        document.getElementById('emergencyCount').textContent = emergencyRequests?.length || 0;
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static showLoading(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    <div class="loading-spinner"></div>
                    ${message}
                </td>
            </tr>
        `;
    }
}

// Main application functions
async function loadAllData() {
    try {
        UIRenderer.showLoading('requestsTableBody', 'Loading pending requests...');
        UIRenderer.showLoading('processedTableBody', 'Loading processed requests...');
        UIRenderer.showLoading('emergencyTableBody', 'Loading emergency requests...');

        const [pendingRequests, processedRequests, emergencyRequests] = await Promise.all([
            ApiService.getPendingRequests(),
            ApiService.getProcessedRequests(),
            ApiService.getEmergencyRequests()
        ]);

        UIRenderer.renderRequestsTable(pendingRequests, 'requestsTableBody');
        UIRenderer.renderRequestsTable(processedRequests, 'processedTableBody', true);
        UIRenderer.renderEmergencyTable(emergencyRequests);
        UIRenderer.updateStatistics(pendingRequests, processedRequests, emergencyRequests);

    } catch (error) {
        ErrorHandler.handleApiError(error, 'loading data');
        UIRenderer.showLoading('requestsTableBody', 'Error loading data');
        UIRenderer.showLoading('processedTableBody', 'Error loading data');
        UIRenderer.showLoading('emergencyTableBody', 'Error loading data');
    }
}

// Modal management
function openModal(requestId, patientName) {
    currentRequestId = requestId;
    document.getElementById('modalPatientName').textContent = patientName;
    document.getElementById('modalRequestId').textContent = requestId;
    document.getElementById('uploadModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('notesInput').value = '';
    document.getElementById('fileUploadArea').classList.remove('dragover');
}

function openEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'flex';
}

function closeEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'none';
    document.getElementById('emergencyPatientName').value = '';
    document.getElementById('emergencyType').value = '';
    document.getElementById('emergencyFileInput').value = '';
    document.getElementById('emergencyNotesInput').value = '';
}

// File handling
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('fileUploadArea').classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('fileUploadArea').classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('fileUploadArea').classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files);
    }
}

function handleFileSelect(files) {
    const fileInput = document.getElementById('fileInput');
    fileInput.files = files;
}

// Enhanced upload success with beautiful dialog
async function uploadImage() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const notes = document.getElementById('notesInput').value;

    try {
        ErrorHandler.validateFile(file);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('notes', notes);

        const uploadBtn = document.querySelector('#uploadModal .btn-success');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        uploadBtn.disabled = true;

        // This now works with plain text responses
        await ApiService.uploadXRay(currentRequestId, formData);

        // Show success dialog instead of toast
        SuccessDialog.show(
            'Upload Successful',
            'X-ray image has been uploaded and processed successfully. The request has been moved to processed requests.',
            () => {
                closeModal();
                loadAllData();
            }
        );

    } catch (error) {
        ErrorHandler.handleApiError(error, 'uploading X-ray');

        // Reset button state on error
        const uploadBtn = document.querySelector('#uploadModal .btn-success');
        uploadBtn.innerHTML = '<i class="fas fa-check"></i> Upload & Process';
        uploadBtn.disabled = false;
    }
}
async function createEmergencyRequest() {
    const patientName = document.getElementById('emergencyPatientName').value;
    const type = document.getElementById('emergencyType').value;
    const notes = document.getElementById('emergencyNotesInput').value;
    const fileInput = document.getElementById('emergencyFileInput');
    const file = fileInput.files[0];

    try {
        // Basic validation - FILE IS NOW REQUIRED
        if (!patientName.trim()) {
            throw new Error('Please enter patient name');
        }
        if (!type.trim()) {
            throw new Error('Please select X-ray type');
        }
        if (!file) {
            throw new Error('Please select an X-ray image file for emergency requests');
        }

        // Validate the file
        ErrorHandler.validateFile(file);

        const formData = new FormData();
        formData.append('patientName', patientName.trim());
        formData.append('type', type.trim());
        formData.append('notes', notes.trim());
        formData.append('image', file); // REQUIRED - always included
        formData.append('createdBy', 'Lab Assistant');

        const createBtn = document.querySelector('#emergencyModal .btn-emergency');
        const originalText = createBtn.innerHTML;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        createBtn.disabled = true;

        const result = await ApiService.createEmergencyRequest(formData);

        SuccessDialog.show(
            'Emergency Request Created',
            'Emergency X-ray request has been created successfully and is now visible in the emergency requests section.',
            () => {
                closeEmergencyModal();
                loadAllData();
            }
        );

    } catch (error) {
        ErrorHandler.handleApiError(error, 'creating emergency request');

        const createBtn = document.querySelector('#emergencyModal .btn-emergency');
        createBtn.innerHTML = '<i class="fas fa-bolt"></i> Create Emergency Request';
        createBtn.disabled = false;
    }
}


// Enhanced delete functions with beautiful dialogs
async function deleteRequest(id) {
    const confirmed = await ConfirmDialog.show(
        'Delete Request',
        'Are you sure you want to delete this X-ray request? This action cannot be undone and all associated data will be permanently removed.'
    );

    if (confirmed) {
        try {
            await ApiService.deleteRequest(id);
            Toast.show('X-ray request deleted successfully!', 'success', 'Request Deleted');
            await loadAllData();
        } catch (error) {
            ErrorHandler.handleApiError(error, 'deleting request');
        }
    }
}

async function deleteEmergencyRequest(id) {
    const confirmed = await ConfirmDialog.show(
        'Delete Emergency Request',
        'Are you sure you want to delete this emergency X-ray request? This is a critical medical record and deletion cannot be undone.'
    );

    if (confirmed) {
        try {
            await ApiService.deleteEmergencyRequest(id);
            Toast.show('Emergency request deleted successfully!', 'success', 'Emergency Request Deleted');
            await loadAllData();
        } catch (error) {
            ErrorHandler.handleApiError(error, 'deleting emergency request');
        }
    }
}

// Enhanced logout function with beautiful dialog
async function logout() {
    const confirmed = await WarningDialog.show(
        'Confirm Logout',
        'Are you sure you want to logout? Any unsaved changes will be lost.'
    );

    if (confirmed) {
        Toast.show('You have been logged out successfully.', 'info', 'Logged Out');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

function startAutoRefresh() {
    refreshInterval = setInterval(loadAllData, CONFIG.AUTO_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
    // Close dialogs when clicking outside
    document.querySelectorAll('.confirm-dialog-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                // Also cancel any pending callbacks
                if (this.id === 'confirmDialog' && ConfirmDialog.callback) {
                    ConfirmDialog.callback(false);
                    ConfirmDialog.callback = null;
                }
                if (this.id === 'warningDialog' && WarningDialog.callback) {
                    WarningDialog.callback(false);
                    WarningDialog.callback = null;
                }
            }
        });
    });

    // Load initial data
    loadAllData();

    // Start auto-refresh
    startAutoRefresh();

    // Close modals when clicking outside
    window.onclick = function(event) {
        const uploadModal = document.getElementById('uploadModal');
        const emergencyModal = document.getElementById('emergencyModal');

        if (event.target === uploadModal) closeModal();
        if (event.target === emergencyModal) closeEmergencyModal();
    };

    // Handle escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeEmergencyModal();
        }
    });

    // Prevent drag and drop default behavior
    document.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    document.addEventListener('drop', function(event) {
        event.preventDefault();
    });
});

// Stop auto-refresh when page becomes inactive
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
    }
});