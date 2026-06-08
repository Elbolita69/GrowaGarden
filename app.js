/**
 * Grow A Garden - Main Application
 * Smart Garden Management Dashboard
 */

// ================================================
// Application State
// ================================================
const state = {
    user: {
        name: 'Juan Desarrollo',
        initials: 'JD',
        role: 'Admin' // Admin, Supervisor, Espectador
    },
    sensors: {
        water: 67,
        temperature: 24,
        light: 8.2
    },
    watering: {
        active: false,
        autoMode: true
    },
    theme: 'light',
    connected: true
};

// ================================================
// DOM Ready
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// ================================================
// Initialize Application
// ================================================
function initApp() {
    // Simulate initial loading
    setTimeout(() => {
        hideLoadingOverlay();
        animateCardsIn();
    }, 2000);

    // Initialize components
    initThemeToggle();
    initNavigation();
    initWateringToggle();
    initSensorSimulation();
    updateLastUpdateTime();

    // Update time every second
    setInterval(updateLastUpdateTime, 1000);
}

// ================================================
// Loading Overlay
// ================================================
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
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
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleTheme();
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('growTheme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        state.theme = 'dark';
    }
}

function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        state.theme = 'light';
        localStorage.setItem('growTheme', 'light');
    } else {
        html.classList.add('dark');
        state.theme = 'dark';
        localStorage.setItem('growTheme', 'dark');
    }
}

// ================================================
// Navigation
// ================================================
function initNavigation() {
    // Mobile navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            setActiveNavBtn(btn);
            scrollToSection(section);
        });
    });

    // Desktop sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            setActiveSidebarLink(link);
            const section = href.replace('#', '');
            scrollToSection(section);
        });
    });
}

