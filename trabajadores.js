// trabajadores.js - Módulo de Gestión de Personal

// 1. DIBUJAR LA PANTALLA DE TRABAJADORES
export async function cargarModuloTrabajadores(supabase, empresa, contenedor) {
    contenedor.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2><i class="fas fa-users-hard-hat"></i> Personal: ${empresa.nombre}</h2>
            <button id="btn-nuevo-trabajador" style="width:auto; background:#2ecc71;">
                <i class="fas fa-user-plus"></i> Nueva Ficha
            </button>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="mostrarTab('lista')">Nómina Activa</button>
        </div>

        <div id="vista-lista" style="margin-top:15px;">
            <div id="grid-trabajadores" class="worker-grid">Cargando personal...</div>
        </div>

        <div id="vista-formulario" style="display:none; background:rgba(0,0,0,0.3); padding:20px; border-radius:15px;">
            <h3>Ficha Socioeconómica</h3>
            <form id="form-trabajador">
                <div class="form-grid">
                    <input type="text" id="t-nombre" placeholder="Nombre Completo" required>
                    <input type="text" id="t-cedula" placeholder="Cédula / DNI" required>
                    <input type="text" id="t-cargo" placeholder="Cargo (ej: Perforista)" required>
                    <input type="number" id="t-edad" placeholder="Edad">
                    <select id="t-sangre" style="padding:12px; background:rgba(0,0,0,0.3); color:white; border:1px solid #555; border-radius:8px;">
                        <option value="">Tipo de Sangre</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                    </select>
                    <input type="text" id="t-contacto" placeholder="Contacto Emergencia (Nombre y Tel)">
                </div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button type="submit" style="background:#00d2ff; color:black;">Guardar Ficha</button>
                    <button type="button" id="btn-cancelar" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // Eventos
    document.getElementById('btn-nuevo-trabajador').onclick = () => {
        document.getElementById('vista-lista').style.display = 'none';
        document.getElementById('vista-formulario').style.display = 'block';
    };

    document.getElementById('btn-cancelar').onclick = () => {
        document.getElementById('vista-formulario').style.display = 'none';
        document.getElementById('vista-lista').style.display = 'block';
    };

    // GUARDAR TRABAJADOR
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const datos = {
            nombre: document.getElementById('t-nombre').value,
            cedula: document.getElementById('t-cedula').value,
            cargo: document.getElementById('t-cargo').value,
            edad: document.getElementById('t-edad').value,
            tipo_sangre: document.getElementById('t-sangre').value,
            contacto_emergencia: document.getElementById('t-contacto').value,
            empresa_id: empresa.id // Vinculamos a la empresa actual
        };

        const { error } = await supabase.from('trabajadores').insert([datos]);
        
        if (error) alert("Error al guardar: " + error.message);
        else {
            alert("Trabajador registrado correctamente");
            document.getElementById('vista-formulario').style.display = 'none';
            document.getElementById('vista-lista').style.display = 'block';
            document.getElementById('form-trabajador').reset();
            cargarListaTrabajadores(supabase, empresa.id); // Recargar lista
        }
    };

    // Cargar lista inicial
    cargarListaTrabajadores(supabase, empresa.id);
}

// 2. FUNCIÓN PARA LEER Y MOSTRAR LA LISTA
async function cargarListaTrabajadores(supabase, empresaId) {
    const grid = document.getElementById('grid-trabajadores');
    grid.innerHTML = '<p>Buscando...</p>';

    const { data: lista, error } = await supabase
        .from('trabajadores')
        .select('*')
        .eq('empresa_id', empresaId);

    if (error) {
        grid.innerHTML = 'Error cargando datos.';
        return;
    }

    if (lista.length === 0) {
        grid.innerHTML = '<p>No hay trabajadores registrados en esta empresa.</p>';
        return;
    }

    grid.innerHTML = '';
    lista.forEach(t => {
        const card = document.createElement('div');
        card.className = 'worker-card';
        card.innerHTML = `
            <div class="w-avatar">${t.nombre.charAt(0)}</div>
            <div class="w-info">
                <h4>${t.nombre}</h4>
                <p>${t.cargo} | CC: ${t.cedula}</p>
                <small style="color:#aaa;">Sangre: ${t.tipo_sangre || 'N/A'}</small>
            </div>
        `;
        grid.appendChild(card);
    });
}
