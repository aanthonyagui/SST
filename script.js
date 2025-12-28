import { iconosSST } from './iconos.js';

const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. FONDO ANIMADO DE ÁTOMOS ---
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
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: 1.5
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00d2ff';
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.1)';
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
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

initParticles();
animate();
window.addEventListener('resize', initParticles);

// --- 2. LÓGICA DE USUARIO Y NAVEGACIÓN ---
let usuarioActual = null;
let empresaSeleccionada = null;

const loginBtn = document.getElementById('login-button');

loginBtn.onclick = async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    if (!email) return alert("Por favor, ingrese su correo.");

    const { data, error } = await _supabase
        .from('autorizados')
        .select('*')
        .eq('email', email)
        .single();

    if (data) {
        usuarioActual = data;
        localStorage.setItem('userSST', JSON.stringify(data));
        mostrarSeleccionEmpresa();
    } else {
        alert("Usuario no autorizado en el sistema de SST.");
    }
};

// --- 3. SELECCIÓN DE EMPRESA ---
async function mostrarSeleccionEmpresa() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'none';
    document.getElementById('company-section').style.display = 'block';
    
    // Mostrar botón de agregar empresa solo si es admin
    if (usuarioActual.rol === 'admin') {
        document.getElementById('admin-add-company').style.display = 'block';
    }

    const { data: empresas, error } = await _supabase.from('empresas').select('*');
    const contenedor = document.getElementById('lista-empresas');
    contenedor.innerHTML = '';

    if (empresas) {
        empresas.forEach(emp => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                <img src="${emp.logo_url}" onerror="this.src='https://via.placeholder.com/100?text=Logo'">
                <span>${emp.nombre}</span>
            `;
            card.onclick = () => mostrarMenuPrincipal(emp);
            contenedor.appendChild(card);
        });
    }
}

// --- 4. MENÚ PRINCIPAL DE LA EMPRESA ---
async function mostrarMenuPrincipal(empresa) {
    empresaSeleccionada = empresa;
    document.getElementById('company-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    
    // Encabezado con logo grande
    document.getElementById('header-empresa').innerHTML = `
        <img src="${empresa.logo_url}" onerror="this.src='https://via.placeholder.com/100?text=Logo'">
        <br><b>${empresa.nombre}</b>
    `;
    
    document.getElementById('user-email').textContent = usuarioActual.email;
    document.getElementById('user-role').textContent = usuarioActual.rol === 'admin' ? '(ADMINISTRADOR)' : '(USUARIO)';

    // Cargar menús dinámicos
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = '';

    if (menus) {
        menus.forEach(m => {
            if (m.solo_admin && usuarioActual.rol !== 'admin') return;
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `<i class="fas ${m.icono}"></i><span>${m.titulo}</span>`;
            card.onclick = () => alert(`Abriendo ${m.titulo} para ${empresa.nombre}`);
            contenedor.appendChild(card);
        });
    }

    // Mostrar botón de agregar menú solo si es admin
    if (usuarioActual.rol === 'admin') {
        document.getElementById('admin-add-menu').style.display = 'block';
    }
}

// --- 5. FUNCIONES DE ADMINISTRADOR ---

// Agregar nueva empresa
document.getElementById('admin-add-company').onclick = async () => {
    const nombre = prompt("Nombre de la nueva empresa:");
    const logo = prompt("URL del logo (Link directo de la imagen):");
    if (nombre && logo) {
        const { error } = await _supabase
            .from('empresas')
            .insert([{ nombre: nombre, logo_url: logo }]);
        
        if (!error) mostrarSeleccionEmpresa();
        else alert("Error al guardar empresa: " + error.message);
    }
};

// Agregar nueva función al menú (Selector de iconos)
document.getElementById('admin-add-menu').onclick = () => {
    document.getElementById('modal-iconos').style.display = 'flex';
    const lista = document.getElementById('lista-iconos');
    lista.innerHTML = '';
    
    iconosSST.forEach(icon => {
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.style.padding = '10px';
        div.innerHTML = `<i class="fas ${icon}" style="font-size: 24px;"></i>`;
        div.onclick = async () => {
            const titulo = prompt("Título de la nueva función:");
            if (titulo) {
                const soloAdmin = confirm("¿Esta función es SOLO para administradores?");
                const { error } = await _supabase
                    .from('config_menus')
                    .insert([{ titulo: titulo, icono: icon, solo_admin: soloAdmin, color: '#00d2ff' }]);
                
                if (!error) location.reload();
                else alert("Error al guardar menú: " + error.message);
            }
        };
        lista.appendChild(div);
    });
};

// --- 6. UTILIDADES ---
window.regresarAEmpresas = () => {
    empresaSeleccionada = null;
    mostrarSeleccionEmpresa();
};

document.getElementById('logout-button').onclick = () => {
    localStorage.clear();
    location.reload();
};

// Auto-login al cargar página
const sesionGuardada = localStorage.getItem('userSST');
if (sesionGuardada) {
    usuarioActual = JSON.parse(sesionGuardada);
    mostrarSeleccionEmpresa();
}
