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
let selectedCommonItem = null;
let searchQuickItemsInput = null;

// Common dental items with local image paths
const commonItems = [
    {
        name: 'Nitrile Gloves',
        description: 'Box of 100 disposable gloves',
        image: '/images/gloves.jpg'
    },
    {
        name: 'Endodontic Files',
        description: 'Sterile root canal files',
        image: '/images/Sterile root canal files.jpg'
    },
    {
        name: 'Composites',
        description: 'Dental filling materials',
        image: '/images/Dental filling materials.jpg'
    },
    {
        name: 'Addition Silicones',
        description: 'Impression materials',
        image: '/images/Impression materials.png'
    },
    {
        name: 'Turbines & Couplings',
        description: 'High-speed handpieces',
        image: '/images/High-speed handpieces.png'
    },
    {
        name: 'Interdental Brushes',
        description: 'Pack of interdental cleaners',
        image: '/images/Pack of interdental cleaners.png'
    },
    {
        name: 'Dental Anesthetic',
        description: 'Local anesthetic cartridges',
        image: '/images/Local anesthetic cartridges.png'
    },
    {
        name: 'Surgical Masks',
        description: 'Box of 50 level 3 masks',
        image: '/images/Box of 50 level 3 masks.png'
    },
    {
        name: 'Dental Syringes',
        description: '5ml plastic syringes',
        image: '/images/5ml plastic syringes.png'
    },
    {
        name: 'Curing Light',
        description: 'LED dental curing light',
        image: '/images/LED dental curing light.png'
    },
    {
        name: 'Dental Cement',
        description: 'Permanent dental cement',
        image: '/images/Permanent dental cement.png'
    },
    {
        name: 'X-Ray Films',
        description: 'Dental X-ray film packets',
        image: '/images/Dental X-ray film packets.png'
    },
    {
        name: 'Cotton Rolls',
        description: 'Sterile cotton rolls',
        image: '/images/Sterile cotton rolls.png'
    },
    {
        name: 'Dental Floss',
        description: 'Waxed dental floss',
        image: '/images/Waxed dental floss.png'
    },
    {
        name: 'Mouth Mirrors',
        description: 'Disposable mouth mirrors',
        image: '/images/Disposable mouth mirrors.png'
    },
    {
        name: 'Prophy Angles',
        description: 'Dental prophy angles',
        image: '/images/Dental prophy angles.png'
    },
];

// Function to check if an item is common
function isCommonItem(itemName) {
    return commonItems.some(commonItem =>
        commonItem.name.toLowerCase() === itemName.toLowerCase()
    );
}

// Initialize quick add section with search
function initQuickAdd() {
    const itemsScroll = document.querySelector('.items-scroll');
    searchQuickItemsInput = document.getElementById('searchQuickItems');

    if (!itemsScroll) {
        console.error('Items scroll container not found');
        return;
    }

    // Add event listener for search input
    if (searchQuickItemsInput) {
        searchQuickItemsInput.addEventListener('input', filterQuickAddItems);
        searchQuickItemsInput.addEventListener('focus', function() {
            this.select();
        });
    }

    // Initial render of all items
    renderQuickAddItems(commonItems);
}

// Function to filter quick add items based on search
function filterQuickAddItems() {
    const searchTerm = searchQuickItemsInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        // Show all items if search is empty
        renderQuickAddItems(commonItems);
    } else {
        // Filter items based on search term
        const filteredItems = commonItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
        renderQuickAddItems(filteredItems);
    }
}

