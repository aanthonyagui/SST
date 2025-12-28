// --- Configuración de Supabase ---
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N';

// Inicializar el cliente (usando el nombre correcto de la librería)
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Elementos del DOM ---
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const emailInput = document.getElementById('email');
const loginButton = document.getElementById('login-button');
const loginMessage = document.getElementById('login-message');
const userEmailSpan = document.getElementById('user-email');

// --- Lógica de Inicio de Sesión ---
loginButton.addEventListener('click', async () => {
    const emailIngresado = emailInput.value.toLowerCase().trim();
    
    if (!emailIngresado) {
        alert("Por favor escribe un correo");
        return;
    }

    loginMessage.textContent = 'Buscando en base de datos de SST...';
    loginMessage.style.backgroundColor = '#fff3cd';

    try {
        // Consultar si el correo existe en tu tabla 'autorizados'
        const { data, error } = await _supabase
            .from('autorizados')
            .select('email')
            .eq('email', emailIngresado);

        if (error) throw error;

        // Si data tiene algo, es que el correo está en tu lista de Supabase
        if (data && data.length > 0) {
            localStorage.setItem('currentUser', emailIngresado);
            mostrarApp(emailIngresado);
        } else {
            loginMessage.textContent = 'Acceso Denegado. Correo no autorizado.';
            loginMessage.style.backgroundColor = '#f8d7da';
        }
    } catch (err) {
        console.error("Error detallado:", err);
        loginMessage.textContent = 'Error: ' + err.message;
        loginMessage.style.backgroundColor = '#f8d7da';
    }
});

function mostrarApp(email) {
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    userEmailSpan.textContent = email;
}

// Cerrar sesión
document.getElementById('logout-button')?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    location.reload();
});

// Revisar si ya estaba logueado
const sesionGuardada = localStorage.getItem('currentUser');
if (sesionGuardada) {
    mostrarApp(sesionGuardada);
}
