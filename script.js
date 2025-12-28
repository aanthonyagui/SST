// --- Elementos del DOM ---
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password'); // Por ahora no se usa, pero es buena práctica
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const loginMessage = document.getElementById('login-message');
const userEmailSpan = document.getElementById('user-email');
const incidentForm = document.getElementById('incident-form');
const fechaInput = document.getElementById('fecha');
const tipoIncidenteInput = document.getElementById('tipo-incidente');
const descripcionInput = document.getElementById('descripcion');
const formMessage = document.getElementById('form-message');
const pendingReportsList = document.getElementById('pending-reports');
const syncButton = document.getElementById('sync-button');
const syncMessage = document.getElementById('sync-message');

// --- IndexedDB para guardar datos offline ---
let db;
const DB_NAME = 'SSTAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'incidentReports';

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("Error al abrir IndexedDB:", event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

async function saveReportOffline(report) {
    await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(report);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.errorCode);
    });
}

async function getPendingReports() {
    await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]); // Retorna array vacío si hay error
    });
}

async function clearReport(id) {
    await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.errorCode);
    });
}

// --- Función para cargar reportes pendientes en la UI ---
async function loadPendingReports() {
    pendingReportsList.innerHTML = '';
    const reports = await getPendingReports();

    if (reports.length > 0) {
        syncButton.style.display = 'block';
        reports.forEach(report => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${report.fecha} - ${report.tipoIncidente}: ${report.descripcion.substring(0, 50)}...</span>
                <span class="status">PENDIENTE</span>
            `;
            pendingReportsList.appendChild(li);
        });
    } else {
        syncButton.style.display = 'none';
        const li = document.createElement('li');
        li.textContent = "No hay reportes pendientes de sincronizar.";
        pendingReportsList.appendChild(li);
    }
}

// --- Lógica de Sincronización (cuando hay internet) ---
async function syncReports() {
    syncMessage.textContent = "Sincronizando reportes...";
    syncMessage.style.backgroundColor = '#d1ecf1'; // Color info

    const pending = await getPendingReports();
    if (pending.length === 0) {
        syncMessage.textContent = "No hay reportes para sincronizar.";
        syncMessage.style.backgroundColor = '#e9ecef';
        return;
    }

    // --- AQUÍ INTEGRARÍAS SUPABASE/FIREBASE ---
    // En un entorno real, enviarías cada reporte a tu base de datos Supabase/Firebase
    // Ejemplo (pseudocódigo para Supabase):
    /*
    for (const report of pending) {
        try {
            // const { data, error } = await supabase.from('incidentes').insert([report]);
            // if (error) throw error;
            console.log("Reporte enviado a la nube:", report); // Simulación
            await clearReport(report.id); // Elimina de IndexedDB si se envió con éxito
        } catch (error) {
            console.error("Error al enviar reporte:", error);
            // Si falla, el reporte se queda en IndexedDB para el siguiente intento
        }
    }
    */
    // Simulación: Esperar un poco y luego limpiar
    await new Promise(resolve => setTimeout(resolve, 2000));
    for (const report of pending) {
        await clearReport(report.id);
    }
    // --- FIN INTEGRACIÓN SUPABASE/FIREBASE ---

    syncMessage.textContent = `Se sincronizaron ${pending.length} reportes.`;
    syncMessage.style.backgroundColor = '#d4edda'; // Color success
    await loadPendingReports(); // Recargar la lista
}

// --- Lógica de Inicio de Sesión ---
const AUTHORIZED_EMAILS = ["tu.correo@empresa.com", "admin@sst.com"]; // ¡IMPORTANTE! En un entorno real, esto vendría de Supabase/Firebase

loginButton.addEventListener('click', async () => {
    const email = emailInput.value.toLowerCase();
    const password = passwordInput.value; // Por ahora no se usa, pero es bueno tenerlo

    if (AUTHORIZED_EMAILS.includes(email)) { // Simulación de validación
        localStorage.setItem('currentUser', email); // Guarda el email en el navegador
        loginMessage.textContent = 'Inicio de sesión exitoso.';
        loginMessage.style.backgroundColor = '#d4edda'; // Color success
        await displayAppContent(email);
    } else {
        loginMessage.textContent = 'Correo no autorizado o contraseña incorrecta. Contacte al administrador de SST.';
        loginMessage.style.backgroundColor = '#f8d7da'; // Color danger
    }
});

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    loginSection.style.display = 'block';
    appSection.style.display = 'none';
    emailInput.value = '';
    passwordInput.value = '';
    loginMessage.textContent = '';
    formMessage.textContent = '';
    syncMessage.textContent = '';
    pendingReportsList.innerHTML = '';
});

async function displayAppContent(email) {
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    userEmailSpan.textContent = email;
    await loadPendingReports();
}

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        await displayAppContent(currentUser);
    }
    // Establecer la fecha actual por defecto en el formulario
    const today = new Date().toISOString().split('T')[0];
    fechaInput.value = today;
});

// --- Manejar el envío del formulario ---
incidentForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const newReport = {
        fecha: fechaInput.value,
        tipoIncidente: tipoIncidenteInput.value,
        descripcion: descripcionInput.value,
        timestamp: new Date().toISOString(), // Para saber cuándo se creó
        synced: false // Indicador de si ya se envió a la nube
    };

    try {
        await saveReportOffline(newReport);
        formMessage.textContent = 'Reporte guardado localmente (offline). Se sincronizará al tener conexión.';
        formMessage.style.backgroundColor = '#d1ecf1';
        incidentForm.reset();
        // Volver a establecer la fecha actual
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
        await loadPendingReports(); // Actualizar la lista de pendientes
    } catch (error) {
        formMessage.textContent = 'Error al guardar el reporte offline. Intente de nuevo.';
        formMessage.style.backgroundColor = '#f8d7da';
        console.error("Error guardando reporte offline:", error);
    }
});

// --- Event listener para el botón de sincronizar ---
syncButton.addEventListener('click', syncReports);

// --- Detectar conexión online/offline para sincronización ---
window.addEventListener('online', () => {
    console.log("¡Volvió la conexión! Intentando sincronizar...");
    syncMessage.textContent = "Conexión restaurada. Sincronizando reportes pendientes...";
    syncMessage.style.backgroundColor = '#d1ecf1';
    // Dar un pequeño delay para asegurar que la conexión es estable
    setTimeout(syncReports, 3000);
});

window.addEventListener('offline', () => {
    console.log("Se perdió la conexión. Trabajando offline.");
    syncMessage.textContent = "¡Conexión perdida! Los reportes se guardarán localmente.";
    syncMessage.style.backgroundColor = '#fff3cd'; // Color warning
});