// Function to render quick add items
function renderQuickAddItems(itemsToRender) {
    const itemsScroll = document.querySelector('.items-scroll');

    if (!itemsScroll) return;

    // Clear existing content
    itemsScroll.innerHTML = '';

    if (itemsToRender.length === 0) {
        // Show message when no items match search
        itemsScroll.innerHTML = `
            <div class="no-items-message">
                <i class="fas fa-search"></i>
                <p>No dental supplies found matching your search</p>
            </div>
        `;
        return;
    }

    itemsToRender.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="add-icon"><i class="fas fa-plus"></i></div>
            <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTIiIGZpbGw9IiM2MzY2RjEiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5EZW50YWw8L3RleHQ+Cjwvc3ZnPgo='">
            <p class="item-name">${item.name}</p>
        `;

        itemCard.addEventListener('click', () => {
            // Remove selection from other cards
            document.querySelectorAll('.item-card').forEach(card => {
                card.classList.remove('selected');
            });

            // Select current card
            itemCard.classList.add('selected');
            selectedCommonItem = item;

            // Auto-fill the modal form
            openAddWithItem(item);

            // Clear search after selection
            if (searchQuickItemsInput) {
                searchQuickItemsInput.value = '';
                // Restore all items
                renderQuickAddItems(commonItems);
            }
        });

        itemsScroll.appendChild(itemCard);
    });
}

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

// Open add modal with pre-filled common item
function openAddWithItem(item) {
    itemIdInput.value = '';
    itemNameInput.value = item.name;
    itemDescInput.value = item.description;
    itemQtyInput.value = 0;

    // Make name field read-only for common items
    itemNameInput.setAttribute('readonly', 'true');

    modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Item';
    modal.classList.remove('hidden');
    itemDescInput.focus(); // Focus on description instead of name
}

async function load() {
    try {
        const response = await fetch(`${API_BASE}/items/localstorage`);
        if (response.ok) {
            const raw = await response.text();
            if (raw && raw !== "[]") {
                try {
                    items = JSON.parse(raw);

                    // Add images to items that match common items
                    items.forEach(item => {
                        if (!item.image) {
                            const commonItem = commonItems.find(ci =>
                                ci.name.toLowerCase() === item.name.toLowerCase()
                            );
                            if (commonItem) {
                                item.image = commonItem.image;
                            }
                        }
                    });

                    showNotification('Data loaded from server');
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

            // Add images to existing items
            items.forEach(item => {
                if (!item.image) {
                    const commonItem = commonItems.find(ci =>
                        ci.name.toLowerCase() === item.name.toLowerCase()
                    );
                    if (commonItem) {
                        item.image = commonItem.image;
                    }
                }
            });

        } catch (e) {
            console.error('Local storage parse error:', e);
            items = []; // Start with empty array if parse fails
        }
    } else {
        // NO SAMPLE DATA - Start with empty inventory
        items = [];

        // Optional: Show message for empty inventory
        console.log('Starting with empty inventory');
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

    const itemImage = it.image ?
        `<img src="${it.image}" alt="${it.name}" class="item-table-image">` :
        '<div class="item-table-icon"><i class="fas fa-box"></i></div>';

    return `
    <tr data-id="${it.id}">
      <td><div class="cell-icon"><i class="fas fa-hashtag"></i></div>${it.id}</td>
      <td>
        <div class="item-preview">
          ${itemImage}
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

    // Ensure name field is not read-only for regular add
    itemNameInput.removeAttribute('readonly');

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

    // Make name field read-only if it's a common item
    if (isCommonItem(it.name)) {
        itemNameInput.setAttribute('readonly', 'true');
    } else {
        itemNameInput.removeAttribute('readonly');
    }

    modalTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Item`;
    modal.classList.remove('hidden');
    itemNameInput.focus();
}

function closeModalFn() {
    modal.classList.add('hidden');
    itemForm.reset();
    selectedCommonItem = null;

    // Always remove readonly when closing modal
    itemNameInput.removeAttribute('readonly');

    document.querySelectorAll('.item-card').forEach(card => {
        card.classList.remove('selected');
    });
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

    // Enhanced quantity validation - ONLY SHOW ERRORS WHEN LIMITS ARE BROKEN
    const MAX_QUANTITY = 10000;
    const MIN_QUANTITY = 0;

    if (qty < MIN_QUANTITY) {
        showNotification('Quantity cannot be negative', true);
        return;
    }

    if (qty > MAX_QUANTITY) {
        showNotification(`Quantity cannot exceed ${MAX_QUANTITY}`, true);
        return;
    }

    // STRICT duplicate prevention
    const existingItem = items.find(item =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== Number(idVal)
    );

    if (existingItem && !idVal) {
        showNotification(
            `"${name}" already exists in inventory (ID: ${existingItem.id}).\n` +
            `Please edit the existing item instead of creating a duplicate.`,
            true
        );

        // Optional: Auto-scroll to existing item in table
        const existingRow = document.querySelector(`tr[data-id="${existingItem.id}"]`);
        if (existingRow) {
            existingRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            existingRow.style.animation = 'pulse 2s';
            setTimeout(() => existingRow.style.animation = '', 2000);
        }

        return;
    }

    // Check if this is from a common item (has image)
    const itemImage = selectedCommonItem ? selectedCommonItem.image : null;

    if (idVal) {
        // Update existing item
        const id = Number(idVal);
        const idx = items.findIndex(i => i.id === id);
        if (idx >= 0) {
            items[idx].name = name;
            items[idx].description = desc;
            items[idx].quantity = qty;
            if (itemImage && !items[idx].image) {
                items[idx].image = itemImage;
            }
        } else {
            showNotification('Item not found', true);
            return;
        }
    } else {
        // Add new item
        const newItem = {
            id: nextId(),
            name,
            description: desc,
            quantity: qty
        };

        if (itemImage) {
            newItem.image = itemImage;
        }

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

// Initialize quick add functionality
document.addEventListener('DOMContentLoaded', function() {
    initQuickAdd();
});

// Initialize date and time
updateCurrentDateTime();
setInterval(updateCurrentDateTime, 60000);

// Init
load();
// ===== LOGOUT FUNCTIONALITY =====

// DOM refs for logout
const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const logoutCancel = document.getElementById('logoutCancel');
const logoutConfirm = document.getElementById('logoutConfirm');

// Logout confirmation function
function openLogoutConfirmation() {
    console.log('🔄 Opening logout confirmation...');
    logoutModal.classList.remove('hidden');

    // Add escape key listener
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeLogoutModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Close logout modal
function closeLogoutModal() {
    console.log('🔒 Closing logout modal...');
    logoutModal.classList.add('hidden');
}

// Perform logout
async function performLogout() {
    try {
        console.log('🚪 Starting logout process...');

        // Show loading state
        logoutConfirm.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutConfirm.disabled = true;

        // Simulate API call for cleanup (if you have authentication)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Clear local storage (optional - based on your needs)
        localStorage.removeItem('supplier_inventory_v1');

        // Show success message
        showNotification('👋 Successfully logged out! Redirecting...', false);

        // Simulate redirect (in real app, this would redirect to login page)
        setTimeout(() => {
            console.log('✅ Logout completed successfully');

            // In a real application, you would redirect to login page:
            // window.location.href = '/login';

            // For demo purposes, just reload the page
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error('❌ Logout error:', error);
        showNotification('Failed to logout properly. Please try again.', true);

        // Reset button state
        logoutConfirm.innerHTML = '<i class="fas fa-sign-out-alt"></i> Yes, Logout';
        logoutConfirm.disabled = false;
    }
}

// Event Listeners for Logout
logoutBtn.addEventListener('click', openLogoutConfirmation);
logoutCancel.addEventListener('click', closeLogoutModal);
logoutConfirm.addEventListener('click', performLogout);

// Close modal when clicking outside
logoutModal.addEventListener('click', (e) => {
    if (e.target === logoutModal) {
        closeLogoutModal();
    }
});

// Keyboard navigation for logout modal
document.addEventListener('keydown', (e) => {
    if (!logoutModal.classList.contains('hidden')) {
        if (e.key === 'Escape') {
            closeLogoutModal();
        }
        if (e.key === 'Enter' && document.activeElement !== logoutCancel) {
            performLogout();
        }
    }
});
