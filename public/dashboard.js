/**
 * Grow A Garden - Dashboard Module
 * Handles dashboard functionality, sensor data, and garden setup
 */

const state = {
    user: null,
    userData: null,
    gardenData: null,
    sensors: { water: 67, temperature: 24, light: 8.2 },
    watering: { active: false }
};

// ================================================
// Initialize Dashboard
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    await checkAuth();
    initThemeToggle();
    initNavigation();
    initWateringToggle();
    initLogout();
    initSetupFlow();
    updateLastUpdateTime();

    setInterval(updateLastUpdateTime, 1000);
    initSensorSimulation();
}

// ================================================
// Check Auth
// ================================================
async function checkAuth() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            unsubscribe();
            if (user) {
                state.user = user;
                await loadUserData();
                resolve(user);
            } else {
                window.location.href = 'login.html';
                reject('Not authenticated');
            }
        });
    });
}

// ================================================
// Load User Data
// ================================================
async function loadUserData() {
    try {
        const doc = await db.collection('users').doc(state.user.uid).get();
        if (doc.exists) {
            state.userData = doc.data();
            updateUserUI(state.userData);

            // Check if user has a garden
            if (state.userData.gardenId) {
                await loadGardenData();
                showDashboard();
            } else {
                showSetupScreen();
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ================================================
// Load Garden Data
// ================================================
async function loadGardenData() {
    if (!state.userData.gardenId) return;

    try {
        const doc = await db.collection('gardens').doc(state.userData.gardenId).get();
        if (doc.exists) {
            state.gardenData = doc.data();
            state.gardenData.id = doc.id;
            updateGardenUI();
        }
    } catch (error) {
        console.error('Error loading garden data:', error);
    }
}

// ================================================
// Update User UI
// ================================================
function updateUserUI(userData) {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userRoleBadge = document.getElementById('userRoleBadge');

    if (userName) userName.textContent = userData.name || state.user.displayName || 'Usuario';
    if (userAvatar) userAvatar.textContent = getInitials(userData.name || 'Usuario');

    const role = userData.role || 'member';
    const roleLabels = {
        'admin': 'Administrador',
        'member': 'Miembro',
        'espectador': 'Espectador'
    };

    if (userRoleBadge) {
        userRoleBadge.textContent = roleLabels[role] || 'Miembro';
    }
}

// ================================================
// Update Garden UI
// ================================================
function updateGardenUI() {
    if (!state.gardenData) return;

    const gardenName = document.getElementById('gardenName');
    const roleText = document.getElementById('roleText');
    const roleIndicator = document.getElementById('roleIndicator');
    const displayInviteCode = document.getElementById('displayInviteCode');
    const inviteCodeCard = document.getElementById('inviteCodeCard');

    if (gardenName) gardenName.textContent = state.gardenData.name || 'Mi Huerto';

    const role = state.userData.role || 'member';

    if (roleText) roleText.textContent = `Rol: ${role === 'admin' ? 'Administrador' : 'Miembro'}`;

    if (roleIndicator) {
        roleIndicator.classList.remove('bg-primary/10', 'bg-secondary/10', 'bg-earth/10');
        if (role === 'admin') {
            roleIndicator.classList.add('bg-primary/10');
        } else {
            roleIndicator.classList.add('bg-secondary/10');
        }
    }

    // Show invite code only for admin
    if (inviteCodeCard) {
        if (role === 'admin' && state.gardenData.inviteCode) {
            inviteCodeCard.classList.remove('hidden');
            if (displayInviteCode) displayInviteCode.textContent = state.gardenData.inviteCode;
        } else {
            inviteCodeCard.classList.add('hidden');
        }
    }

    // Disable controls for non-admin
    if (role !== 'admin') {
        disableControlsForNonAdmin();
    }
}

// ================================================
// Show/Hide Screens
// ================================================
function showSetupScreen() {
    const setupScreen = document.getElementById('setupScreen');
    const dashboardContent = document.getElementById('dashboardContent');
    const mobileNav = document.getElementById('mobileNav');
    const sidebar = document.getElementById('sidebar');

    if (setupScreen) setupScreen.classList.remove('hidden');
    if (dashboardContent) dashboardContent.classList.add('hidden');
    if (mobileNav) mobileNav.classList.add('hidden');
    if (sidebar) sidebar.classList.add('hidden');

    hideLoadingOverlay();
}

function showDashboard() {
    const setupScreen = document.getElementById('setupScreen');
    const dashboardContent = document.getElementById('dashboardContent');
    const mobileNav = document.getElementById('mobileNav');
    const sidebar = document.getElementById('sidebar');

    if (setupScreen) setupScreen.classList.add('hidden');
    if (dashboardContent) dashboardContent.classList.remove('hidden');
    if (mobileNav) mobileNav.classList.remove('hidden');
    if (sidebar) sidebar.classList.remove('hidden');

    hideLoadingOverlay();
    animateCardsIn();
}

// ================================================
// Setup Flow
// ================================================
function initSetupFlow() {
    const tabCreate = document.getElementById('tabCreate');
    const tabJoin = document.getElementById('tabJoin');
    const createForm = document.getElementById('createForm');
    const joinForm = document.getElementById('joinForm');
    const createGardenBtn = document.getElementById('createGardenBtn');
    const joinGardenBtn = document.getElementById('joinGardenBtn');
    const inviteCode = document.getElementById('inviteCode');
    const copyInviteCode = document.getElementById('copyInviteCode');

    // Tab switching
    if (tabCreate) {
        tabCreate.addEventListener('click', () => {
            tabCreate.classList.add('bg-primary', 'text-white');
            tabCreate.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
            tabJoin.classList.remove('bg-secondary', 'text-white');
            tabJoin.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
            createForm.classList.remove('hidden');
            joinForm.classList.add('hidden');
        });
    }

    if (tabJoin) {
        tabJoin.addEventListener('click', () => {
            tabJoin.classList.add('bg-secondary', 'text-white');
            tabJoin.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
            tabCreate.classList.remove('bg-primary', 'text-white');
            tabCreate.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
            joinForm.classList.remove('hidden');
            createForm.classList.add('hidden');
        });
    }

    // Create garden
    if (createGardenBtn) {
        createGardenBtn.addEventListener('click', handleCreateGarden);
    }

    // Join garden
    if (joinGardenBtn) {
        joinGardenBtn.addEventListener('click', handleJoinGarden);
    }

    // Auto uppercase invite code
    if (inviteCode) {
        inviteCode.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Copy invite code
    if (copyInviteCode) {
        copyInviteCode.addEventListener('click', () => {
            const code = document.getElementById('displayInviteCode').textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyInviteCode.innerHTML = `
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                `;
                setTimeout(() => {
                    copyInviteCode.innerHTML = `
                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    `;
                }, 2000);
            });
        });
    }
}

// ================================================
// Create Garden Handler
// ================================================
async function handleCreateGarden() {
    const createGardenBtn = document.getElementById('createGardenBtn');
    const setupError = document.getElementById('setupError');
    const setupErrorText = document.getElementById('setupErrorText');
    const gardenType = document.querySelector('input[name="gardenType"]:checked').value;

    showLoading();
    if (createGardenBtn) createGardenBtn.disabled = true;
    hideError(setupError);

    try {
        const { gardenId, inviteCode } = await GrowAuth.createGarden(gardenType);

        // Reload user data to get updated gardenId and role
        await loadUserData();
        await loadGardenData();

        // Show success and redirect
        alert(`¡Jardín creado exitosamente!\n\nTu código de invitación es: ${inviteCode}\n\nCompártelo con otros para que se unan a tu jardín.`);

        showDashboard();
    } catch (error) {
        console.error('Create garden error:', error);
        showError(setupError, setupErrorText, error.message || 'Error al crear el jardín');
    } finally {
        if (createGardenBtn) createGardenBtn.disabled = false;
        hideLoading();
    }
}

// ================================================
// Join Garden Handler
// ================================================
async function handleJoinGarden() {
    const joinGardenBtn = document.getElementById('joinGardenBtn');
    const setupError = document.getElementById('setupError');
    const setupErrorText = document.getElementById('setupErrorText');
    const inviteCodeInput = document.getElementById('inviteCode');

    const inviteCode = inviteCodeInput?.value.trim().toUpperCase();

    if (!inviteCode || inviteCode.length !== 6) {
        showError(setupError, setupErrorText, 'Ingresa un código de 6 caracteres');
        return;
    }

    showLoading();
    if (joinGardenBtn) joinGardenBtn.disabled = true;
    hideError(setupError);

    try {
        await GrowAuth.joinGarden(inviteCode);

        // Reload user data
        await loadUserData();
        await loadGardenData();

        showDashboard();
    } catch (error) {
        console.error('Join garden error:', error);
        showError(setupError, setupErrorText, error.message || 'Código de invitación inválido');
    } finally {
        if (joinGardenBtn) joinGardenBtn.disabled = false;
        hideLoading();
    }
}

// ================================================
// Disable Controls for Non-Admin
// ================================================
function disableControlsForNonAdmin() {
    const toggle = document.getElementById('wateringToggle');
    const toggleLabel = document.getElementById('wateringToggleLabel');
    const toggleLabelText = document.getElementById('toggleLabel');
    const toggleSublabel = document.getElementById('toggleSublabel');
    const statusIndicator = document.getElementById('statusIndicator');

    if (toggle) toggle.disabled = true;
    if (toggleLabel) {
        toggleLabel.style.opacity = '0.5';
        toggleLabel.style.cursor = 'not-allowed';
    }
    if (toggleLabelText) toggleLabelText.textContent = 'Solo el administrador puede controlar el riego';
    if (toggleSublabel) toggleSublabel.textContent = 'Contacta al administrador para activar el riego';
    if (statusIndicator) {
        statusIndicator.innerHTML = `
            <span class="w-3 h-3 rounded-full bg-earth"></span>
            <span class="text-sm font-medium text-earth-dark dark:text-earth-light">Solo lectura</span>
        `;
    }
}

// ================================================
// Loading Overlay
// ================================================
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => overlay.style.display = 'none', 500);
    }
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.style.display = 'flex';
    }
}

