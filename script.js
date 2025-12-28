import { iconosSST } from './iconos.js';
import { cargarModuloTrabajadores } from './trabajadores.js'; 

const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N'; // Asegúrate que esta key sea correcta
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FONDO ANIMADO (Corrección para asegurar visibilidad) ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar partículas
    ctx.fillStyle = '#00d2ff';
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        
        // Rebote en bordes
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Líneas de conexión
        for(let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if(dist < 120) {
                ctx.strokeStyle = `rgba(0, 210, 255, ${1 - dist/120})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}

// Iniciar animación inmediatamente
initParticles();
animate();
window.addEventListener('resize', initParticles);

// --- LOGICA DEL SISTEMA ---
let usuarioActual = null;
let empresaActual = null;

// Login
document.getElementById('login-button').onclick = async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    const { data } = await _supabase.from('autorizados').select('*').eq('email', email).single();
    if(data){
        usuarioActual = data;
        localStorage.setItem('userSST', JSON.stringify(data));
        mostrarSeleccionEmpresa();
    } else { alert("Usuario no autorizado"); }
};

// Selección de Empresa
async function mostrarSeleccionEmpresa() {
    document.getElementById('start-container').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('company-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none'; // Ocultar dashboard

    if(usuarioActual.rol === 'admin') document.querySelectorAll('.admin-only').forEach(e => e.style.display='block');

    const { data: empresas } = await _supabase.from('empresas').select('*');
    const list = document.getElementById('lista-empresas');
    list.innerHTML = '';
    
    empresas?.forEach(emp => {
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.innerHTML = `<img src="${emp.logo_url}" style="width:60px;"><span>${emp.nombre}</span>`;
        div.onclick = () => cargarDashboard(emp);
        list.appendChild(div);
    });
}

// Cargar Dashboard (Sidebar Izquierda)
async function cargarDashboard(empresa) {
    empresaActual = empresa;
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex'; // FLEX para sidebar

    document.getElementById('header-empresa').innerHTML = `<img src="${empresa.logo_url}" style="width:100px; margin:0 auto; display:block; margin-bottom:10px;">`;
    document.getElementById('user-email').textContent = usuarioActual.email;
    document.getElementById('workspace').innerHTML = '<h2>Bienvenido</h2><p>Seleccione una opción del menú.</p>';

    // Cargar Menú
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const menuDiv = document.getElementById('menu-dinamico');
    menuDiv.innerHTML = '';

    menus?.forEach(m => {
        if(m.solo_admin && usuarioActual.rol !== 'admin') return;
        
        const row = document.createElement('div');
        row.className = 'menu-item-row';
        row.innerHTML = `<i class="fas ${m.icono}"></i> <span>${m.titulo}</span>`;
        
        row.onclick = () => {
            // DETECTAR SI ES TRABAJADORES
            const titulo = m.titulo.toLowerCase();
            const ws = document.getElementById('workspace');
            
            if(titulo.includes('trabajador') || titulo.includes('personal') || titulo.includes('rrhh')) {
                // Llamamos al módulo externo
                cargarModuloTrabajadores(ws, _supabase, empresaActual);
            } else {
                ws.innerHTML = `<h2>${m.titulo}</h2><p>Módulo en construcción.</p>`;
            }
        };
        menuDiv.appendChild(row);
    });
}

// Funciones Admin
document.getElementById('admin-add-company').onclick = async () => {
    const n = prompt("Nombre:"); const l = prompt("URL Logo:");
    if(n && l) { await _supabase.from('empresas').insert([{nombre:n, logo_url:l}]); mostrarSeleccionEmpresa(); }
};

document.getElementById('admin-add-menu').onclick = () => {
    document.getElementById('modal-iconos').style.display = 'flex';
    const l = document.getElementById('lista-iconos'); l.innerHTML='';
    iconosSST.forEach(icon => {
        const d = document.createElement('div'); d.className='menu-card'; d.innerHTML=`<i class="fas ${icon}"></i>`;
        d.onclick=async()=>{
            const t = prompt("Título:");
            if(t){ await _supabase.from('config_menus').insert([{titulo:t, icono:icon, solo_admin:confirm("¿Admin?"), color:'#00d2ff'}]); location.reload(); }
        };
        l.appendChild(d);
    });
};

window.regresarAEmpresas = () => mostrarSeleccionEmpresa();
document.getElementById('logout-button').onclick = () => { localStorage.clear(); location.reload(); };

const sesion = localStorage.getItem('userSST');
if(sesion){ usuarioActual = JSON.parse(sesion); mostrarSeleccionEmpresa(); }
