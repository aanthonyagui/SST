import { cargarModuloTrabajadores } from './trabajadores.js';

// --- SISTEMA DE DIAGNÓSTICO DE ERRORES ---
window.onerror = function(msg, url, line) {
    alert("⚠️ ERROR CRÍTICO DEL SISTEMA:\n" + msg + "\nEn línea: " + line);
    return false;
};

// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N'; // Verifica que sea la correcta
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FONDO ANIMADO ---
try {
    const canvas = document.getElementById('canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const initParticles = () => {
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            particles = [];
            for(let i=0; i<60; i++) particles.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, size: Math.random()*2});
        };
        const animate = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#00d2ff';
            particles.forEach(p=>{
                p.x+=p.vx; p.y+=p.vy;
                if(p.x<0||p.x>canvas.width) p.vx*=-1; if(p.y<0||p.y>canvas.height) p.vy*=-1;
                ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        initParticles(); animate();
        window.addEventListener('resize', initParticles);
    }
} catch (e) { console.error("Error en animación:", e); }

// --- LOGIN ---
let usuarioActual = null;

document.getElementById('login-button').onclick = async () => {
    const btn = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim().toLowerCase();
    
    if(!email) return alert("Por favor escribe un correo.");

    btn.innerHTML = "Verificando...";
    btn.disabled = true;

    try {
        // 1. Intento de Login "Universal" (Backdoor de Emergencia)
        // ÚSALO SI LA BASE DE DATOS FALLA: Escribe 'admin@goldmins.com'
        if(email === 'admin@goldmins.com') {
            usuarioActual = { email: email, rol: 'admin' };
            mostrarSeleccionEmpresa();
            return;
        }

        // 2. Consulta Real a Supabase
        const { data, error } = await _supabase
            .from('autorizados')
            .select('*')
            .eq('email', email)
            .maybeSingle(); // Usamos maybeSingle para evitar errores si no existe

        if (error) throw error;

        if (data) {
            usuarioActual = data;
            mostrarSeleccionEmpresa();
        } else {
            alert("Acceso Denegado: El correo no está en la lista de autorizados.");
            btn.innerHTML = "Ingresar al Sistema";
            btn.disabled = false;
        }

    } catch (err) {
        alert("Error de Conexión: " + err.message);
        btn.innerHTML = "Ingresar al Sistema";
        btn.disabled = false;
    }
};

// --- NAVEGACIÓN ---
async function mostrarSeleccionEmpresa() {
    document.getElementById('start-container').style.display = 'block'; 
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('company-section').style.display = 'block';

    const list = document.getElementById('lista-empresas');
    list.innerHTML = '<p style="color:#aaa;">Cargando empresas...</p>';

    const { data: empresas } = await _supabase.from('empresas').select('*');
    list.innerHTML = '';

    if (empresas && empresas.length > 0) {
        empresas.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'menu-card';
            div.innerHTML = `<img src="${emp.logo_url}" onerror="this.src='https://via.placeholder.com/50'"> <p>${emp.nombre}</p>`;
            div.onclick = () => cargarDashboard(emp);
            list.appendChild(div);
        });
    } else {
        list.innerHTML = '<p>No hay empresas registradas.</p>';
    }
    
    if(usuarioActual.rol === 'admin') {
        const btnAdd = document.getElementById('admin-add-company');
        if(btnAdd) {
            btnAdd.style.display = 'block';
            btnAdd.onclick = async () => {
                const n = prompt("Nombre:"); const l = prompt("URL Logo:");
                if(n) { await _supabase.from('empresas').insert([{nombre:n, logo_url:l}]); mostrarSeleccionEmpresa(); }
            };
        }
    }
}

async function cargarDashboard(empresa) {
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex'; // FLEX para sidebar

    document.getElementById('header-empresa').innerHTML = `<img src="${empresa.logo_url}" style="width:80px; margin-bottom:10px;"><h3>${empresa.nombre}</h3>`;
    document.getElementById('user-email').textContent = usuarioActual.email;

    // Cargar Menú
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const menuDiv = document.getElementById('menu-dinamico');
    menuDiv.innerHTML = '';

    menus?.forEach(m => {
        const row = document.createElement('div');
        row.className = 'menu-item-row';
        row.innerHTML = `<i class="fas ${m.icono}"></i> <span>${m.titulo}</span>`;
        row.onclick = () => {
            // Cerrar menú en móvil
            document.getElementById('mySidebar').classList.remove('active');
            
            const titulo = m.titulo.toLowerCase();
            const ws = document.getElementById('workspace');
            
            if(titulo.includes('trabajador') || titulo.includes('personal') || titulo.includes('ficha')) {
                cargarModuloTrabajadores(ws, _supabase, empresa);
            } else {
                ws.innerHTML = `<h2>${m.titulo}</h2><p>En construcción...</p>`;
            }
        };
        menuDiv.appendChild(row);
    });
}

// Menú Móvil
window.toggleSidebar = () => {
    document.getElementById('mySidebar').classList.toggle('active');
};
