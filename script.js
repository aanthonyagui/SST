import { iconosSST } from './iconos.js';
import { cargarModuloTrabajadores } from './trabajadores.js'; // Asegúrate que este archivo exista

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
    for(let i=0; i<50; i++) particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, size: Math.random()*2 });
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
window.addEventListener('resize', initParticles);

// --- VARIABLES ---
let usuarioActual = null;
let empresaActual = null;

// --- LOGIN ---
document.getElementById('login-button').onclick = async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    if(!email) return alert("Escribe tu correo");
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

    if(usuarioActual.rol === 'admin') document.querySelectorAll('.admin-only').forEach(el => el.style.display='block');

    const { data: empresas } = await _supabase.from('empresas').select('*');
    const list = document.getElementById('lista-empresas');
    list.innerHTML = '';
    
    empresas?.forEach(emp => {
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.innerHTML = `<img src="${emp.logo_url}" onerror="this.src='https://via.placeholder.com/50'"><span>${emp.nombre}</span>`;
        div.onclick = () => cargarDashboard(emp);
        list.appendChild(div);
    });
}

// --- DASHBOARD ---
async function cargarDashboard(empresa) {
    empresaActual = empresa;
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex';

    document.getElementById('header-empresa').innerHTML = `<img src="${empresa.logo_url}" style="width:100px; display:block; margin:0 auto 10px auto;"><h3 style="margin:0; color:#00d2ff; text-align:center;">${empresa.nombre}</h3>`;
    document.getElementById('user-email').textContent = usuarioActual.email;
    document.getElementById('workspace').innerHTML = '<h2>Bienvenido</h2><p>Seleccione una opción del menú izquierdo.</p>';

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
            // DETECCIÓN DE MÓDULO TRABAJADORES
            const titulo = m.titulo.toLowerCase();
            const ws = document.getElementById('workspace');
            
            // Cerrar menú móvil si está abierto
            if(window.innerWidth <= 768) toggleMenu();

            if(titulo.includes('trabajador') || titulo.includes('personal') || titulo.includes('rrhh') || titulo.includes('socio')) {
                // AQUÍ CARGAMOS EL MÓDULO EXTERNO
                cargarModuloTrabajadores(ws, _supabase, empresaActual);
            } else {
                ws.innerHTML = `<h2>${m.titulo}</h2><p>Módulo en construcción para ${empresa.nombre}.</p>`;
            }
        };
        menuDiv.appendChild(row);
    });
}

// FUNCIONES ADMIN
document.getElementById('admin-add-company').onclick = async () => {
    const n = prompt("Nombre Empresa:"); const l = prompt("URL Logo:");
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

// --- LÓGICA DEL MENÚ MÓVIL ---
window.toggleMenu = () => {
    const sidebar = document.getElementById('mySidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
    } else {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
    }
};

window.regresarAEmpresas = () => mostrarSeleccionEmpresa();
document.getElementById('logout-button').onclick = () => { localStorage.clear(); location.reload(); };

const sesion = localStorage.getItem('userSST');
if(sesion){ usuarioActual = JSON.parse(sesion); mostrarSeleccionEmpresa(); }
