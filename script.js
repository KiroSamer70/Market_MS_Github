// Global variables to store the data
let stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];
let hallItems = JSON.parse(localStorage.getItem('hallItems')) || [];
let soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];
let todaySoldCount = 0;

// DOM Elements
const stockTableBody = document.getElementById('stockTableBody');
const hallTableBody = document.getElementById('hallTableBody');
const totalStockItemsEl = document.getElementById('totalStockItems');
const totalHallItemsEl = document.getElementById('totalHallItems');
const itemsSoldTodayEl = document.getElementById('itemsSoldToday');
const stockSection = document.querySelector('.stock-section');

// Modal elements
const addStockModal = document.getElementById('addStockModal');
const transferModal = document.getElementById('transferModal');
const sellModal = document.getElementById('sellModal');
const returnToStockModal = document.getElementById('returnToStockModal');
const increaseStockModal = document.getElementById('increaseStockModal');

// Form elements
const addStockForm = document.getElementById('addStockForm');
const transferForm = document.getElementById('transferForm');
const sellForm = document.getElementById('sellForm');
const returnToStockForm = document.getElementById('returnToStockForm');
const increaseStockForm = document.getElementById('increaseStockForm');

// Button elements
const addStockBtn = document.getElementById('addStockBtn');

// Close buttons
const closeButtons = document.querySelectorAll('.close');

// Loading element
const loadingScreen = document.querySelector('.loading');

// Particles container
const particlesContainer = document.getElementById('particles');

// Crystal neon colors for particles
const crystalColors = [
    '#00e1ff', // neon blue
    '#b300ff', // neon purple
    '#ff00e6', // neon pink
    '#00ffa3', // neon green
    '#ff5ed3'  // neon rose
];

// Initialize the application
function init() {
    // Show loading screen for at least 1.5 seconds
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
    
    setupParticles();
    renderStockTable();
    renderHallTable();
    updateStatistics();
    setupEventListeners();
    calculateTodaySoldItems();
    addGlassEffectListeners();
}

// Setup floating particles in the background with reduced count for better performance
function setupParticles() {
    // Clear any existing particles first
    particlesContainer.innerHTML = '';
    
    // Reduced particle count for better performance
    const particleCount = window.innerWidth < 768 ? 20 : 35;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
}

// Create a single particle element with optimized animation
function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random size between 2px and 6px (reduced from 8px for better performance)
    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Random opacity - reduced opacity range for subtlety
    particle.style.opacity = Math.random() * 0.2 + 0.1;
    
    // Random color from crystal neon palette
    const colorIndex = Math.floor(Math.random() * crystalColors.length);
    particle.style.backgroundColor = crystalColors[colorIndex];
    
    // Smaller box shadow for better performance
    particle.style.boxShadow = `0 0 ${Math.floor(size/2)}px ${crystalColors[colorIndex]}`;
    
    // Add transition for smoother movement
    particle.style.transition = 'transform 15s ease-in-out, opacity 3s ease-in-out';
    
    // Random float animation
    const floatX = (Math.random() - 0.5) * 20;
    const floatY = (Math.random() - 0.5) * 20;
    const duration = 15 + Math.random() * 10;
    
    // Use CSS transform for smoother animation (better performance than JS animation)
    particle.style.animation = `float ${duration}s infinite alternate ease-in-out`;
    
    // Add custom keyframe animation
    const styleSheet = document.styleSheets[0];
    const keyframesName = `float-${Math.floor(Math.random() * 1000)}`;
    
    try {
        const keyframes = `@keyframes ${keyframesName} {
            0% { transform: translate(0, 0); }
            50% { transform: translate(${floatX}px, ${floatY}px); }
            100% { transform: translate(${-floatX/2}px, ${-floatY/2}px); }
        }`;
        
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
        particle.style.animation = `${keyframesName} ${duration}s infinite alternate ease-in-out`;
    } catch (err) {
        // Fallback if adding custom keyframes fails
        particle.style.animation = 'none';
    }
    
    // Add to container
    particlesContainer.appendChild(particle);
}