function animateCardsIn() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ================================================
// Theme Toggle
// ================================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    if (localStorage.getItem('growTheme') === 'dark' || (!localStorage.getItem('growTheme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('growTheme', html.classList.contains('dark') ? 'dark' : 'light');
}

// ================================================
// Navigation
// ================================================
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white');
                b.classList.add('text-earth-dark', 'dark:text-earth-light');
            });
            btn.classList.add('active', 'bg-primary', 'text-white');
            btn.classList.remove('text-earth-dark', 'dark:text-earth-light');
        });
    });
}

// ================================================
// Watering Toggle
// ================================================
function initWateringToggle() {
    const toggle = document.getElementById('wateringToggle');
    if (!toggle) return;

    toggle.addEventListener('change', async () => {
        state.watering.active = toggle.checked;

        if (toggle.checked) {
            await activateWatering();
        } else {
            await deactivateWatering();
        }
    });
}

async function activateWatering() {
    const toggleLabel = document.getElementById('toggleLabel');
    const toggleSublabel = document.getElementById('toggleSublabel');
    const statusIndicator = document.getElementById('statusIndicator');
    const waterFlowAnimation = document.getElementById('waterFlowAnimation');
    const controlPanel = document.getElementById('controlPanel');

    if (toggleLabel) toggleLabel.textContent = 'Riego Manual Activado';
    if (toggleSublabel) toggleSublabel.textContent = 'La bomba de agua está encendida';
    if (statusIndicator) {
        statusIndicator.innerHTML = `<span class="w-3 h-3 rounded-full bg-secondary animate-pulse"></span><span class="text-sm font-medium text-secondary">Regando</span>`;
        statusIndicator.classList.remove('bg-earth/10');
        statusIndicator.classList.add('bg-secondary/10');
    }
    if (waterFlowAnimation) waterFlowAnimation.classList.remove('hidden');
    if (controlPanel) {
        controlPanel.classList.remove('status-optimal');
        controlPanel.classList.add('status-watering');
    }

    simulateWatering();
}

