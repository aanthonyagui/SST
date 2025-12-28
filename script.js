// --- Configuración de Supabase ---
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N'; // Tu API Key
const supabase = libsupabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Elementos del DOM ---
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const emailInput = document.getElementById('email');
const loginButton = document.getElementById('login-button');
const loginMessage = document.getElementById('login-message');
const userEmailSpan = document.getElementById('user-email');

// --- Lógica de Inicio de Sesión REAL ---
loginButton.addEventListener('click', async () => {
    const emailIngresado = emailInput.value.toLowerCase().trim();
    
    loginMessage.textContent = 'Verificando autorización...';
    loginMessage.style.backgroundColor = '#fff3cd';

    try {
        // Consultamos la tabla 'autorizados' en tu Supabase
        const { data, error } = await supabase
            .from('autorizados')
            .select('email')
            .eq('email', emailIngresado)
            .single();

        if (error || !data) {
            loginMessage.textContent = 'Acceso Denegado. Este correo no ha sido aprobado por el Ingeniero de SST.';
            loginMessage.style.backgroundColor = '#f8d7da';
        } else {
            // Usuario encontrado y aprobado
            localStorage.setItem('currentUser', emailIngresado);
            mostrarApp(emailIngresado);
        }
    } catch (err) {
        console.error(err);
        loginMessage.textContent = 'Error de conexión. Intente más tarde.';
    }
});

function mostrarApp(email) {
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    userEmailSpan.textContent = email;
}

// Cerrar sesión
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    location.reload();
});

// Mantener sesión iniciada
document.addEventListener('DOMContentLoaded', () => {
    const sesion = localStorage.getItem('currentUser');
    if (sesion) mostrarApp(sesion);
});
