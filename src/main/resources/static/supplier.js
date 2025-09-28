const STORAGE_KEY = 'supplier_inventory_v1';
const API_BASE = '/api';

// DOM refs
const itemsBody = document.getElementById('itemsBody');
const searchInput = document.getElementById('searchInput');
const viewFilter = document.getElementById('viewFilter');
const sortSelect = document.getElementById('sortSelect');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const confirm = document.getElementById('confirm');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const itemForm = document.getElementById('itemForm');
const itemIdInput = document.getElementById('itemId');
const itemNameInput = document.getElementById('itemName');
const itemDescInput = document.getElementById('itemDescription');
const itemQtyInput = document.getElementById('itemQuantity');
const modalTitle = document.getElementById('modalTitle');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const confirmText = document.getElementById('confirmText');
const exportCsvBtn = document.getElementById('exportCsv');
const notification = document.getElementById('notification');
const totalItemsEl = document.getElementById('totalItems');
const lowStockEl = document.getElementById('lowStock');
const outStockEl = document.getElementById('outStock');
const itemsCountEl = document.getElementById('itemsCount');
const currentDateEl = document.getElementById('currentDate');

let items = [];
let deletingId = null;

// Update current date and time
function updateCurrentDateTime() {
    if (currentDateEl) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
            timeZoneName: 'short'
        };
        currentDateEl.textContent = 'Today: ' + now.toLocaleString('en-IN', options);
    }
}

// Update stats
function updateStats() {
    const total = items.length;
    const low = items.filter(i => i.quantity > 0 && i.quantity <= 5).length;
    const out = items.filter(i => i.quantity === 0).length;

    totalItemsEl.textContent = total;
    lowStockEl.textContent = low;
    outStockEl.textContent = out;
    itemsCountEl.textContent = `${total} items`;
}

async function load() {
    try {
        const response = await fetch(`${API_BASE}/items/localstorage`);
        if (response.ok) {
            const raw = await response.text();
            if (raw && raw !== "[]") {
                try {
                    items = JSON.parse(raw);
                    showNotification('Data loaded from server');
                    localStorage.setItem(STORAGE_KEY, raw); // Local backup
                    render();
                    updateStats();
                    return;
                } catch (e) {
                    console.error('Parse error:', e);
                }
            }
        } else {
            console.error('Server load failed with status:', response.status);
        }
    } catch (error) {
        console.error('Server load error:', error);
    }

    // Fallback to localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            items = JSON.parse(raw);
        } catch (e) {
            console.error('Local storage parse error:', e);
            items = [];
        }
    } else {
        // Seed sample data
        items = [
            { id: 1, name: 'Nitrile Gloves', description: 'Box of 100 disposable gloves', quantity: 12 },
            { id: 2, name: 'Dental Syringes', description: '5ml plastic syringes', quantity: 3 },
            { id: 3, name: 'Local Anesthetic', description: 'Lidocaine 2% cartridges', quantity: 0 },
            { id: 4, name: 'Surgical Masks', description: 'Box of 50 level 3 masks', quantity: 24 }
        ];
        save();
    }
    render();
    updateStats();
}

