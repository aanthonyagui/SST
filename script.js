// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ANIMACIÓN ÁTOMOS (FONDO) ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<70; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 1.5
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00d2ff';
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.1)';
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
            if(dist < 100) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}
initParticles(); animate();
window.onresize = initParticles;

// --- INICIO DE SESIÓN ---
const loginButton = document.getElementById('login-button');
const emailInput = document.getElementById('email');

loginButton.addEventListener('click', async () => {
    const email = emailInput.value.toLowerCase().trim();
    if(!email) return alert("Ingresa tu correo");

    const { data, error } = await _supabase
        .from('autorizados')
        .select('*')
        .eq('email', email)
        .single();

    if (data) {
        localStorage.setItem('userSST', JSON.stringify(data));
        mostrarMenu(data);
    } else {
        alert("Usuario no autorizado en el sistema de SST");
    }
});

function mostrarMenu(user) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('user-email').textContent = user.email;
    
    if(user.rol === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    }
}

document.getElementById('logout-button').onclick = () => {
    localStorage.clear();
    location.reload();
};

// Auto-login
const sesion = localStorage.getItem('userSST');
if(sesion) mostrarMenu(JSON.parse(sesion));
