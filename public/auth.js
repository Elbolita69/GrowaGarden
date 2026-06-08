/**
 * Grow A Garden - Authentication Module
 * Handles login, register, and user session management
 */

// ================================================
// Auth State Observer
// ================================================
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User logged in:', user.email);
        handleUserSession(user);
    } else {
        console.log('User logged out');
        handleNoSession();
    }
});

// ================================================
// Handle User Session
// ================================================
function handleUserSession(user) {
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                localStorage.setItem('growUser', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: userData.name || user.displayName || 'Usuario',
                    role: userData.role || 'espectador',
                    gardenId: userData.gardenId || null,
                    createdAt: userData.createdAt
                }));
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
        });
}

// ================================================
// Handle No Session
// ================================================
function handleNoSession() {
    localStorage.removeItem('growUser');
}

// ================================================
// DOM Ready
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPasswordStrength();
    }

    // Social login handlers
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }

    const githubLoginBtn = document.getElementById('githubLogin');
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', handleGithubLogin);
    }

    const googleRegisterBtn = document.getElementById('googleRegister');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleLogin);
    }

    const githubRegisterBtn = document.getElementById('githubRegister');
    if (githubRegisterBtn) {
        githubRegisterBtn.addEventListener('click', handleGithubLogin);
    }

    // Password toggle
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
});

// ================================================
// Login Handler
// ================================================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked || false;
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    showLoading();
    submitBtn.disabled = true;

    try {
        await auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        // Update last login
        await db.collection('users').doc(userCredential.user.uid).set({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(errorMessage, errorText, getAuthErrorMessage(error.code));
        submitBtn.disabled = false;
    } finally {
        hideLoading();
    }
}

// ================================================
// Register Handler
// ================================================
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    if (password !== confirmPassword) {
        showError(errorMessage, errorText, 'Las contraseñas no coinciden');
        return;
    }

    if (password.length < 8) {
        showError(errorMessage, errorText, 'La contraseña debe tener al menos 8 caracteres');
        return;
    }

    showLoading();
    submitBtn.disabled = true;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        await userCredential.user.updateProfile({
            displayName: name
        });

        // All users start as espectador
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            role: 'espectador',
            gardenId: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(errorMessage, errorText, getAuthErrorMessage(error.code));
        submitBtn.disabled = false;
    } finally {
        hideLoading();
    }
}

