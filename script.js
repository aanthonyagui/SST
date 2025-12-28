import { cargarModuloTrabajadores } from './trabajadores.js';

// CONEXIÓN SUPABASE
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N'; // VERIFICA QUE ESTA KEY SEA CORRECTA
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// FONDO ANIMADO
try {
    const cvs = document.getElementById('canvas-bg');
    if(cvs) {
        const ctx = cvs.getContext('2d');
        let pts = [];
        const init = () => { cvs.width=window.innerWidth; cvs.height=window.innerHeight; pts=[]; for(let i=0;i<50;i++) pts.push({x:Math.random()*cvs.width, y:Math.random()*cvs.height, vx:(Math.random()-0.5), vy:(Math.random()-0.5)}); };
        const anim = () => { ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle='#00d2ff'; pts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>cvs.width) p.vx*=-1; if(p.y<0||p.y>cvs.height) p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,6.28); ctx.fill(); }); requestAnimationFrame(anim); };
        init(); anim(); window.onresize=init;
    }
} catch(e){}

// LOGIN
let usuarioActual = null;
document.getElementById('login-button').onclick = async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    if(!email) return alert("Escribe un correo");

    const { data, error } = await _supabase.from('autorizados').select('*').eq('email', email).single();
    
    // BACKDOOR: Si falla la BD o no existe, permitir admin por defecto (SOLO PARA PRUEBAS)
    if(data || email === 'admin@goldmins.com') {
        usuarioActual = data || { email: 'admin@goldmins.com', rol: 'admin' };
        mostrarEmpresas();
    } else {
        alert("Usuario no autorizado.");
    }
};

async function mostrarEmpresas() {
    document.getElementById('start-container').style.display='block';
    document.getElementById('login-section').style.display='none';
    document.getElementById('company-section').style.display='block';
    
    const list = document.getElementById('lista-empresas');
    list.innerHTML = '<p style="color:#aaa;">Cargando...</p>';
    
    const { data: empresas } = await _supabase.from('empresas').select('*');
    list.innerHTML = '';
    
    if(empresas && empresas.length > 0) {
        empresas.forEach(emp => {
            const d = document.createElement('div');
            d.className = 'menu-card';
            // Placeholder si la imagen está rota
            d.innerHTML = `<img src="${emp.logo_url}" onerror="this.src='https://via.placeholder.com/100?text=LOGO'"> <p>${emp.nombre}</p>`;
            d.onclick = () => entrarApp(emp);
            list.appendChild(d);
        });
    } else {
        list.innerHTML = '<p>No hay empresas. Agrega una.</p>';
    }

    if(usuarioActual.rol === 'admin') {
        const btn = document.getElementById('admin-add-company');
        btn.style.display = 'block';
        btn.onclick = async () => {
            const n = prompt("Nombre Empresa:"); const l = prompt("URL Logo:");
            if(n) { await _supabase.from('empresas').insert([{nombre:n, logo_url:l}]); mostrarEmpresas(); }
        }
    }
}

async function entrarApp(empresa) {
    document.getElementById('start-container').style.display='none';
    document.getElementById('app-section').style.display='flex';
    
    document.getElementById('header-empresa').innerHTML = `<img src="${empresa.logo_url}" style="width:70px; display:block; margin:0 auto;"><h4 style="margin:5px 0; text-align:center;">${empresa.nombre}</h4>`;
    document.getElementById('user-email').innerText = usuarioActual.email;

    const menu = document.getElementById('menu-dinamico');
    const { data: menus } = await _supabase.from('config_menus').select('*');
    menu.innerHTML = '';

    menus?.forEach(m => {
        const d = document.createElement('div');
        d.className = 'menu-item-row';
        d.innerHTML = `<i class="fas ${m.icono}"></i> <span>${m.titulo}</span>`;
        d.onclick = () => {
            document.getElementById('mySidebar').classList.remove('active'); // Cerrar en móvil
            const t = m.titulo.toLowerCase();
            const ws = document.getElementById('workspace');
            if(t.includes('trabajador') || t.includes('personal') || t.includes('ficha')) {
                cargarModuloTrabajadores(ws, _supabase, empresa);
            } else {
                ws.innerHTML = `<h2>${m.titulo}</h2><p>En construcción...</p>`;
            }
        };
        menu.appendChild(d);
    });
}

window.toggleSidebar = () => document.getElementById('mySidebar').classList.toggle('active');