function setActiveNavBtn(activeBtn) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function setActiveSidebarLink(activeLink) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ================================================
// Watering Toggle
// ================================================
function initWateringToggle() {
    const toggle = document.getElementById('wateringToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const statusIndicator = document.getElementById('statusIndicator');
    const waterFlowAnimation = document.getElementById('waterFlowAnimation');
    const controlPanel = document.getElementById('controlPanel');

    if (!toggle) return;

    toggle.addEventListener('change', () => {
        state.watering.active = toggle.checked;

        if (toggle.checked) {
            // Turn ON
            toggleLabel.textContent = 'Riego Manual Activado';
            statusIndicator.innerHTML = `
                <span class="w-3 h-3 rounded-full bg-secondary animate-pulse"></span>
                <span class="text-sm font-medium text-secondary">Regando</span>
            `;
            waterFlowAnimation.classList.remove('hidden');
            controlPanel.classList.remove('status-optimal');
            controlPanel.classList.add('status-watering');

            // Simulate watering action
            simulateWatering();
        } else {
            // Turn OFF
            toggleLabel.textContent = 'Riego Manual Desactivado';
            statusIndicator.innerHTML = `
                <span class="w-3 h-3 rounded-full bg-earth"></span>
                <span class="text-sm font-medium text-earth-dark dark:text-earth-light">Apagado</span>
            `;
            waterFlowAnimation.classList.add('hidden');
            controlPanel.classList.remove('status-watering');
            controlPanel.classList.add('status-optimal');
        }
    });

    // Check user role and disable if Espectador
    if (state.user.role === 'Espectador') {
        toggle.disabled = true;
        toggle.parentElement.style.opacity = '0.5';
        toggle.parentElement.style.cursor = 'not-allowed';
        controlPanel.style.opacity = '0.7';
        controlPanel.title = 'No tienes permisos para controlar el riego';
    }
}

function simulateWatering() {
    // Simulate water level increase during watering
    let waterLevel = state.sensors.water;
    const waterFill = document.getElementById('waterFill');
    const waterPercentBig = document.getElementById('waterPercentBig');
    const waterPercent = document.getElementById('waterPercent');

    const wateringInterval = setInterval(() => {
        if (!state.watering.active) {
            clearInterval(wateringInterval);
            return;
        }

        waterLevel = Math.min(waterLevel + 1, 100);
        state.sensors.water = waterLevel;

        if (waterFill) {
            waterFill.setAttribute('data-level', waterLevel);
        }
        if (waterPercentBig) {
            waterPercentBig.textContent = `${waterLevel}%`;
        }
        if (waterPercent) {
            waterPercent.textContent = `${waterLevel}%`;
        }

        if (waterLevel >= 100) {
            clearInterval(wateringInterval);
            // Auto turn off when full
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
    // Simulate real-time sensor updates
    setInterval(() => {
        // Random temperature fluctuation
        state.sensors.temperature = Math.round((state.sensors.temperature + (Math.random() - 0.5) * 0.5) * 10) / 10;
        state.sensors.temperature = Math.max(18, Math.min(32, state.sensors.temperature));

        // Random light fluctuation
        state.sensors.light = Math.round((state.sensors.light + (Math.random() - 0.5) * 0.1) * 10) / 10;
        state.sensors.light = Math.max(0, Math.min(14, state.sensors.light));

        updateSensorDisplays();
    }, 5000);
}

function updateSensorDisplays() {
    // Update temperature display
    const tempElements = document.querySelectorAll('.glass-card:has(svg.text-red-500) .text-2xl');
    tempElements.forEach(el => {
        if (el.textContent.includes('°C')) {
            el.textContent = `${state.sensors.temperature}°C`;
        }
    });

    // Update light display
    const lightElements = document.querySelectorAll('.glass-card:has(svg.text-yellow-500) .text-2xl');
    lightElements.forEach(el => {
        if (el.textContent.includes('h')) {
            el.textContent = `${state.sensors.light}h`;
        }
    });
}

// ================================================
// Time Updates
// ================================================
function updateLastUpdateTime() {
    const timeElement = document.getElementById('lastUpdate');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// ================================================
// Water Level Animation
// ================================================
function setWaterLevel(level) {
    const waterFill = document.getElementById('waterFill');
    const waterPercentBig = document.getElementById('waterPercentBig');
    const waterPercent = document.getElementById('waterPercent');

    if (waterFill) {
        waterFill.setAttribute('data-level', level);
    }
    if (waterPercentBig) {
        waterPercentBig.textContent = `${level}%`;
    }
    if (waterPercent) {
        waterPercent.textContent = `${level}%`;
    }

    state.sensors.water = level;

    // Update status based on level
    const cards = document.querySelectorAll('.water-gauge').forEach(gauge => {
        const parentCard = gauge.closest('.glass-card');
        if (parentCard) {
            if (level < 30) {
                parentCard.classList.remove('status-optimal', 'status-watering');
                parentCard.classList.add('status-alert');
            } else if (level < 50) {
                parentCard.classList.remove('status-optimal', 'status-alert');
                parentCard.classList.add('status-watering');
            } else {
                parentCard.classList.remove('status-alert', 'status-watering');
                parentCard.classList.add('status-optimal');
            }
        }
    });
}

// ================================================
// Utility Functions
// ================================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================================
// WebSocket Simulation (for future real implementation)
// ================================================
class SensorWebSocket {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        // Simulated connection for demo purposes
        console.log('WebSocket simulation: Connected to', this.url);
        this.onopen();
    }

    onopen() {
        console.log('Connection established');
    }

    onmessage(event) {
        const data = JSON.parse(event.data);
        this.handleSensorData(data);
    }

    handleSensorData(data) {
        if (data.type === 'water') {
            setWaterLevel(data.value);
        } else if (data.type === 'temperature') {
            state.sensors.temperature = data.value;
 updateSensorDisplays();
        } else if (data.type === 'light') {
            state.sensors.light = data.value;
            updateSensorDisplays();
        }
    }

    disconnect() {
        console.log('WebSocket disconnected');
    }
}

// ================================================
// API Simulation (for future real implementation)
// ================================================
const API = {
    baseURL: '/api',

    async getSensorData() {
        // Simulated API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    water: state.sensors.water,
                    temperature: state.sensors.temperature,
                    light: state.sensors.light,
                    timestamp: new Date().toISOString()
                });
            }, 500);
        });
    },

    async setWatering(active) {
        // Simulated API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, watering: active });
            }, 300);
        });
    },

    async getPlantInfo() {
        // Simulated API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    name: 'Tomate Cherry',
                    scientificName: 'Solanum lycopersicum var. cerasiforme',
                    daysAlive: 42,
                    status: 'optimal'
                });
            }, 500);
        });
    }
};

// ================================================
// Export for module usage
// ================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { state, API, setWaterLevel };
}
