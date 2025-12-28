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
    for(let i=0; i<70; i++) {
        particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, size: 1.5 });
    }
}
function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#00d2ff'; ctx.strokeStyle='rgba(0,210,255,0.1)';
    particles.forEach((p,i)=>{
        p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>canvas.width) p.vx*=-1; if(p.y<0||p.y>canvas.height) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
        for(let j=i+1; j<particles.length; j++){
            let p2=particles[j]; let d=Math.hypot(p.x-p2.x,p.y-p2.y);
            if(d<100){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); }
        }
    });
    requestAnimationFrame(animate);
}
initParticles(); animate();

// --- LÓGICA DE USUARIO ---
const loginBtn = document.getElementById('login-button');
loginBtn.onclick = async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    const { data } = await _supabase.from('autorizados').select('*').eq('email', email).single();
    if(data){ localStorage.setItem('userSST', JSON.stringify(data)); mostrarMenu(data); }
    else{ alert("No autorizado"); }
};

async function mostrarMenu(user) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('user-email').textContent = user.email;
    if(user.rol === 'admin') {
        document.getElementById('admin-add-menu').style.display = 'block';
        document.getElementById('user-role').textContent = '(ADMIN)';
    }
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = '';
    menus?.forEach(m => {
        if(m.solo_admin && user.rol !== 'admin') return;
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `<i class="fas ${m.icono}"></i><span>${m.titulo}</span>`;
        contenedor.appendChild(card);
    });
}

// --- GESTIÓN DE MENÚS (ADMIN) ---
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
            if(titulo){
                await _supabase.from('config_menus').insert([{ titulo, icono: icon, solo_admin: confirm("¿Solo Admin?"), color: '#00d2ff' }]);
                location.reload();
            }
        };
        lista.appendChild(div);
    });
};

document.getElementById('btn-cerrar-modal').onclick = () => document.getElementById('modal-iconos').style.display = 'none';
document.getElementById('logout-button').onclick = () => { localStorage.clear(); location.reload(); };

const sesion = localStorage.getItem('userSST');
if(sesion) mostrarMenu(JSON.parse(sesion));