// ================================================
// Google Login
// ================================================
async function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        showLoading();
        const result = await auth.signInWithPopup(provider);

        const isNewUser = result.additionalUserInfo.isNewUser;

        if (isNewUser) {
            await db.collection('users').doc(result.user.uid).set({
                name: result.user.displayName,
                email: result.user.email,
                role: 'espectador',
                gardenId: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await db.collection('users').doc(result.user.uid).set({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Google login error:', error);
        alert('Error al iniciar sesión con Google: ' + getAuthErrorMessage(error.code));
    } finally {
        hideLoading();
    }
}

// ================================================
// GitHub Login
// ================================================
async function handleGithubLogin() {
    const provider = new firebase.auth.GithubAuthProvider();
    provider.addScope('read:user');
    provider.addScope('user:email');

    try {
        showLoading();
        const result = await auth.signInWithPopup(provider);

        const isNewUser = result.additionalUserInfo.isNewUser;

        if (isNewUser) {
            await db.collection('users').doc(result.user.uid).set({
                name: result.user.displayName || 'Usuario GitHub',
                email: result.user.email || 'No disponible',
                role: 'espectador',
                gardenId: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await db.collection('users').doc(result.user.uid).set({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('GitHub login error:', error);
        alert('Error al iniciar sesión con GitHub: ' + getAuthErrorMessage(error.code));
    } finally {
        hideLoading();
    }
}

// ================================================
// Logout
// ================================================
async function handleLogout() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ================================================
// Password Strength
// ================================================
function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthBars = [
        document.getElementById('strength-1'),
        document.getElementById('strength-2'),
        document.getElementById('strength-3'),
        document.getElementById('strength-4')
    ];
    const strengthText = document.getElementById('strength-text');

    if (!passwordInput) return;

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);

        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
        const labels = ['Muy débil', 'Débil', 'Media', 'Fuerte'];

        strengthBars.forEach((bar, index) => {
            bar.className = 'h-1 flex-1 rounded-full transition-colors';
            if (index < strength) {
                bar.classList.add(colors[strength - 1]);
            } else {
                bar.classList.add('bg-gray-200', 'dark:bg-gray-700');
            }
        });

        if (strengthText) {
            strengthText.textContent = password.length > 0 ? labels[strength - 1] : '';
        }
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
}

// ================================================
// Password Visibility Toggle
// ================================================
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (passwordInput) {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
    }
}

// ================================================
// UI Helpers
// ================================================
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

function showError(container, textElement, message) {
    if (container && textElement) {
        container.classList.remove('hidden');
        textElement.textContent = message;
    }
}

function hideError(container) {
    if (container) {
        container.classList.add('hidden');
    }
}

// ================================================
// Error Messages
// ================================================
function getAuthErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/invalid-email': 'El correo electrónico no es válido',
        'auth/operation-not-allowed': 'Esta operación no está permitida',
        'auth/weak-password': 'La contraseña es muy débil',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/user-not-found': 'No existe una cuenta con este correo',
        'auth/wrong-password': 'La contraseña es incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/popup-closed-by-user': 'La ventana de autenticación se cerró',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    };
    return messages[code] || 'Ocurrió un error. Intenta de nuevo.';
}

// ================================================
// Garden Functions
// ================================================
async function createGarden(type) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Generate 6-digit alphanumeric invite code
    const inviteCode = generateInviteCode();

    const gardenData = {
        name: type === 'negocio' ? 'Mi Huerto de Negocio' : 'Mi Huerto Familiar',
        type: type,
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        inviteCode: inviteCode,
        members: [user.uid]
    };

    const gardenRef = await db.collection('gardens').add(gardenData);
    const gardenId = gardenRef.id;

    // Update user with gardenId and role
    await db.collection('users').doc(user.uid).update({
        gardenId: gardenId,
        role: 'admin'
    });

    return { gardenId, inviteCode };
}

async function joinGarden(inviteCode) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Find garden by invite code
    const gardensSnapshot = await db.collection('gardens')
        .where('inviteCode', '==', inviteCode.toUpperCase())
        .get();

    if (gardensSnapshot.empty) {
        throw new Error('Código de invitación inválido');
    }

    const gardenDoc = gardensSnapshot.docs[0];
    const gardenData = gardenDoc.data();

    // Check if user is already a member
    if (gardenData.members.includes(user.uid)) {
        // Update user with gardenId
        await db.collection('users').doc(user.uid).update({
            gardenId: gardenDoc.id,
            role: 'member'
        });
        return { gardenId: gardenDoc.id, alreadyMember: true };
    }

    // Add user to garden members
    await db.collection('gardens').doc(gardenDoc.id).update({
        members: firebase.firestore.FieldValue.arrayUnion(user.uid)
    });

    // Update user with gardenId and role
    await db.collection('users').doc(user.uid).update({
        gardenId: gardenDoc.id,
        role: 'member'
    });

    return { gardenId: gardenDoc.id, alreadyMember: false };
}

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ================================================
// Check Auth and Redirect
// ================================================
function requireAuth(callback) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            callback(user);
        } else {
            window.location.href = 'login.html';
        }
    });
}

function requireNoAuth(callback) {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            callback();
        } else {
            window.location.href = 'dashboard.html';
        }
    });
}

// Export functions
window.GrowAuth = {
    handleLogout,
    requireAuth,
    requireNoAuth,
    auth,
    db,
    createGarden,
    joinGarden
};