// Add glass effect animation when interacting with elements - with performance optimizations
function addGlassEffectListeners() {
    // Target only the most important interactive elements for performance
    const interactiveElements = document.querySelectorAll('.btn, .section');
    
    interactiveElements.forEach(element => {
        // Mouse move effect with debounce
        element.addEventListener('mousemove', debounce(function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create highlight effect that follows cursor
            this.style.background = `
                radial-gradient(
                    circle at ${x}px ${y}px, 
                    rgba(255, 255, 255, 0.15) 0%, 
                    rgba(255, 255, 255, 0.05) 15%, 
                    transparent 60%
                ), 
                ${this.style.background}`;
        }, 30)); // 30ms debounce for better performance
        
        // Reset on mouse leave
        element.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
}

// Initialize animations for sections
function initAnimations() {
    const sections = document.querySelectorAll('.section, .statistics-section');
    
    // Simple reveal animation for sections as they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.classList.add('to-reveal');
        observer.observe(section);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add stock button
    addStockBtn.addEventListener('click', () => openModal(addStockModal));
    
    // Add to hall button (open modal for a stock item selection)
    document.getElementById('addToHallBtn').addEventListener('click', () => {
        if (stockItems.length === 0) {
            showToast('<i class="fas fa-exclamation-triangle"></i> No stock items available to transfer', 'error');
        } else {
            // Show toast with hint
            showToast('<i class="fas fa-info-circle"></i> Please select a stock item to transfer by clicking the Transfer button', 'info');
        }
    });
    
    // Close buttons for modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Window click to close modals
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Form submissions
    addStockForm.addEventListener('submit', handleAddStock);
    transferForm.addEventListener('submit', handleTransferToHall);
    sellForm.addEventListener('submit', handleSellProduct);
    returnToStockForm.addEventListener('submit', handleReturnToStock);
    increaseStockForm.addEventListener('submit', handleIncreaseStock);
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: block"]');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
    
    // Window resize event for equalizing table widths
    window.addEventListener('resize', debounce(function() {
        equalizeTableContainers();
    }, 250));
}

// Debounce function to prevent excessive function calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to check for low stock items
function checkLowStock() {
    const lowStockThreshold = 10;
    const lowStockItems = [];
    
    // Check stock items
    stockItems.forEach(item => {
        if (item.amount <= lowStockThreshold) {
            lowStockItems.push({
                name: item.name,
                amount: item.amount,
                unit: item.unit,
                location: 'stock'
            });
        }
    });
    
    // Check hall items
    hallItems.forEach(item => {
        if (item.amount <= lowStockThreshold) {
            lowStockItems.push({
                name: item.name,
                amount: item.amount,
                unit: item.unit,
                location: 'hall'
            });
        }
    });
    
    return lowStockItems;
}

// Function to show low stock alert
function showLowStockAlert(items) {
    if (items.length === 0) return;
    
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert-notification';
    
    let message = '<i class="fas fa-exclamation-triangle"></i> Low Stock Alert:<br>';
    items.forEach(item => {
        message += `• ${item.name}: ${item.amount} ${item.unit} remaining in ${item.location}<br>`;
    });
    
    alertContainer.innerHTML = message;
    document.body.appendChild(alertContainer);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertContainer.style.animation = 'slideOut 0.5s ease-out forwards';
        setTimeout(() => alertContainer.remove(), 500);
    }, 5000);
}