async function deactivateWatering() {
    const toggleLabel = document.getElementById('toggleLabel');
    const toggleSublabel = document.getElementById('toggleSublabel');
    const statusIndicator = document.getElementById('statusIndicator');
    const waterFlowAnimation = document.getElementById('waterFlowAnimation');
    const controlPanel = document.getElementById('controlPanel');

    if (toggleLabel) toggleLabel.textContent = 'Riego Manual Desactivado';
    if (toggleSublabel) toggleSublabel.textContent = 'La bomba de agua está apagada';
    if (statusIndicator) {
        statusIndicator.innerHTML = `<span class="w-3 h-3 rounded-full bg-earth"></span><span class="text-sm font-medium text-earth-dark dark:text-earth-light">Apagado</span>`;
        statusIndicator.classList.add('bg-earth/10');
        statusIndicator.classList.remove('bg-secondary/10');
    }
    if (waterFlowAnimation) waterFlowAnimation.classList.add('hidden');
    if (controlPanel) {
        controlPanel.classList.remove('status-watering');
        controlPanel.classList.add('status-optimal');
    }
}

function simulateWatering() {
    let waterLevel = state.sensors.water;
    const waterFill = document.getElementById('waterFill');
    const waterPercentBig = document.getElementById('waterPercentBig');
    const waterPercent = document.getElementById('waterPercent');
    const plantHumidity = document.getElementById('plantHumidity');

    const interval = setInterval(() => {
        if (!state.watering.active) {
            clearInterval(interval);
            return;
        }

        waterLevel = Math.min(waterLevel + 1, 100);
        state.sensors.water = waterLevel;

        if (waterFill) waterFill.setAttribute('data-level', waterLevel);
        if (waterPercentBig) waterPercentBig.textContent = `${waterLevel}%`;
        if (waterPercent) waterPercent.textContent = `${waterLevel}%`;
        if (plantHumidity) plantHumidity.textContent = `${waterLevel}%`;

        if (waterLevel >= 100) {
            clearInterval(interval);
            const toggle = document.getElementById('wateringToggle');
            if (toggle) toggle.checked = false;
            toggle.dispatchEvent(new Event('change'));
        }
    }, 500);
}

