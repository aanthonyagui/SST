// 1. CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://pyvasykgetphdjvbijqe.supabase.co';
const SUPABASE_KEY = 'sb_publishable__UMvHXVhw5-se2Lik_A3pQ_TIRd8P-N';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. ANIMACIÓN DE ÁTOMOS / GALAXIA (FONDO)
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
initParticles();
animate();
window.addEventListener('resize', initParticles);

// 3. LÓGICA DE INICIO DE SESIÓN
const loginBtn = document.getElementById('login-button');

loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.toLowerCase().trim();
    if (!email) {
        alert("Por favor, ingrese un correo.");
        return;
    }

    const { data, error } = await _supabase
        .from('autorizados')
        .select('*')
        .eq('email', email)
        .single();

    if (data) {
        localStorage.setItem('userSST', JSON.stringify(data));
        mostrarMenu(data);
    } else {
        alert("Acceso denegatedo: Correo no autorizado.");
    }
});

// 4. CARGAR MENÚS DINÁMICOS DESDE SUPABASE
async function mostrarMenu(user) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('user-email').textContent = user.email;

    // Obtener los botones del menú desde la tabla 'config_menus'
    const { data: menus, error } = await _supabase
        .from('config_menus')
        .select('*');

    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = ''; // Limpiar antes de cargar

    if (menus) {
        menus.forEach(m => {
            // Si el botón es solo para admin y el usuario actual no lo es, saltarlo
            if (m.solo_admin && user.rol !== 'admin') return;

            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                <i class="fas ${m.icono}"></i>
                <span>${m.titulo}</span>
            `;
            // Acción al hacer clic (aquí podrías abrir diferentes formularios en el futuro)
            card.onclick = () => alert("Abriendo módulo: " + m.titulo);
            contenedor.appendChild(card);
        });
    }

    // Mostrar botón de "Agregar Función" solo si el rol es admin
    if (user.rol === 'admin') {
        document.getElementById('admin-add-menu').style.display = 'block';
        document.getElementById('user-role').textContent = '(ADMINISTRADOR)';
    }
}

// 5. FUNCIÓN PARA QUE EL ADMIN AGREGUE NUEVOS MENÚS
document.getElementById('admin-add-menu').onclick = async () => {
    const titulo = prompt("Nombre de la nueva función (Ej: Reportar Accidente):");
    const icono = prompt("Icono de FontAwesome (Ej: fa-helmet-safety):");
    const soloAdmin = confirm("¿Esta función es SOLO para administradores?");

    if (titulo && icono) {
        const { error } = await _supabase
            .from('config_menus')
            .insert([{ 
                titulo: titulo, 
                icono: icono, 
                solo_admin: soloAdmin, 
                color: '#00d2ff' 
            }]);

        if (error) {
            alert("Error al guardar: " + error.message);
        } else {
            alert("Nueva función agregada con éxito.");
            location.reload(); // Recargar para mostrar el nuevo botón
        }
    }
};

// 6. CERRAR SESIÓN
document.getElementById('logout-button').onclick = () => {
    localStorage.clear();
    location.reload();
};

// 7. AUTO-LOGIN (PERSISTENCIA)
const sesionGuardada = localStorage.getItem('userSST');
if (sesionGuardada) {
    mostrarMenu(JSON.parse(sesionGuardada));
}