// Render the stock table with dynamic height
function renderStockTable() {
    stockTableBody.innerHTML = '';
    
    if (stockItems.length === 0) {
        stockTableBody.innerHTML = `<tr><td colspan="5" class="empty-table">No items in stock. Add some products!</td></tr>`;
        return;
    }
    
    // Create fragment for better performance
    const fragment = document.createDocumentFragment();
    
    stockItems.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Add low stock warning
        if (item.amount <= 10) {
            row.classList.add('low-stock');
        }
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.amount.toFixed(2)} ${item.amount <= 10 ? '<span class="low-stock-badge">Low Stock</span>' : ''}</td>
            <td>${item.unit}</td>
            <td>${new Date(item.entryDate).toLocaleDateString()}</td>
            <td class="table-action-buttons">
                <button class="action-btn action-btn-transfer transfer-btn" data-id="${index}"><i class="fas fa-arrow-right"></i> Transfer</button>
                <button class="action-btn action-btn-increase increase-btn" data-id="${index}"><i class="fas fa-plus"></i> Increase</button>
            </td>
        `;
        
        fragment.appendChild(row);
    });
    
    stockTableBody.appendChild(fragment);
    
    // Check for low stock items and show alert
    const lowStockItems = checkLowStock();
    showLowStockAlert(lowStockItems);
    
    // Add event listeners
    addStockTableEventListeners();
    
    // Equalize table heights if needed
    equalizeTableContainers();
}

// Add event listeners to stock table buttons
function addStockTableEventListeners() {
    document.querySelectorAll('.transfer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.action-btn').dataset.id;
            const item = stockItems[id];
            
            document.getElementById('transferProductId').value = id;
            document.getElementById('transferProductName').value = item.name;
            document.getElementById('availableAmount').value = `${item.amount.toFixed(2)} ${item.unit}`;
            document.getElementById('transferAmount').value = '';
            document.getElementById('transferAmount').max = item.amount;
            
            openModal(transferModal);
        });
    });
    
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.action-btn').dataset.id;
            const item = stockItems[id];
            
            document.getElementById('increaseProductId').value = id;
            document.getElementById('increaseProductName').value = item.name;
            document.getElementById('currentAmount').value = `${item.amount.toFixed(2)} ${item.unit}`;
            document.getElementById('increaseAmount').value = '';
            
            openModal(increaseStockModal);
        });
    });
}

// Render the hall table with dynamic height
function renderHallTable() {
    hallTableBody.innerHTML = '';
    
    if (hallItems.length === 0) {
        hallTableBody.innerHTML = `<tr><td colspan="5" class="empty-table">No items in hall. Transfer some from stock!</td></tr>`;
        return;
    }
    
    // Create fragment for better performance
    const fragment = document.createDocumentFragment();
    
    hallItems.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Add low stock warning
        if (item.amount <= 10) {
            row.classList.add('low-stock');
        }
        
        // For hall items, we'll use the transfer date as the entry date if it exists
        const entryDate = item.entryDate || new Date().toISOString();
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.amount.toFixed(2)} ${item.amount <= 10 ? '<span class="low-stock-badge">Low Stock</span>' : ''}</td>
            <td>${item.unit}</td>
            <td>${new Date(entryDate).toLocaleDateString()}</td>
            <td class="table-action-buttons">
                <button class="action-btn action-btn-sell sell-btn" data-id="${index}"><i class="fas fa-cash-register"></i> Sell</button>
                <button class="action-btn action-btn-return return-btn" data-id="${index}"><i class="fas fa-undo"></i> Return</button>
            </td>
        `;
        
        fragment.appendChild(row);
    });
    
    hallTableBody.appendChild(fragment);
    
    // Add fade-in animation to all rows
    const rows = hallTableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        setTimeout(() => {
            row.style.opacity = "1";
        }, index * 30);
    });
    
    // Add event listeners
    addHallTableEventListeners();
    
    // Equalize table heights if needed
    equalizeTableContainers();
}

