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
const weekSelect = document.getElementById('weekSelect');

let items = [];
let deletingId = null;

// Generate week options for the dropdown
function generateWeekOptions() {
    const weeks = [];
    const now = new Date();
    // Generate 12 weeks (3 months) of options
    for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        const weekLabel = `Week ${date.getWeek()}, ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        const weekKey = `W${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
        weeks.push({ label: weekLabel, value: weekKey });
    }
    weeks.reverse(); // Most recent first
    return weeks;
}

// Extension for Date prototype
Date.prototype.getWeek = function() {
    const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
    const pastDaysOfYear = (this - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Updated load() - Now from backend
async function load() {
    try {
        const response = await fetch(`${API_BASE}/items/localstorage`);
        if (response.ok) {
            const raw = await response.text();
            if (raw && raw !== "[]") {
                try {
                    items = JSON.parse(raw).map(item => ({
                        ...item,
                        weeklyQuantities: item.weeklyQuantities || []
                    }));
                    showNotification('Data loaded from server');
                    localStorage.setItem(STORAGE_KEY, raw); // Local backup
                    return;
                } catch(e) {
                    console.error('Parse error:', e);
                }
            }
        }
    } catch (error) {
        console.error('Server load error:', error);
    }

    // Fallback to localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            items = JSON.parse(raw).map(item => ({
                ...item,
                weeklyQuantities: item.weeklyQuantities || []
            }));
        } catch(e) { items = [] }
    } else {
        // Seed sample data
        const now = new Date();
        const currentWeekKey = `W${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.ceil((now.getDate() + now.getDay()) / 7)}`;

        items = [
            {
                id: 1,
                name: 'Gloves',
                description: 'Disposable nitrile gloves',
                quantity: 12,
                weeklyQuantities: [
                    { week: currentWeekKey, quantity: 12 },
                    { week: 'W2024-08-35', quantity: 15 }
                ]
            },
            {
                id: 2,
                name: 'Syringes',
                description: 'Dental syringes 5ml',
                quantity: 3,
                weeklyQuantities: [
                    { week: currentWeekKey, quantity: 3 },
                    { week: 'W2024-08-34', quantity: 8 }
                ]
            },
            {
                id: 3,
                name: 'Anesthetics',
                description: 'Local anesthetic vials',
                quantity: 0,
                weeklyQuantities: [
                    { week: currentWeekKey, quantity: 0 }
                ]
            },
            {
                id: 4,
                name: 'Mask',
                description: 'Surgical masks (box)',
                quantity: 24,
                weeklyQuantities: [
                    { week: currentWeekKey, quantity: 24 },
                    { week: 'W2024-08-35', quantity: 20 }
                ]
            }
        ];
        save();
    }
}

// Updated save() - Now to backend
async function save() {
    try {
        const response = await fetch(`${API_BASE}/items/localstorage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });
        if (response.ok) {
            showNotification('Data synced with server');
        }
    } catch (error) {
        console.error('Save error:', error);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); // Local backup
}

// NEW: Delete from backend function
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

function getCurrentWeekQuantity(item) {
    const currentWeek = weekSelect.value;
    const weeklyEntry = item.weeklyQuantities.find(w => w.week === currentWeek);
    return weeklyEntry ? weeklyEntry.quantity : item.quantity;
}

function formatRow(it) {
    const currentQty = getCurrentWeekQuantity(it);
    const low = currentQty <= 5 && currentQty > 0;
    const out = currentQty === 0;

    return `
    <tr data-id="${it.id}">
      <td>${it.id}</td>
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.description || '')}</td>
      <td>
        ${currentQty}
        ${out ? `<span class="badge low" title="Out of stock">Out</span>` : (low ? `<span class="badge low" title="Low stock">&nbsp;Low&nbsp;</span>` : `<span class="badge ok">OK</span>`)}
      </td>
      <td>
        <button class="btn small edit" data-id="${it.id}">Edit</button>
        <button class="btn small danger del" data-id="${it.id}">Delete</button>
      </td>
    </tr>
  `;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#039;');
}

function showNotification(message, isError = false) {
    if (notification) {
        notification.textContent = message;
        notification.className = 'notification' + (isError ? ' error' : '');
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 5000);
    }
}

function render() {
    // apply search and filter
    const q = (searchInput.value || '').trim().toLowerCase();
    let list = items.slice();

    // filter view
    const vf = viewFilter.value;
    if (vf === 'low') list = list.filter(i => {
        const qty = getCurrentWeekQuantity(i);
        return qty > 0 && qty <= 5;
    });
    if (vf === 'out') list = list.filter(i => getCurrentWeekQuantity(i) === 0);

    // search
    if (q) {
        list = list.filter(i =>
            String(i.id).includes(q) ||
            (i.name || '').toLowerCase().includes(q) ||
            (i.description || '').toLowerCase().includes(q)
        );
    }

    // sort
    const [col,dir] = sortSelect.value.split(':');
    list.sort((a,b) => {
        let av, bv;
        if (col === 'qty') {
            av = getCurrentWeekQuantity(a);
            bv = getCurrentWeekQuantity(b);
            return dir==='asc' ? av-bv : bv-av;
        } else if (col === 'name') {
            av = (a.name || '').toLowerCase();
            bv = (b.name || '').toLowerCase();
            if (av < bv) return dir==='asc' ? -1 : 1;
            if (av > bv) return dir==='asc' ? 1 : -1;
            return 0;
        } else {
            av = Number(a[col]||0); bv = Number(b[col]||0);
            return dir==='asc' ? av-bv : bv-av;
        }
    });

    // render
    itemsBody.innerHTML = list.map(formatRow).join('');
    // attach events for edit/delete
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
            if (it && getCurrentWeekQuantity(it) !== 0) {
                // ❌ prevent delete if stock not zero
                showNotification(`ERROR: Cannot delete "${it.name}" - Current week stock must be 0`, true);
                deletingId = null;
                return;
            }
            confirmText.innerText = `Delete item #${deletingId}? This cannot be undone.`;
            confirm.classList.remove('hidden');
        });
    });
}

