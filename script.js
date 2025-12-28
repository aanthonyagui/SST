// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ANIMACIÓN DE ÁTOMOS (GALAXIA) ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00d2ff';
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
        for(let j=i+1; j<particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if(dist < 110) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}
window.addEventListener('resize', initParticles);
initParticles(); animate();

// --- LÓGICA DE ACCESO Y ROLES ---
const loginButton = document.getElementById('login-button');
const emailInput = document.getElementById('email');
const loginMessage = document.getElementById('login-message');

loginButton.addEventListener('click', async () => {
    const email = emailInput.value.toLowerCase().trim();
    if (!email) return;

    loginMessage.textContent = 'Verificando...';

    const { data, error } = await _supabase
        .from('autorizados')
        .select('email, rol')
        .eq('email', email)
        .single();

    if (data) {
        localStorage.setItem('currentUser', email);
        localStorage.setItem('userRole', data.rol);
        entrarAMenu(email, data.rol);
    } else {
        loginMessage.textContent = 'Usuario no autorizado';
        loginMessage.style.color = '#ff4d4d';
    }
});

function entrarAMenu(email, rol) {
    const loginSec = document.getElementById('login-section');
    const appSec = document.getElementById('app-section');

    // Desvanecimiento suave
    loginSec.style.opacity = '0';
    setTimeout(() => {
        loginSec.style.display = 'none';
        appSec.style.display = 'block';
        appSec.style.opacity = '1';
        
        document.getElementById('user-email').textContent = email;
        
        if (rol === 'admin') {
            document.getElementById('user-role').textContent = 'ADMIN';
            // Mostrar todas las tarjetas para admin
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'flex'; // Usamos flex para que el icono y texto se alineen
                el.style.flexDirection = 'column';
            });
        }
    }, 400);
}

// Cerrar sesión
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

// Auto-login si ya inició sesión
const savedUser = localStorage.getItem('currentUser');
const savedRole = localStorage.getItem('userRole');
if (savedUser) entrarAMenu(savedUser, savedRole);
