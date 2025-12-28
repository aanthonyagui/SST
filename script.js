// ... (Mantén igual la configuración de Supabase y el fondo animado) ...

async function mostrarSeleccionEmpresa() {
    document.getElementById('initial-container').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'none';
    document.getElementById('company-section').style.display = 'block';

    const { data: empresas } = await _supabase.from('empresas').select('*');
    const contenedor = document.getElementById('lista-empresas');
    contenedor.innerHTML = '';

    empresas?.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.innerHTML = `<img src="${emp.logo_url}" onerror="this.src='https://via.placeholder.com/50'"> <br> <span>${emp.nombre}</span>`;
        card.onclick = () => mostrarMenuPrincipal(emp);
        contenedor.appendChild(card);
    });
}

async function mostrarMenuPrincipal(empresa) {
    document.getElementById('initial-container').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex'; // Cambiado a flex para el layout
    
    // Header Sidebar
    document.getElementById('header-empresa').innerHTML = `
        <img src="${empresa.logo_url}">
        <b>${empresa.nombre}</b>
    `;
    
    document.getElementById('user-email-display').textContent = `Sesión: ${usuarioActual.email}`;

    // Menú Lateral Dinámico
    const { data: menus } = await _supabase.from('config_menus').select('*');
    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = '';
    
    menus?.forEach(m => {
        if(m.solo_admin && usuarioActual.rol !== 'admin') return;
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `<i class="fas ${m.icono}"></i> <span>${m.titulo}</span>`;
        card.onclick = () => {
            document.getElementById('dynamic-content').innerHTML = `<h3>Módulo: ${m.titulo}</h3><p>Contenido en desarrollo para ${empresa.nombre}</p>`;
        };
        contenedor.appendChild(card);
    });
}
// ... (Resto de funciones de Admin y Logout iguales) ...