async function save() {
    try {
        console.log('Saving items to server:', items);
        const response = await fetch(`${API_BASE}/items/localstorage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });
        if (response.ok) {
            const updatedItems = await response.text();
            items = JSON.parse(updatedItems);
            localStorage.setItem(STORAGE_KEY, updatedItems); // Update local backup
            showNotification('Data synced with server');
        } else {
            console.error('Save failed with status:', response.status);
            showNotification('Failed to sync with server, saved locally', true);
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Error syncing with server, saved locally', true);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); // Local backup
    updateStats();
}

async function forceRefresh() {
    await load();
    render();
    showNotification('Data refreshed');
}

async function deleteFromServer(id) {
    try {
        const response = await fetch(`${API_BASE}/items/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Delete error:', error);
        return false;
    }
}

function formatRow(it) {
    const qty = it.quantity;
    const low = qty <= 5 && qty > 0;
    const out = qty === 0;
    const badgeClass = out ? 'out' : low ? 'low' : 'ok';
    const badgeText = out ? 'Out' : low ? 'Low' : 'OK';
    const badgeIcon = out ? '<i class="fas fa-times"></i>' : low ? '<i class="fas fa-exclamation"></i>' : '<i class="fas fa-check"></i>';

    return `
    <tr data-id="${it.id}">
      <td><div class="cell-icon"><i class="fas fa-hashtag"></i></div>${it.id}</td>
      <td>
        <div class="item-preview">
          <div class="item-info">
            <strong>${escapeHtml(it.name)}</strong>
          </div>
        </div>
      </td>
      <td>${escapeHtml(it.description || '')}</td>
      <td>
        <div class="quantity-cell">
          <span class="qty-number">${qty}</span>
          <span class="badge ${badgeClass}">${badgeIcon} ${badgeText}</span>
        </div>
      </td>
      <td>
        <button class="btn small primary edit" data-id="${it.id}" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn small danger del" data-id="${it.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showNotification(message, isError = false) {
    if (notification) {
        notification.textContent = message;
        notification.className = 'notification' + (isError ? ' error' : '');
        notification.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
        notification.style.color = isError ? '#721c24' : '#155724';
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 5000);
    }
}

function render() {
    const q = (searchInput.value || '').trim().toLowerCase();
    let list = items.slice();

    // Filter view
    const vf = viewFilter.value;
    if (vf === 'low') list = list.filter(i => i.quantity > 0 && i.quantity <= 5);
    if (vf === 'out') list = list.filter(i => i.quantity === 0);

    // Search
    if (q) {
        list = list.filter(i =>
            String(i.id).includes(q) ||
            (i.name || '').toLowerCase().includes(q) ||
            (i.description || '').toLowerCase().includes(q)
        );
    }

    // Sort
    const [col, dir] = sortSelect.value.split(':');
    list.sort((a, b) => {
        let av, bv;
        if (col === 'qty') {
            av = a.quantity;
            bv = b.quantity;
            return dir === 'asc' ? av - bv : bv - av;
        } else if (col === 'name') {
            av = (a.name || '').toLowerCase();
            bv = (b.name || '').toLowerCase();
            if (av < bv) return dir === 'asc' ? -1 : 1;
            if (av > bv) return dir === 'asc' ? 1 : -1;
            return 0;
        } else {
            av = Number(a[col] || 0);
            bv = Number(b[col] || 0);
            return dir === 'asc' ? av - bv : bv - av;
        }
    });

    // Render
    itemsBody.innerHTML = list.map(formatRow).join('');
    document.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            openEdit(id);
        });
    });
    document.querySelectorAll('.del').forEach(btn => {
        btn.addEventListener('click', () => {
            deletingId = Number(btn.dataset.id);
            const it = items.find(x => x.id === deletingId);
            if (it && it.quantity !== 0) {
                showNotification(`ERROR: Cannot delete "${it.name}" - Stock must be 0`, true);
                deletingId = null;
                return;
            }
            confirmText.innerText = `Delete "${it ? it.name : `#${deletingId}`}"? This cannot be undone.`;
            confirm.classList.remove('hidden');
        });
    });
}

function nextId() {
    return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

function openAdd() {
    itemIdInput.value = '';
    itemNameInput.value = '';
    itemDescInput.value = '';
    itemQtyInput.value = 0;
    modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Item';
    modal.classList.remove('hidden');
    itemNameInput.focus();
}

function openEdit(id) {
    const it = items.find(x => x.id === id);
    if (!it) return showNotification('Item not found', true);

    itemIdInput.value = it.id;
    itemNameInput.value = it.name;
    itemDescInput.value = it.description || '';
    itemQtyInput.value = it.quantity;
    modalTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Item`;
    modal.classList.remove('hidden');
    itemNameInput.focus();
}

function closeModalFn() {
    modal.classList.add('hidden');
    itemForm.reset();
}

async function addOrUpdate(e) {
    e.preventDefault();
    const idVal = itemIdInput.value;
    const name = itemNameInput.value.trim();
    const desc = itemDescInput.value.trim();
    const qty = Math.max(0, Number(itemQtyInput.value || 0));

    if (!name) {
        showNotification('Name is required', true);
        return;
    }

    if (idVal) {
        const id = Number(idVal);
        const idx = items.findIndex(i => i.id === id);
        if (idx >= 0) {
            items[idx].name = name;
            items[idx].description = desc;
            items[idx].quantity = qty;
        } else {
            showNotification('Item not found', true);
            return;
        }
    } else {
        const newItem = {
            id: nextId(),
            name,
            description: desc,
            quantity: qty
        };
        items.push(newItem);
    }
    await save();
    render();
    closeModalFn();
    showNotification(idVal ? 'Item updated successfully' : 'Item added successfully');
}

async function confirmDelete() {
    if (deletingId == null) return;
    const it = items.find(i => i.id === deletingId);

    if (it && it.quantity !== 0) {
        showNotification(`ERROR: Cannot delete "${it.name}" - Stock must be 0`, true);
        deletingId = null;
        confirm.classList.add('hidden');
        return;
    }

    const serverDeleted = await deleteFromServer(deletingId);

    if (serverDeleted) {
        items = items.filter(i => i.id !== deletingId);
        await save();
        await forceRefresh();
        showNotification('Item deleted successfully');
    } else {
        items = items.filter(i => i.id !== deletingId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        showNotification('Item deleted from local storage (server unavailable)');
    }

    deletingId = null;
    render();
    confirm.classList.add('hidden');
}

async function exportCsv() {
    if (!items.length) return showNotification('No items to export', true);

    try {
        const response = await fetch(`${API_BASE}/items/export/csv`);
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('CSV exported successfully');
            return;
        }
    } catch (error) {
        console.error('Backend export failed, using client fallback');
    }

    const rows = [
        ['id', 'name', 'description', 'quantity'],
        ...items.map(i => [i.id, i.name, i.description, i.quantity])
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('CSV exported successfully (client fallback)');
}

function closeConfirm() {
    confirm.classList.add('hidden');
    deletingId = null;
}

// Events
addBtn.addEventListener('click', openAdd);
closeModal.addEventListener('click', closeModalFn);
cancelModal.addEventListener('click', closeModalFn);
itemForm.addEventListener('submit', addOrUpdate);
confirmYes.addEventListener('click', confirmDelete);
confirmNo.addEventListener('click', closeConfirm);
searchInput.addEventListener('input', render);
viewFilter.addEventListener('change', render);
sortSelect.addEventListener('change', render);
exportCsvBtn.addEventListener('click', exportCsv);

modal.addEventListener('click', (e) => { if (e.target === modal) closeModalFn(); });
confirm.addEventListener('click', (e) => { if (e.target === confirm) closeConfirm(); });

// Initialize date and time
updateCurrentDateTime();
setInterval(updateCurrentDateTime, 60000);

// Init
load();
