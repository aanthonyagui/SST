// admin.js - PANEL DE CONTROL (CORRECCIÓN DE CLIC EN USUARIOS)
export async function cargarModuloAdmin(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2><i class="fas fa-tools"></i> Administración Central</h2>
            <p style="color: #aaa;">Panel de control de ${empresa.nombre}</p>
        </div>

        <div class="worker-grid">
            <div class="worker-card" id="btn-admin-org">
                <div class="w-avatar" style="background: #00d2ff; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-sitemap" style="color: black;"></i>
                </div>
                <div><h4 style="margin:0">Organigrama</h4><small>Cargos y Áreas</small></div>
            </div>

            <div class="worker-card" id="btn-admin-users">
                <div class="w-avatar" style="background: #f1c40f; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-users-cog" style="color: black;"></i>
                </div>
                <div><h4 style="margin:0">Usuarios</h4><small>Roles y Permisos</small></div>
            </div>

            <div class="worker-card" id="btn-admin-emp">
                <div class="w-avatar" style="background: #2ecc71; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-industry" style="color: black;"></i>
                </div>
                <div><h4 style="margin:0">Empresa</h4><small>Datos Legales</small></div>
            </div>
        </div>

        <div id="admin-sub-workspace" style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 15px; border: 1px solid #444;">
            <p style="text-align:center; color:#666;">Seleccione una sección para configurar.</p>
        </div>
    `;

    const subWs = document.getElementById('admin-sub-workspace');

    // --- ASIGNACIÓN DE EVENTOS (MEJOR QUE ONCLICK EN HTML) ---
    document.getElementById('btn-admin-org').onclick = () => renderOrganigrama(subWs);
    document.getElementById('btn-admin-users').onclick = () => renderUsuarios(subWs);
    document.getElementById('btn-admin-emp').onclick = () => renderEmpresa(subWs);

    // --- 1. ORGANIGRAMA ---
    async function renderOrganigrama(ws) {
        ws.innerHTML = '<p>Cargando estructura...</p>';
        const { data: cargos, error } = await supabase.from('cargos').select('*').order('departamento');
        if(error) return ws.innerHTML = `<p style="color:red">Error en Cargos: ${error.message}</p>`;

        const departamentos = {};
        cargos?.forEach(c => {
            const dep = c.departamento || 'SIN CLASIFICAR';
            if (!departamentos[dep]) departamentos[dep] = [];
            departamentos[dep].push(c);
        });

        ws.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#00d2ff;">Organigrama</h3>
                <button id="btn-nuevo-cargo" style="width:auto; padding:8px 15px; background:#00d2ff; color:black;">+ NUEVO CARGO</button>
            </div>
            <div id="tree-container"></div>
        `;

        document.getElementById('btn-nuevo-cargo').onclick = () => window.nuevoCargo();

        const tree = document.getElementById('tree-container');
        for (const [dep, lista] of Object.entries(departamentos)) {
            const depDiv = document.createElement('div');
            depDiv.style.marginBottom = '20px';
            depDiv.innerHTML = `
                <div style="background:#333; padding:10px; border-radius:5px; font-weight:bold; border-left:4px solid #00d2ff; color:#00d2ff; margin-bottom:10px;">
                    <i class="fas fa-layer-group"></i> ${dep.toUpperCase()}
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px; padding-left:20px;">
                    ${lista.map(c => `
                        <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:5px; font-size:0.85em; display:flex; justify-content:space-between;">
                            ${c.nombre}
                            <i class="fas fa-times" style="color:#ff4444; cursor:pointer;" onclick="window.eliminarCargo(${c.id})"></i>
                        </div>
                    `).join('')}
                </div>
            `;
            tree.appendChild(depDiv);
        }
    }

    // --- 2. USUARIOS Y ROLES (CORREGIDO) ---
    async function renderUsuarios(ws) {
        ws.innerHTML = '<p>Cargando lista de usuarios...</p>';
        const { data: users, error } = await supabase.from('autorizados').select('*').order('email');
        
        if (error) {
            ws.innerHTML = `<div style="color:#ff4444; padding:10px; background:rgba(255,0,0,0.1); border-radius:10px;">
                <b>Error de Supabase:</b> ${error.message}<br>
                <small>Verifica que la tabla "autorizados" tenga las columnas id, email y rol.</small>
            </div>`;
            return;
        }

        ws.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#f1c40f;">Usuarios Autorizados</h3>
                <button id="btn-nuevo-user" style="width:auto; padding:8px 15px; background:#f1c40f; color:black;">+ AUTORIZAR</button>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.9em; text-align:left;">
                    <thead><tr style="border-bottom:1px solid #444; color:#aaa;">
                        <th style="padding:10px;">CORREO</th>
                        <th>ROL</th>
                        <th>ACCIÓN</th>
                    </tr></thead>
                    <tbody id="body-users"></tbody>
                </table>
            </div>
        `;

        document.getElementById('btn-nuevo-user').onclick = () => window.nuevoUsuario();

        const tbody = document.getElementById('body-users');
        users?.forEach(u => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.innerHTML = `
                <td style="padding:10px;">${u.email}</td>
                <td>
                    <select onchange="window.cambiarRol(${u.id}, this.value)" style="padding:5px; background:#222; color:white; border:1px solid #444; border-radius:5px;">
                        <option value="usuario" ${u.rol === 'usuario' ? 'selected' : ''}>USUARIO</option>
                        <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>ADMIN</option>
                    </select>
                </td>
                <td><i class="fas fa-trash" style="color:#ff4444; cursor:pointer;" onclick="window.eliminarUsuario(${u.id})"></i></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- 3. DATOS DE EMPRESA ---
    async function renderEmpresa(ws) {
        ws.innerHTML = '<p>Consultando datos de empresa...</p>';
        const { data: empData, error } = await supabase.from('empresas').select('*').eq('id', empresa.id).single();
        
        if(error) return ws.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;

        ws.innerHTML = `
            <h3 style="color:#2ecc71; margin-bottom:20px;">Configuración Institucional</h3>
            <div class="seccion-form">
                <label>Nombre Empresa:</label>
                <input type="text" id="edit-emp-nombre" value="${empData.nombre || ''}">
                <label>RUC:</label>
                <input type="text" id="edit-emp-ruc" value="${empData.ruc || ''}">
                <label>Dirección:</label>
                <input type="text" id="edit-emp-ubicacion" value="${empData.ubicacion || ''}">
                <label>URL Logo:</label>
                <input type="text" id="edit-emp-logo" value="${empData.logo_url || ''}">
                <button id="btn-save-emp" style="background:#2ecc71; color:black; margin-top:20px; font-weight:bold; width:100%;">GUARDAR</button>
            </div>
        `;
        document.getElementById('btn-save-emp').onclick = () => window.actualizarEmpresaFull();
    }

    // --- REGISTRO DE FUNCIONES GLOBALES ---
    window.nuevoCargo = async () => {
        const dep = prompt("Departamento (PLANTA, MINA, SST, etc):");
        const nom = prompt("Nombre del Cargo:");
        if (dep && nom) {
            await supabase.from('cargos').insert([{ nombre: nom.toUpperCase(), departamento: dep.toUpperCase() }]);
            renderOrganigrama(subWs);
        }
    };

    window.eliminarCargo = async (id) => { if(confirm("¿Eliminar cargo?")) { await supabase.from('cargos').delete().eq('id', id); renderOrganigrama(subWs); } };

    window.nuevoUsuario = async () => {
        const email = prompt("Correo a autorizar:").toLowerCase().trim();
        if (email) {
            await supabase.from('autorizados').insert([{ email, rol: 'usuario' }]);
            renderUsuarios(subWs);
        }
    };

    window.cambiarRol = async (id, nuevoRol) => {
        const { error } = await supabase.from('autorizados').update({ rol: nuevoRol }).eq('id', id);
        if(!error) alert("Rol actualizado.");
    };

    window.eliminarUsuario = async (id) => { if(confirm("¿Quitar acceso?")) { await supabase.from('autorizados').delete().eq('id', id); renderUsuarios(subWs); } };

    window.actualizarEmpresaFull = async () => {
        const datos = {
            nombre: document.getElementById('edit-emp-nombre').value.toUpperCase(),
            ruc: document.getElementById('edit-emp-ruc').value,
            ubicacion: document.getElementById('edit-emp-ubicacion').value.toUpperCase(),
            logo_url: document.getElementById('edit-emp-logo').value
        };
        const { error } = await supabase.from('empresas').update(datos).eq('id', empresa.id);
        if(!error) { alert("Datos guardados."); location.reload(); }
        else { alert("Error: " + error.message); }
    };
}
