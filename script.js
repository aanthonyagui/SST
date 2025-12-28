import { iconosSST } from './iconos.js';
import { cargarModuloTrabajadores } from './trabajadores.js'; // IMPORTACIÓN CLAVE

const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FONDO ANIMADO ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let particles = [];
function initParticles() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<60; i++) particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, size: 1.5 });
}
function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#00d2ff';
    particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>canvas.width) p.vx*=-1; if(p.y<0||p.y>canvas.height) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(animate);
}
initParticles(); animate();

// --- VARIABLES ---
let usuarioActual = null;
let empresaActual = null;

// --- LOGIN ---
document.getElementById('login-button').onclick = async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    const { data } = await _supabase.from('autorizados').select('*').eq('email', email).single();
    if(data){
        usuarioActual = data;
        localStorage.setItem('userSST', JSON.stringify(data));
        mostrarSeleccionEmpresa();
    } else { alert("Usuario no autorizado"); }
};

// --- SELECCIÓN EMPRESA ---
async function mostrarSeleccionEmpresa() {
    document.getElementById('start-container').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('company-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none';

    if(usuarioActual.rol === 'admin') document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');

    const { data: empresas } = await _supabase.from('empresas').select('*');
    const contenedor = document.getElementById('lista-empresas');
    contenedor.innerHTML = '';

    empresas?.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `<img src="${emp.logo_url}" onerror="this.src='https://via.placeholder.com/50'"><span>${emp.nombre}</span>`;
        card.onclick = () => mostrarMenuPrincipal(emp);
        contenedor.appendChild(card);
    });
}

// --- DASHBOARD PRINCIPAL ---
async function mostrarMenuPrincipal(empresa) {
    empresaActual = empresa;
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex';
    
    // Header Sidebar
    document.getElementById('header-empresa').innerHTML = `<img src="${empresa.logo_url}"><h3 style="margin:5px 0; color:#00d2ff;">${empresa.nombre}</h3>`;
    document.getElementById('user-email').textContent = usuarioActual.email;
    document.getElementById('workspace').innerHTML = '<h2>Bienvenido</h2><p>Seleccione una opción del menú izquierdo.</p>';

    // Menú Lateral
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = '';
    
    menus?.forEach(m => {
        if(m.solo_admin && usuarioActual.rol !== 'admin') return;
        const row = document.createElement('div');
        row.className = 'menu-item-row';
        row.innerHTML = `<i class="fas ${m.icono}"></i><span>${m.titulo}</span>`;
        
        row.onclick = () => {
            // AQUÍ LLAMAMOS AL MÓDULO EXTERNO
            const titulo = m.titulo.toLowerCase();
            const zonaTrabajo = document.getElementById('workspace');

            if (titulo.includes('trabajador') || titulo.includes('personal') || titulo.includes('rrhh')) {
                // Pasamos la zona, la conexión supabase y la empresa actual al módulo
                cargarModuloTrabajadores(zonaTrabajo, _supabase, empresaActual);
            } else {
                zonaTrabajo.innerHTML = `<h2>${m.titulo}</h2><p>Módulo en construcción.</p>`;
            }
        };
        contenedor.appendChild(row);
    });
}

// --- ADMIN FUNCIONES ---
document.getElementById('admin-add-company').onclick = async () => {
    const nombre = prompt("Nombre:"); const logo = prompt("URL Logo:");
    if(nombre && logo) { await _supabase.from('empresas').insert([{ nombre, logo_url: logo }]); mostrarSeleccionEmpresa(); }
};

document.getElementById('admin-add-menu').onclick = () => {
    document.getElementById('modal-iconos').style.display = 'flex';
    const lista = document.getElementById('lista-iconos'); lista.innerHTML = '';
    iconosSST.forEach(icon => {
        const div = document.createElement('div'); div.className = 'menu-card'; div.innerHTML = `<i class="fas ${icon}"></i>`;
        div.onclick = async () => {
            const titulo = prompt("Título:");
            if(titulo) { await _supabase.from('config_menus').insert([{ titulo, icono: icon, solo_admin: confirm("¿Solo Admin?"), color: '#00d2ff' }]); location.reload(); }
        };
        lista.appendChild(div);
    });
};

window.regresarAEmpresas = () => mostrarSeleccionEmpresa();
document.getElementById('logout-button').onclick = () => { localStorage.clear(); location.reload(); };

const sesion = localStorage.getItem('userSST');
if(sesion) { usuarioActual = JSON.parse(sesion); mostrarSeleccionEmpresa(); }
