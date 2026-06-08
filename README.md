# 🌱 Grow A Garden - Sistema de Gestión de Huertos Inteligentes

![Grow A Garden](https://img.shields.io/badge/Version-1.0.0-52B788?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-9.23.0-FFA500?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge)

**Grow A Garden** es una plataforma web para el monitoreo y control de huertos inteligentes basados en Arduino. Permite a los usuarios gestionar sus cultivos de forma remota, visualizar datos de sensores en tiempo real y automatizar el riego.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración de Firebase](#-configuración-de-firebase)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos Principales](#-módulos-principales)
- [Sistema de Roles](#-sistema-de-roles)
- [API de Firebase](#-api-de-firebase)
- [Despliegue](#-despliegue)
- [Uso de la Aplicación](#-uso-de-la-aplicación)
- [Contribución](#-contribución)

---

## ✨ Características

### 🔐 Autenticación
- Registro con email y contraseña
- Login con Google (OAuth)
- Login con GitHub (OAuth)
- Persistencia de sesión (local/sesión)
- Recuperación de contraseña

### 🌿 Sistema de Jardines
- Creación de jardines personales o de negocio
- Código de invitación de 6 dígitos alfanumérico
- Unirse a jardines existentes mediante código
- Roles diferenciados por usuario

### 📊 Dashboard
- Indicador de agua animado con ondas fluidas
- Gráfico de temperatura con arco visual
- Indicador de luz solar con sol animado
- Panel de control de riego (toggle bio-mecánico)
- Historial de actividad

### 🎨 Diseño UI/UX
- Glassmorphism de alta fidelidad
- Modo oscuro/claro
- Diseño responsive (mobile-first)
- Animaciones orgánicas (ondas, burbujas, rayos solares)
- Paleta de colores terrosa y tecnológica

---

## 🛠 Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| HTML5 | - | Estructura semántica |
| Tailwind CSS | 3.x | Framework de estilos |
| JavaScript | ES6+ | Lógica de aplicación |
| Firebase | 9.23.0 | Backend (Auth, Firestore, Hosting) |

### Paleta de Colores

```
Verde Principal: #2D6A4F (primary) #52B788 (primary-light)
Azul Secundario:    #1A759F (secondary)    #34A0A4 (secondary-light)
Marrón Tierra:      #6C584C (earth)        #A3B18A (earth-light)
Fondos:             #F8F9FA (light) #1E2321 (dark)
```

---

## 📦 Requisitos Previos

- Node.js 16+ y npm
- Cuenta de Firebase
- Git instalado
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Elbolita69/GrowaGarden.git
cd GrowaGarden
```

### 2. Configurar Firebase (ver sección siguiente)

### 3. Copiar y configurar firebase-config

```bash
cp public/firebase-config.js.example public/firebase-config.js
# Editar firebase-config.js con tus credenciales de Firebase
```

### 4. Ejecutar en Desarrollo Local

```bash
# Abrir directamente en el navegador
file:///path/to/project/public/index.html

# O usar Firebase emulators (requiere firebase-tools)
firebase init emulators
firebase emulators:start
```

---

## 🔥 Configuración de Firebase

### ⚠️ Importante

El archivo `firebase-config.js` contiene credenciales sensibles y **NO** está incluido en el repositorio. Debes configurarlo tú mismo.

### Pasos:

#### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Añadir proyecto"
3. Nombre del proyecto: `growagarden` (o tu preference)
4. Habilitar Google Analytics (opcional)
5. Click en "Crear proyecto"

#### 2. Configurar Authentication

1. En el menú lateral, ve a **Authentication** → **Métodos de inicio de sesión**
2. Habilitar **Correo electrónico/contraseña**
3. Habilitar **Google**
4. Habilitar **GitHub**

#### 3. Configurar Firestore

1. Ve a **Firestore Database** → **Crear base de datos**
2. Seleccionar **Comenzar en modo de producción**
3. Elegir ubicación
4. Click en **Crear base de datos**

#### 4. Configurar Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 5. Obtener Configuración

1. Ve a **Configuración del proyecto** (⚙️)
2. En "Tu apps", click en el icono web `</>`
3. Registrar la app y copiar la configuración

#### 6. Crear firebase-config.js

Copia el contenido de `firebase-config.js.example` y reemplaza los valores:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

---

## 📁 Estructura del Proyecto

```
GrowaGarden/
├── public/                          # Directorio de Firebase Hosting
│   ├── index.html                   # Landing page
│   ├── login.html                   # Página de inicio de sesión
│   ├── register.html                # Página de registro
│   ├── dashboard.html               # Panel principal del usuario
│   ├── firebase-config.js.example  # Template de configuración Firebase
│   ├── auth.js                     # Módulo de autenticación
│   ├── dashboard.js                # Lógica del dashboard
│   ├── styles.css                  # Estilos CSS
│   └── img/                        # Imágenes (logos)
│
├── img/                             # Imágenes originales
├── firebase.json                   # Configuración de Firebase Hosting
├── .gitignore                      # Archivos ignorados por Git
└── README.md                       # Documentación
```

---

## 📦 Módulos Principales

### firebase-config.js.example

Template de configuración de Firebase. **Copiar a firebase-config.js y completar con credenciales.**

```javascript
// Servicios exportados
window.firebase    // Instancia de Firebase
window.auth       // Servicio de autenticación
window.db         // Base de datos Firestore
```

### auth.js

Módulo de autenticación con las siguientes funciones:

| Función | Descripción |
|---------|-------------|
| `handleLogin(e)` | Inicia sesión con email/contraseña |
| `handleRegister(e)` | Registra nuevo usuario |
| `handleGoogleLogin()` | Login con Google OAuth |
| `handleGithubLogin()` | Login con GitHub OAuth |
| `handleLogout()` | Cierra la sesión |
| `createGarden(type)` | Crea un nuevo jardín |
| `joinGarden(inviteCode)` | Une al usuario a un jardín existente |

### dashboard.js

Lógica del dashboard con las siguientes funciones:

| Función | Descripción |
|---------|-------------|
| `initDashboard()` | Inicializa el dashboard |
| `checkAuth()` | Verifica autenticación |
| `loadUserData()` | Carga datos del usuario |
| `loadGardenData()` | Carga datos del jardín |
| `showSetupScreen()` | Muestra pantalla de configuración |
| `showDashboard()` | Muestra el dashboard completo |
| `handleCreateGarden()` | Crea un jardín |
| `handleJoinGarden()` | Une a un jardín con código |

### styles.css

Contiene todos los estilos incluyendo:

- **Glassmorphism**: `.glass-card` con backdrop-blur
- **LED Perimeter**: Efecto de luz LED perimetral según estado
- **Water Gauge**: Animación de gota de agua con ondas
- **Sun Animation**: Sol con rayos pulsantes
- **Bio Toggle**: Toggle bio-mecánico para riego
- **Water Flow**: Partículas de agua animadas

---

## 👥 Sistema de Roles

| Rol | Descripción | Permisos |
|----|-------------|----------|
| `espectador` | Usuario sin jardín | Ver datos, no puede controlar |
| `member` | Miembro de un jardín | Ver datos, no puede controlar |
| `admin` | Administrador | Control total, puede invitar |

### Flujo de Usuario

```
1. Registro → Usuario creado como "espectador" sin jardín
2. Setup Screen → Puede crear jardín o unirse con código
3. Crear Jardín → Se genera código de 6 dígitos, rol = "admin"
4. Unirse Jardín → rol = "member"
```

### Generación de Código de Invitación

```javascript
function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
```

---

## 🔥 API de Firebase

### Colecciones de Firestore

#### `users`
```javascript
{
    name: string,           // Nombre completo
    email: string,          // Correo electrónico
    role: string, // 'espectador' | 'member' | 'admin'
    gardenId: string | null, // ID del jardín (null si no tiene)
    createdAt: timestamp,   // Fecha de creación
    lastLogin: timestamp    // Último inicio de sesión
}
```

#### `gardens`
```javascript
{
    name: string,           // Nombre del jardín
    type: string,           // 'hogar' | 'negocio'
    createdBy: string,      // UID del creador
    createdAt: timestamp,   // Fecha de creación
    inviteCode: string,     // Código de 6 dígitos
    members: array           // Array de UIDs de miembros
}
```

---

## 🚀 Despliegue

### Firebase Hosting

```bash
# 1. Instalar firebase-tools
npm install -g firebase-tools
firebase login

# 2. Inicializar proyecto
firebase init hosting
# Seleccionar "public" como directorio de archivos

# 3. Deploy
firebase deploy --only hosting
```

### URL del Proyecto
- **Producción:** https://growagarden-34ddd.web.app

---

## 📱 Uso de la Aplicación

### 1. Registro e Inicio de Sesión

1. Abrir la página de login o registro
2. Crear cuenta con email o usar Google/GitHub
3. Verificar email si está habilitado

### 2. Configuración Inicial (Setup Screen)

Al iniciar sesión por primera vez:

1. **Crear Jardín:**
   - Seleccionar tipo (Hogar o Negocio)
   - Click en "Crear Mi Jardín"
   - Se genera automáticamente un código de invitación

2. **Unirse a Jardín Existente:**
   - Click en "Unirse a Jardín"
   - Ingresar el código de 6 dígitos
   - Click en "Unirme al Jardín"

### 3. Dashboard

Una vez dentro del jardín:

- **Vista de Sensores:** Ver datos de agua, temperatura y luz
- **Control de Riego:** Toggle para activar riego manual (solo admin)
- **Invitar Miembros:** Copiar código de invitación (solo admin)
- **Historial:** Ver actividad reciente

### 4. Roles y Permisos

| Acción | Administrador | Miembro | Espectador |
|--------|:-------------:|:-------:|:----------:|
| Ver dashboard | ✅ | ✅ | ✅ |
| Controlar riego | ✅ | ❌ | ❌ |
| Ver código de invitación | ✅ | ❌ | ❌ |
| Invitar miembros | ✅ | ❌ | ❌ |

---

## 🤝 Contribución

1. Fork el repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcion`)
3. Commit los cambios (`git commit -m 'Agregar nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abrir un Pull Request

---

## ⚠️ Nota de Seguridad

Este proyecto incluye un archivo `.gitignore` que exclude:
- `public/firebase-config.js` (contiene credenciales)
- Archivos `.env`
- `node_modules/`
- Archivos de sistema operativos

**Nunca subas archivos con credenciales reales a repositorios públicos.**

---

<div align="center">
  <p>🌱 Grow A Garden - Sistema de Gestión de Huertos Inteligentes</p>
</div>