// Add event listeners to hall table buttons
function addHallTableEventListeners() {
    document.querySelectorAll('.sell-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.action-btn').dataset.id;
            const item = hallItems[id];
            
            document.getElementById('sellProductId').value = id;
            document.getElementById('sellProductName').value = item.name;
            document.getElementById('sellAvailableAmount').value = `${item.amount.toFixed(2)} ${item.unit}`;
            document.getElementById('sellAmount').value = '';
            document.getElementById('sellAmount').max = item.amount;
            
            openModal(sellModal);
        });
    });
    
    document.querySelectorAll('.return-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.action-btn').dataset.id;
            const item = hallItems[id];
            
            document.getElementById('returnProductId').value = id;
            document.getElementById('returnProductName').value = item.name;
            document.getElementById('returnAvailableAmount').value = `${item.amount.toFixed(2)} ${item.unit}`;
            document.getElementById('returnAmount').value = '';
            document.getElementById('returnAmount').max = item.amount;
            
            openModal(returnToStockModal);
        });
    });
}

// Handle adding a new stock item
function handleAddStock(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const unit = document.getElementById('unit').value;
    
    const newItem = {
        id: generateId(),
        name,
        amount,
        unit,
        entryDate: new Date().toISOString()
    };
    
    // Add with animation
    stockItems.push(newItem);
    saveToLocalStorage();
    renderStockTable();
    updateStatistics();
    closeModal(addStockModal);
    showToast(`<i class="fas fa-check-circle"></i> Product "${name}" added to stock successfully!`, 'success');
    
    // Reset form
    addStockForm.reset();
}

// Handle increasing stock amount
function handleIncreaseStock(e) {
    e.preventDefault();
    
    const id = document.getElementById('increaseProductId').value;
    const increaseAmount = parseFloat(document.getElementById('increaseAmount').value);
    
    if (increaseAmount <= 0) {
        showToast('<i class="fas fa-exclamation-triangle"></i> Invalid amount to add', 'error');
        return;
    }
    
    const stockItem = stockItems[id];
    
    // Increase the amount
    stockItem.amount += increaseAmount;
    
    saveToLocalStorage();
    renderStockTable();
    updateStatistics();
    closeModal(increaseStockModal);
    showToast(`<i class="fas fa-plus-circle"></i> Added ${increaseAmount.toFixed(2)} ${stockItem.unit} to "${stockItem.name}" successfully!`, 'success');
}

// Handle transferring an item from stock to hall
function handleTransferToHall(e) {
    e.preventDefault();
    
    const id = document.getElementById('transferProductId').value;
    const transferAmount = parseFloat(document.getElementById('transferAmount').value);
    
    if (transferAmount <= 0 || transferAmount > stockItems[id].amount) {
        showToast('<i class="fas fa-exclamation-triangle"></i> Invalid amount to transfer', 'error');
        return;
    }
    
    const stockItem = stockItems[id];
    
    // Check if the item already exists in the hall
    const existingHallItemIndex = hallItems.findIndex(item => 
        item.name === stockItem.name && 
        item.unit === stockItem.unit
    );
    
    if (existingHallItemIndex !== -1) {
        // Update existing hall item
        hallItems[existingHallItemIndex].amount += transferAmount;
    } else {
        // Add new hall item
        const hallItem = {
            id: generateId(),
            name: stockItem.name,
            amount: transferAmount,
            unit: stockItem.unit,
            entryDate: new Date().toISOString()
        };
        hallItems.push(hallItem);
    }
    
    // Reduce stock amount
    stockItems[id].amount -= transferAmount;
    
    // Remove stock item if amount is 0
    if (stockItems[id].amount <= 0) {
        stockItems.splice(id, 1);
    }
    
    saveToLocalStorage();
    renderStockTable();
    renderHallTable();
    updateStatistics();
    closeModal(transferModal);
    showToast(`<i class="fas fa-check-circle"></i> ${transferAmount.toFixed(2)} ${stockItem.unit} of "${stockItem.name}" transferred to hall!`, 'success');
}

