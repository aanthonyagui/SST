import { iconosSST } from './iconos.js';
import { cargarModuloTrabajadores } from './trabajadores.js'; // IMPORTAMOS EL NUEVO MÓDULO

// ... (Configuración Supabase, Canvas y Login IGUAL que antes) ...

// ... (Función mostrarSeleccionEmpresa IGUAL que antes) ...

// --- FUNCIÓN DEL MENÚ PRINCIPAL ---
async function mostrarMenuPrincipal(empresa) {
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex';
    
    // Header Sidebar
    document.getElementById('header-empresa').innerHTML = `
        <img src="${empresa.logo_url}" onerror="this.src='https://via.placeholder.com/100'">
        <h3 style="margin:5px 0; color:#00d2ff; font-size:1.1em;">${empresa.nombre}</h3>
    `;
    
    document.getElementById('user-email').textContent = usuarioActual.email;
    document.getElementById('workspace').innerHTML = '<h2>Bienvenido</h2><p>Seleccione una opción del menú.</p>';

    // Cargar Menú Lateral
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = '';
    
    menus?.forEach(m => {
        if(m.solo_admin && usuarioActual.rol !== 'admin') return;
        
        const row = document.createElement('div');
        row.className = 'menu-item-row';
        row.innerHTML = `<i class="fas ${m.icono}"></i><span>${m.titulo}</span>`;
        
        row.onclick = () => {
            // DETECTAMOS SI ES EL MENÚ DE TRABAJADORES
            // (Busca si el título contiene "Trabajador" o "Personal", ignora mayúsculas)
            const titulo = m.titulo.toLowerCase();
            const zonaTrabajo = document.getElementById('workspace');

            if (titulo.includes('trabajador') || titulo.includes('personal') || titulo.includes('rrhh')) {
                // CARGAMOS EL MÓDULO EXTERNO
                cargarModuloTrabajadores(_supabase, empresa, zonaTrabajo);
            } else {
                // Muestra genérica para otros menús
                zonaTrabajo.innerHTML = `
                    <h2>${m.titulo}</h2>
                    <p>Módulo en construcción para <b>${empresa.nombre}</b></p>
                `;
            }
        };
        contenedor.appendChild(row);
    });
}

// ... (Resto de funciones Admin y Logout IGUAL que antes) ...
