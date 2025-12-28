async function cargarMenusDinamicos(rolUsuario) {
    const contenedor = document.getElementById('menu-dinamico');
    contenedor.innerHTML = ''; // Limpiar

    // Pedir los menús a Supabase
    const { data: menus, error } = await _supabase
        .from('config_menus')
        .select('*');

    if (error) return console.error("Error cargando menús", error);

    menus.forEach(menu => {
        // Si el menú es "solo admin" y el usuario no es admin, no lo mostramos
        if (menu.solo_admin && rolUsuario !== 'admin') return;

        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <i class="fas ${menu.icono}" style="color: ${menu.color}"></i>
            <span>${menu.titulo}</span>
        `;
        
        // Acción al hacer clic
        card.onclick = () => alert(`Abriendo: ${menu.titulo}`);
        
        contenedor.appendChild(card);
    });
}