// Handle selling a product
function handleSellProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('sellProductId').value;
    const sellAmount = parseFloat(document.getElementById('sellAmount').value);
    
    if (sellAmount <= 0 || sellAmount > hallItems[id].amount) {
        showToast('<i class="fas fa-exclamation-triangle"></i> Invalid amount to sell', 'error');
        return;
    }
    
    const hallItem = hallItems[id];
    
    // Add to sold items
    const soldItem = {
        id: generateId(),
        name: hallItem.name,
        amount: sellAmount,
        unit: hallItem.unit,
        soldDate: new Date().toISOString()
    };
    
    soldItems.push(soldItem);
    
    // Reduce hall amount
    hallItems[id].amount -= sellAmount;
    
    // Remove hall item if amount is 0
    if (hallItems[id].amount <= 0) {
        hallItems.splice(id, 1);
    }
    
    saveToLocalStorage();
    renderHallTable();
    updateStatistics();
    calculateTodaySoldItems();
    closeModal(sellModal);
    
    // Cash register sound effect for selling
    playSound('cash');
    
    showToast(`<i class="fas fa-cash-register"></i> ${sellAmount.toFixed(2)} ${hallItem.unit} of "${hallItem.name}" sold successfully!`, 'success');
}

// Handle returning items from hall to stock
function handleReturnToStock(e) {
    e.preventDefault();
    
    const id = document.getElementById('returnProductId').value;
    const returnAmount = parseFloat(document.getElementById('returnAmount').value);
    
    if (returnAmount <= 0 || returnAmount > hallItems[id].amount) {
        showToast('<i class="fas fa-exclamation-triangle"></i> Invalid amount to return', 'error');
        return;
    }
    
    const hallItem = hallItems[id];
    
    // Check if the item already exists in the stock
    const existingStockItemIndex = stockItems.findIndex(item => 
        item.name === hallItem.name && 
        item.unit === hallItem.unit
    );
    
    if (existingStockItemIndex !== -1) {
        // Update existing stock item
        stockItems[existingStockItemIndex].amount += returnAmount;
    } else {
        // Add new stock item
        const stockItem = {
            id: generateId(),
            name: hallItem.name,
            amount: returnAmount,
            unit: hallItem.unit,
            entryDate: new Date().toISOString()
        };
        stockItems.push(stockItem);
    }
    
    // Reduce hall amount
    hallItems[id].amount -= returnAmount;
    
    // Remove hall item if amount is 0
    if (hallItems[id].amount <= 0) {
        hallItems.splice(id, 1);
    }
    
    saveToLocalStorage();
    renderStockTable();
    renderHallTable();
    updateStatistics();
    closeModal(returnToStockModal);
    showToast(`<i class="fas fa-undo"></i> ${returnAmount.toFixed(2)} ${hallItem.unit} of "${hallItem.name}" returned to stock!`, 'success');
}

// Update statistics with animated counting effect
function updateStatistics() {
    const totalStock = stockItems.reduce((total, item) => total + item.amount, 0);
    const totalHall = hallItems.reduce((total, item) => total + item.amount, 0);
    
    animateCounter(totalStockItemsEl, totalStock);
    animateCounter(totalHallItemsEl, totalHall);
    animateCounter(itemsSoldTodayEl, todaySoldCount);
}

