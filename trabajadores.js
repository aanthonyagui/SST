// Módulo de Trabajadores

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // 1. Dibujar la estructura HTML (Lista + Formulario Oculto)
    contenedor.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            <button id="btn-nuevo-trab" style="width:auto; background:#2ecc71;">
                <i class="fas fa-user-plus"></i> Nueva Ficha
            </button>
        </div>
        <hr style="border:0; border-top:1px solid #444; margin:15px 0;">

        <div id="vista-lista-t">
            <div id="grid-trabajadores" class="worker-grid">Cargando personal...</div>
        </div>

        <div id="vista-form-t" style="display:none; background:rgba(0,0,0,0.2); padding:20px; border-radius:10px;">
            <h3 style="color:#00d2ff;">Ficha Socioeconómica</h3>
            <form id="form-trabajador">
                <div class="form-grid">
                    <input type="text" id="t-nombre" placeholder="Nombre Completo" required>
                    <input type="text" id="t-cedula" placeholder="Cédula / DNI" required>
                    <input type="text" id="t-cargo" placeholder="Cargo (ej. Perforista)" required>
                    <input type="number" id="t-edad" placeholder="Edad">
                    <select id="t-sangre" style="padding:12px; background:rgba(0,0,0,0.3); color:white; border:1px solid #555; border-radius:8px;">
                        <option value="">Tipo de Sangre</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                    </select>
                    <input type="text" id="t-contacto" placeholder="Contacto Emergencia">
                </div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button type="submit" style="background:#00d2ff; color:black;">Guardar Ficha</button>
                    <button type="button" id="btn-cancelar-t" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // 2. Lógica de Botones (Mostrar/Ocultar)
    document.getElementById('btn-nuevo-trab').onclick = () => {
        document.getElementById('vista-lista-t').style.display = 'none';
        document.getElementById('vista-form-t').style.display = 'block';
        document.getElementById('btn-nuevo-trab').style.display = 'none';
    };

    document.getElementById('btn-cancelar-t').onclick = () => {
        document.getElementById('vista-form-t').style.display = 'none';
        document.getElementById('vista-lista-t').style.display = 'block';
        document.getElementById('btn-nuevo-trab').style.display = 'block';
    };

    // 3. Lógica de Guardar (Submit)
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        
        const datos = {
            nombre: document.getElementById('t-nombre').value,
            cedula: document.getElementById('t-cedula').value,
            cargo: document.getElementById('t-cargo').value,
            edad: document.getElementById('t-edad').value,
            tipo_sangre: document.getElementById('t-sangre').value,
            contacto_emergencia: document.getElementById('t-contacto').value,
            empresa_id: empresa.id // Aquí vinculamos a la empresa
        };

        const { error } = await supabase.from('trabajadores').insert([datos]);

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Trabajador registrado con éxito");
            document.getElementById('form-trabajador').reset();
            document.getElementById('btn-cancelar-t').click(); // Regresar a lista
            listarTrabajadores(supabase, empresa.id); // Recargar lista
        }
    };

    // 4. Cargar lista inicial
    listarTrabajadores(supabase, empresa.id);
}

// Función interna para listar
async function listarTrabajadores(supabase, empresaId) {
    const grid = document.getElementById('grid-trabajadores');
    grid.innerHTML = '<p>Actualizando lista...</p>';

    const { data: lista, error } = await supabase
        .from('trabajadores')
        .select('*')
        .eq('empresa_id', empresaId);

    if (error || !lista) {
        grid.innerHTML = '<p>Error al cargar datos.</p>';
        return;
    }

    if (lista.length === 0) {
        grid.innerHTML = '<p>No hay trabajadores registrados aún.</p>';
        return;
    }

    grid.innerHTML = '';
    lista.forEach(t => {
        const card = document.createElement('div');
        card.className = 'worker-card';
        card.innerHTML = `
            <div class="w-avatar">${t.nombre.charAt(0)}</div>
            <div>
                <h4 style="margin:0; color:white;">${t.nombre}</h4>
                <small style="color:#ccc;">${t.cargo} | CC: ${t.cedula}</small><br>
                <small style="color:#00d2ff;">Sangre: ${t.tipo_sangre || 'N/A'}</small>
            </div>
        `;
        grid.appendChild(card);
    });
}
