import { cargarModuloTrabajadores } from './trabajadores.js';

// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N'; // Revisa que esta Key sea la correcta
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FONDO ANIMADO (GALAXIA) ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let particles = [];
function initParticles() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<60; i++) particles.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, size: Math.random()*2});
}
function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#00d2ff';
    particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>canvas.width) p.vx*=-1; if(p.y<0||p.y>canvas.height) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(animate);
}
initParticles(); animate();
window.addEventListener('resize', initParticles);

// --- LÓGICA DE USUARIO ---
let usuarioActual = null;

// LOGIN
document.getElementById('login-button').onclick = async () => {
    const email = document.getElementById('email').value.trim().toLowerCase();
    if(!email) return alert("Ingresa un correo");
    
    // Consulta simple para validar si existe
    const { data, error } = await _supabase.from('autorizados').select('*').eq('email', email).single();
    
    if(data) {
        usuarioActual = data;
        mostrarSeleccionEmpresa();
    } else {
        // BACKDOOR TEMPORAL: Si falla la BD, deja entrar como demo (Para que pruebes ya)
        // Quita esto en producción
        if(email === 'admin@goldmins.com') {
            usuarioActual = { email: email, rol: 'admin' };
            mostrarSeleccionEmpresa();
        } else {
            alert("Usuario no autorizado.");
        }
    }
};

// MOSTRAR EMPRESAS
async function mostrarSeleccionEmpresa() {
    document.getElementById('start-container').style.display = 'none'; // Ocultar Login
    document.getElementById('start-container').style.display = 'block'; // Reutilizamos container
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('company-section').style.display = 'block';

    const { data: empresas } = await _supabase.from('empresas').select('*');
    const lista = document.getElementById('lista-empresas');
    lista.innerHTML = '';

    if(empresas) {
        empresas.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'menu-card'; // Estilo en CSS
            div.style.background = 'rgba(255,255,255,0.1)';
            div.style.padding = '15px';
            div.style.borderRadius = '10px';
            div.style.cursor = 'pointer';
            div.innerHTML = `<img src="${emp.logo_url}" style="width:60px;"> <p>${emp.nombre}</p>`;
            div.onclick = () => cargarDashboard(emp);
            lista.appendChild(div);
        });
    }
    
    // Botón Admin
    if(usuarioActual.rol === 'admin') document.getElementById('admin-add-company').style.display = 'block';
}

// CARGAR DASHBOARD PRINCIPAL
async function cargarDashboard(empresa) {
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex'; // O block en móvil (CSS maneja esto)

    // Header Sidebar
    document.getElementById('header-empresa').innerHTML = `<img src="${empresa.logo_url}" style="width:80px; margin-bottom:5px;"><h3>${empresa.nombre}</h3>`;
    document.getElementById('user-email').textContent = usuarioActual.email;

    // Cargar Menú Lateral
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const menuDiv = document.getElementById('menu-dinamico');
    menuDiv.innerHTML = '';

    if(menus) {
        menus.forEach(m => {
            const row = document.createElement('div');
            row.className = 'menu-item-row';
            row.innerHTML = `<i class="fas ${m.icono}"></i> <span>${m.titulo}</span>`;
            row.onclick = () => {
                // Cerrar menú móvil si está abierto
                document.getElementById('mySidebar').classList.remove('active');
                
                // Lógica de carga de módulos
                const titulo = m.titulo.toLowerCase();
                const ws = document.getElementById('workspace');
                
                if(titulo.includes('trabajador') || titulo.includes('personal') || titulo.includes('ficha')) {
                    cargarModuloTrabajadores(ws, _supabase, empresa);
                } else {
                    ws.innerHTML = `<h2>${m.titulo}</h2><p>Módulo en construcción...</p>`;
                }
            };
            menuDiv.appendChild(row);
        });
    }
}

// FUNCIÓN GLOBAL MENU MÓVIL
window.toggleSidebar = () => {
    document.getElementById('mySidebar').classList.toggle('active');
};