// Counter animation for statistics
function animateCounter(element, targetValue) {
    const duration = 1000; // animation duration in ms
    const startValue = parseFloat(element.textContent) || 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            // Easing function for smoother animation
            const easedProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
            const currentValue = startValue + (targetValue - startValue) * easedProgress;
            element.textContent = currentValue.toFixed(2);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue.toFixed(2);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Calculate items sold today
function calculateTodaySoldItems() {
    const today = new Date().toLocaleDateString();
    
    todaySoldCount = soldItems.reduce((total, item) => {
        const soldDate = new Date(item.soldDate).toLocaleDateString();
        return soldDate === today ? total + item.amount : total;
    }, 0);
    
    animateCounter(itemsSoldTodayEl, todaySoldCount);
}

// Play sound effects
function playSound(type) {
    // Sound effects can be implemented here if desired
    // For now, we'll leave it as a placeholder
    console.log(`Playing ${type} sound`);
}

// Open a modal with glass effect animation
function openModal(modal) {
    // First set display to block but with opacity 0
    modal.style.display = 'block';
    modal.style.opacity = '0';
    
    // Add blur effect to the main content
    document.querySelector('.main-content').classList.add('blur-background');
    
    // Prevent scrolling of the background
    document.body.style.overflow = 'hidden';
    
    // Trigger reflow then animate in
    void modal.offsetWidth;
    modal.style.opacity = '1';
    
    // Initial subtle glow
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 225, 255, 0.2)';
        
        // Transition to normal state
        setTimeout(() => {
            modalContent.style.boxShadow = '';
        }, 800);
    }, 10);
}

// Close a modal with fadeout effect
function closeModal(modal) {
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(20px)';
    
    // Fade out the modal
    modal.style.opacity = '0';
    
    // Remove blur effect from main content
    document.querySelector('.main-content').classList.remove('blur-background');
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
        
        // Reset any forms in the modal
        const form = modal.querySelector('form');
        if (form) form.reset();
    }, 300);
}

// Generate a random ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Save data to local storage
function saveToLocalStorage() {
    localStorage.setItem('stockItems', JSON.stringify(stockItems));
    localStorage.setItem('hallItems', JSON.stringify(hallItems));
    localStorage.setItem('soldItems', JSON.stringify(soldItems));
}

// Show a toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = 'toast ' + type;
    toast.innerHTML = message;
    
    // Remove previous animation if exists
    toast.style.animation = 'none';
    
    // Add glass effect highlight
    const colors = {
        'success': '#00ffa3',
        'error': '#ff3d71',
        'info': '#00e1ff'
    };
    
    // Force reflow
    void toast.offsetWidth;
    
    // Apply glass effect based on type
    toast.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${colors[type] || colors.info}`;
    
    // Add show class
    toast.classList.add('show');
    
    // Apply animation
    toast.style.animation = 'toast-in 0.5s ease-out, toast-out 0.5s ease-in 4.5s';
    
    // Hide toast after animation completes
    setTimeout(() => {
        toast.classList.remove('show');
        toast.style.boxShadow = '';
    }, 5000);
}

// Function to equalize table container widths and heights
function equalizeTableContainers() {
    const stockContainer = document.querySelector('.stock-section .table-container');
    const hallContainer = document.querySelector('.hall-section .table-container');
    
    if (stockContainer && hallContainer) {
        // Reset any previously set heights
        stockContainer.style.height = '';
        hallContainer.style.height = '';
        
        // Set width to 100% for full-width layout
        stockContainer.style.width = '100%';
        hallContainer.style.width = '100%';
        
        // Give DOM time to render properly
        setTimeout(() => {
            // Determine appropriate height (minimum of actual content or max 500px)
            const stockContentHeight = stockTableBody.scrollHeight + document.querySelector('#stockTable thead').scrollHeight;
            const hallContentHeight = hallTableBody.scrollHeight + document.querySelector('#hallTable thead').scrollHeight;
            
            // Set minimum height for empty tables
            const minHeight = 250;
            
            // Calculate appropriate heights based on content
            const stockCalculatedHeight = Math.min(500, Math.max(minHeight, stockContentHeight));
            const hallCalculatedHeight = Math.min(500, Math.max(minHeight, hallContentHeight));
            
            // Apply the heights
            stockContainer.style.height = stockCalculatedHeight + 'px';
            hallContainer.style.height = hallCalculatedHeight + 'px';
        }, 50); // Small delay to ensure DOM is ready
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 

// Add window resize handler to reapply table sizes
window.addEventListener('resize', debounce(function() {
    equalizeTableContainers();
}, 100)); 