// ================================================
// Sensor Simulation
// ================================================
function initSensorSimulation() {
    setInterval(() => {
        state.sensors.temperature = Math.round((state.sensors.temperature + (Math.random() - 0.5) * 0.5) * 10) / 10;
        state.sensors.temperature = Math.max(18, Math.min(32, state.sensors.temperature));
        state.sensors.light = Math.round((state.sensors.light + (Math.random() - 0.5) * 0.1) * 10) / 10;
        state.sensors.light = Math.max(0, Math.min(14, state.sensors.light));
        updateSensorDisplays();
    }, 5000);
}

function updateSensorDisplays() {
    const tempValue = document.getElementById('tempValue');
    const plantTemp = document.getElementById('plantTemp');
    if (tempValue) tempValue.textContent = `${state.sensors.temperature}°C`;
    if (plantTemp) plantTemp.textContent = `${state.sensors.temperature}°C`;

    const lightValue = document.getElementById('lightValue');
    const plantLight = document.getElementById('plantLight');
    const lightBar = document.getElementById('lightBar');
    if (lightValue) lightValue.textContent = `${state.sensors.light}h`;
    if (plantLight) plantLight.textContent = `${state.sensors.light}h`;
    if (lightBar) lightBar.style.width = `${(state.sensors.light / 14) * 100}%`;
}

// ================================================
// Logout
// ================================================
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

async function handleLogout() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ================================================
// Time Updates
// ================================================
function updateLastUpdateTime() {
    const timeElement = document.getElementById('lastUpdate');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

// ================================================
// Utility Functions
// ================================================
function getInitials(name) {
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
}

function showLoading() {
    showLoadingOverlay();
}

function hideLoading() {
    // Loading managed by showLoadingOverlay/hideLoadingOverlay
}

function showError(container, textElement, message) {
    if (container && textElement) {
        container.classList.remove('hidden');
        textElement.textContent = message;
    }
}

function hideError(container) {
    if (container) container.classList.add('hidden');
}

// Export
window.GrowDashboard = { state };