// CRUD operations
function nextId() {
    return items.length ? Math.max(...items.map(i=>i.id)) + 1 : 1;
}

function openAdd() {
    itemIdInput.value = '';
    itemNameInput.value = '';
    itemDescInput.value = '';
    itemQtyInput.value = 0;
    modalTitle.innerText = 'Add Item';
    modal.classList.remove('hidden');
    itemNameInput.focus();
}

function openEdit(id) {
    const it = items.find(x => x.id === id);
    if (!it) return showNotification('Item not found', true);

    itemIdInput.value = it.id;
    itemNameInput.value = it.name;
    itemDescInput.value = it.description || '';
    itemQtyInput.value = getCurrentWeekQuantity(it);
    modalTitle.innerText = `Edit Item - Week: ${weekSelect.options[weekSelect.selectedIndex].text}`;
    modal.classList.remove('hidden');
    itemNameInput.focus();
}

function closeModalFn() {
    modal.classList.add('hidden');
}

function addOrUpdate(e) {
    e.preventDefault();
    const idVal = itemIdInput.value;
    const name = itemNameInput.value.trim();
    const desc = itemDescInput.value.trim();
    const qty = Math.max(0, Number(itemQtyInput.value || 0));
    const currentWeek = weekSelect.value;

    if (!name) { showNotification('Name is required', true); return; }

    if (idVal) {
        const id = Number(idVal);
        const idx = items.findIndex(i => i.id === id);
        if (idx >= 0) {
            items[idx].name = name;
            items[idx].description = desc;

            // Update weekly quantity
            const existingWeek = items[idx].weeklyQuantities.find(w => w.week === currentWeek);
            if (existingWeek) {
                existingWeek.quantity = qty;
            } else {
                items[idx].weeklyQuantities.push({ week: currentWeek, quantity: qty });
            }

            // Update total quantity if current week
            if (currentWeek === generateWeekOptions()[0].value) {
                items[idx].quantity = qty;
            }
        }
    } else {
        const newItem = {
            id: nextId(),
            name,
            description: desc,
            quantity: qty,
            weeklyQuantities: [{ week: currentWeek, quantity: qty }]
        };
        items.push(newItem);
    }
    save(); // Now saves to backend
    render();
    closeModalFn();
    showNotification(idVal ? 'Item updated successfully' : 'Item added successfully');
}

// UPDATED: Delete confirm handlers - Now calls backend
async function confirmDelete() {
    if (deletingId == null) return;
    const it = items.find(i => i.id === deletingId);

    // ✅ Validation: only allow delete if stock == 0
    if (it && getCurrentWeekQuantity(it) !== 0) {
        showNotification(`ERROR: Cannot delete "${it.name}" - Current week stock must be 0`, true);
        deletingId = null;
        confirm.classList.add('hidden');
        return;
    }

    // Try to delete from server first
    const serverDeleted = await deleteFromServer(deletingId);

    if (serverDeleted) {
        // Remove from local data
        items = items.filter(i => i.id !== deletingId);
        showNotification('Item deleted successfully');
    } else {
        // Fallback to localStorage only
        items = items.filter(i => i.id !== deletingId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        showNotification('Item deleted from local storage (server unavailable)');
    }

    deletingId = null;
    render();
    confirm.classList.add('hidden');
}

// Export CSV - Hybrid: Prefer backend, fallback to client
async function exportCsv() {
    if (!items.length) return showNotification('No items to export', true);

    try {
        const currentWeek = weekSelect.value;
        const response = await fetch(`${API_BASE}/items/export/csv?week=${currentWeek}`);

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_${currentWeek}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('CSV exported successfully');
            return;
        }
    } catch (error) {
        console.error('Backend export failed, using client fallback');
    }

    // Fallback to original client-side export
    const currentWeek = weekSelect.value;
    const rows = [
        ['id','name','description','quantity','week'],
        ...items.map(i => {
            const weeklyQty = getCurrentWeekQuantity(i);
            return [i.id, i.name, i.description, weeklyQty, currentWeek];
        })
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory_${currentWeek}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('CSV exported successfully (client fallback)');
}

// small helpers to close confirm modal
function closeConfirm() { confirm.classList.add('hidden'); deletingId = null; }

// Events
addBtn.addEventListener('click', openAdd);
closeModal.addEventListener('click', closeModalFn);
cancelModal.addEventListener('click', closeModalFn);
itemForm.addEventListener('submit', addOrUpdate);
confirmYes.addEventListener('click', () => { confirmDelete(); });
confirmNo.addEventListener('click', closeConfirm);
searchInput.addEventListener('input', render);
viewFilter.addEventListener('change', render);
sortSelect.addEventListener('change', render);
weekSelect.addEventListener('change', render);
exportCsvBtn.addEventListener('click', exportCsv);

// close modal on overlay click
modal.addEventListener('click', (e) => { if (e.target === modal) closeModalFn(); });
confirm.addEventListener('click', (e) => { if (e.target === confirm) closeConfirm(); });

// Initialize week dropdown
function initWeekSelect() {
    const weeks = generateWeekOptions();
    weekSelect.innerHTML = weeks.map(week =>
        `<option value="${week.value}" ${week.value === weeks[0].value ? 'selected' : ''}>${week.label}</option>`
    ).join('');
}

// init
load();
initWeekSelect();
render();