// trabajadores.js
export function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // 1. Inyectar HTML
    contenedor.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Personal: ${empresa.nombre}</h2>
            <button id="btn-nuevo-t" style="width:auto; padding:8px 15px; background:#2ecc71;">
                <i class="fas fa-plus"></i> Nuevo
            </button>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin-bottom:20px;">

        <div id="vista-lista-t">
            <div id="grid-trabajadores" class="worker-grid">Cargando datos...</div>
        </div>

        <div id="vista-form-t" style="display:none; background:rgba(0,0,0,0.4); padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.1);">
            <h3 style="color:#00d2ff; margin-top:0;">Ficha Socioeconómica</h3>
            <form id="form-trabajador">
                <div class="form-grid">
                    <input type="text" id="t-nombre" placeholder="Nombre Completo" required>
                    <input type="text" id="t-cedula" placeholder="Cédula / DNI" required>
                    <input type="text" id="t-cargo" placeholder="Cargo" required>
                    <input type="number" id="t-edad" placeholder="Edad">
                    <select id="t-sangre" style="background:rgba(0,0,0,0.5); color:white; border:1px solid #555; padding:10px; border-radius:8px;">
                        <option value="">Tipo de Sangre</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                    </select>
                    <input type="text" id="t-contacto" placeholder="Contacto Emergencia">
                </div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button type="submit" style="background:#00d2ff; color:black;">Guardar</button>
                    <button type="button" id="btn-cancelar-t" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // 2. Eventos
    const btnNuevo = document.getElementById('btn-nuevo-t');
    const vistaLista = document.getElementById('vista-lista-t');
    const vistaForm = document.getElementById('vista-form-t');

    btnNuevo.onclick = () => {
        vistaLista.style.display = 'none';
        vistaForm.style.display = 'block';
        btnNuevo.style.display = 'none';
    };

    document.getElementById('btn-cancelar-t').onclick = () => {
        vistaForm.style.display = 'none';
        vistaLista.style.display = 'block';
        btnNuevo.style.display = 'block';
    };

    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const datos = {
            nombre: document.getElementById('t-nombre').value,
            cedula: document.getElementById('t-cedula').value,
            cargo: document.getElementById('t-cargo').value,
            edad: document.getElementById('t-edad').value,
            tipo_sangre: document.getElementById('t-sangre').value,
            contacto_emergencia: document.getElementById('t-contacto').value,
            empresa_id: empresa.id
        };

        const { error } = await supabase.from('trabajadores').insert([datos]);
        if (error) alert("Error: " + error.message);
        else {
            alert("Guardado exitosamente");
            document.getElementById('form-trabajador').reset();
            document.getElementById('btn-cancelar-t').click();
            cargarLista(supabase, empresa.id);
        }
    };

    // 3. Cargar datos iniciales
    cargarLista(supabase, empresa.id);
}

async function cargarLista(supabase, idEmpresa) {
    const grid = document.getElementById('grid-trabajadores');
    const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', idEmpresa);
    
    grid.innerHTML = '';
    if (!data || data.length === 0) {
        grid.innerHTML = '<p>No hay trabajadores registrados.</p>';
        return;
    }

    data.forEach(t => {
        const card = document.createElement('div');
        card.className = 'worker-card';
        card.innerHTML = `
            <div class="w-avatar">${t.nombre.charAt(0)}</div>
            <div>
                <h4 style="margin:0; color:white;">${t.nombre}</h4>
                <small style="color:#ccc;">${t.cargo}</small>
            </div>
        `;
        grid.appendChild(card);
    });
}
