import { iconosSST } from './iconos.js';

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

// --- LÓGICA DE NAVEGACIÓN ---
let usuarioActual = null;

const loginBtn = document.getElementById('login-button');
loginBtn.onclick = async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    const { data } = await _supabase.from('autorizados').select('*').eq('email', email).single();
    if(data){
        usuarioActual = data;
        localStorage.setItem('userSST', JSON.stringify(data));
        mostrarSeleccionEmpresa();
    } else { alert("Usuario no autorizado"); }
};

async function mostrarSeleccionEmpresa() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'none';
    document.getElementById('company-section').style.display = 'block';

    if(usuarioActual.rol === 'admin') document.getElementById('admin-add-company').style.display = 'block';

    const { data: empresas } = await _supabase.from('empresas').select('*');
    const contenedor = document.getElementById('lista-empresas');
    contenedor.innerHTML = '';

    empresas?.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `<img src="${emp.logo_url || 'https://via.placeholder.com/50'}" onerror="this.src='https://via.placeholder.com/50'"><span>${emp.nombre}</span>`;
        card.onclick = () => mostrarMenuPrincipal(emp);
        contenedor.appendChild(card);
    });
}

async function mostrarMenuPrincipal(empresa) {
    document.getElementById('company-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    
    document.getElementById('header-empresa').innerHTML = `
        <img src="${empresa.logo_url}" style="width:60px; margin-bottom:10px;">
        <h4>${empresa.nombre}</h4>
    `;
    
    document.getElementById('user-email').textContent = usuarioActual.email;
    if(usuarioActual.rol === 'admin') document.getElementById('admin-add-menu').style.display = 'block';

    const { data: menus } = await _supabase.from('config_menus').select('*');
    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = '';
    menus?.forEach(m => {
        if(m.solo_admin && usuarioActual.rol !== 'admin') return;
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `<i class="fas ${m.icono}"></i><span>${m.titulo}</span>`;
        contenedor.appendChild(card);
    });
}

// --- ACCIONES DE ADMIN ---
document.getElementById('admin-add-company').onclick = async () => {
    const nombre = prompt("Nombre de la empresa:");
    const logo_url = prompt("URL del logo (Link de la imagen):");
    if(nombre && logo_url) {
        await _supabase.from('empresas').insert([{ nombre, logo_url }]);
        mostrarSeleccionEmpresa();
    }
};

document.getElementById('admin-add-menu').onclick = () => {
    document.getElementById('modal-iconos').style.display = 'flex';
    const lista = document.getElementById('lista-iconos');
    lista.innerHTML = '';
    iconosSST.forEach(icon => {
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.innerHTML = `<i class="fas ${icon}"></i>`;
        div.onclick = async () => {
            const titulo = prompt("Título de la función:");
            if(titulo) {
                await _supabase.from('config_menus').insert([{ titulo, icono: icon, solo_admin: confirm("¿Solo Admin?"), color: '#00d2ff' }]);
                location.reload();
            }
        };
        lista.appendChild(div);
    });
};

window.regresarAEmpresas = () => mostrarSeleccionEmpresa();
document.getElementById('btn-cerrar-modal').onclick = () => document.getElementById('modal-iconos').style.display = 'none';
document.getElementById('logout-button').onclick = () => { localStorage.clear(); location.reload(); };

const sesion = localStorage.getItem('userSST');
if(sesion) { usuarioActual = JSON.parse(sesion); mostrarSeleccionEmpresa(); }
