// admin.js - PANEL DE CONFIGURACIÓN AVANZADA CORREGIDO
export async function cargarModuloAdmin(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2><i class="fas fa-tools"></i> Administración Central</h2>
            <p style="color: #aaa;">Panel de control de ${empresa.nombre}</p>
        </div>

        <div class="worker-grid">
            <div class="worker-card" onclick="seccionAdmin('organigrama')">
                <div class="w-avatar" style="background: #00d2ff; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-sitemap" style="color: black;"></i>
                </div>
                <div><h4 style="margin:0">Organigrama</h4><small>Departamentos y Cargos</small></div>
            </div>

            <div class="worker-card" onclick="seccionAdmin('usuarios')">
                <div class="w-avatar" style="background: #f1c40f; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-users-cog" style="color: black;"></i>
                </div>
                <div><h4 style="margin:0">Usuarios</h4><small>Roles y Permisos</small></div>
            </div>

            <div class="worker-card" onclick="seccionAdmin('empresa')">
                <div class="w-avatar" style="background: #2ecc71; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-industry" style="color: black;"></i>
                </div>
                <div><h4 style="margin:0">Empresa</h4><small>RUC, Logo y Ubicación</small></div>
            </div>
        </div>

        <div id="admin-sub-workspace" style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 15px; border: 1px solid #444;">
            <p style="text-align:center; color:#666;">Seleccione una sección para configurar.</p>
        </div>
    `;

    // --- NAVEGACIÓN INTERNA ---
    window.seccionAdmin = (seccion) => {
        const subWs = document.getElementById('admin-sub-workspace');
        if (seccion === 'organigrama') renderOrganigrama(subWs);
        if (seccion === 'usuarios') renderUsuarios(subWs);
        if (seccion === 'empresa') renderEmpresa(subWs);
    };

    // --- 1. ORGANIGRAMA ---
    async function renderOrganigrama(ws) {
        const { data: cargos } = await supabase.from('cargos').select('*').order('departamento');
        const departamentos = {};
        cargos?.forEach(c => {
            const dep = c.departamento || 'SIN CLASIFICAR';
            if (!departamentos[dep]) departamentos[dep] = [];
            departamentos[dep].push(c);
        });

        ws.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#00d2ff;">Estructura Organizacional</h3>
                <button onclick="nuevoCargo()" style="width:auto; padding:8px 15px; background:#00d2ff; color:black;">+ NUEVO CARGO</button>
            </div>
            <div id="tree-container"></div>
        `;

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
                        <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:5px; font-size:0.9em; display:flex; justify-content:space-between;">
                            ${c.nombre}
                            <i class="fas fa-times" style="color:#ff4444; cursor:pointer;" onclick="eliminarCargo(${c.id})"></i>
                        </div>
                    `).join('')}
                </div>
            `;
            tree.appendChild(depDiv);
        }
    }

    // --- 2. USUARIOS Y ROLES ---
    async function renderUsuarios(ws) {
        ws.innerHTML = '<p>Cargando usuarios...</p>';
        const { data: users, error } = await supabase.from('autorizados').select('*').order('email');
        
        if (error) return ws.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;

        ws.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#f1c40f;">Usuarios del Sistema</h3>
                <button onclick="nuevoUsuario()" style="width:auto; padding:8px 15px; background:#f1c40f; color:black;">+ AUTORIZAR</button>
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

        const tbody = document.getElementById('body-users');
        users?.forEach(u => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.innerHTML = `
                <td style="padding:10px;">${u.email}</td>
                <td>
                    <select onchange="cambiarRol(${u.id}, this.value)" style="padding:5px; background:#222; color:white; border:1px solid #444;">
                        <option value="usuario" ${u.rol === 'usuario' ? 'selected' : ''}>USUARIO</option>
                        <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>ADMIN</option>
                    </select>
                </td>
                <td><i class="fas fa-trash" style="color:#ff4444; cursor:pointer;" onclick="eliminarUsuario(${u.id})"></i></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- 3. DATOS DE EMPRESA ---
    async function renderEmpresa(ws) {
        // Refrescar datos de empresa desde la BD
        const { data: empData } = await supabase.from('empresas').select('*').eq('id', empresa.id).single();
        
        ws.innerHTML = `
            <h3 style="color:#2ecc71; margin-bottom:20px;">Datos Institucionales</h3>
            <div class="seccion-form">
                <label>Nombre de la Empresa:</label>
                <input type="text" id="edit-emp-nombre" value="${empData.nombre || ''}">
                
                <label>RUC:</label>
                <input type="text" id="edit-emp-ruc" value="${empData.ruc || ''}" placeholder="Ej: 0791755220001">

                <label>Ubicación / Dirección:</label>
                <input type="text" id="edit-emp-ubicacion" value="${empData.ubicacion || ''}" placeholder="Ej: Zaruma, El Oro">

                <label>URL Logo:</label>
                <input type="text" id="edit-emp-logo" value="${empData.logo_url || ''}">
                <div style="text-align:center; margin-top:10px;">
                    <img src="${empData.logo_url}" style="height:60px; background:white; padding:5px; border-radius:5px;" onerror="this.src='https://via.placeholder.com/100?text=SIN+LOGO'">
                </div>

                <button onclick="actualizarEmpresaFull()" style="background:#2ecc71; color:black; margin-top:20px; font-weight:bold; width:100%;">GUARDAR CAMBIOS</button>
            </div>
        `;
    }

    // --- FUNCIONES GLOBALES (Window) ---
    window.nuevoCargo = async () => {
        const dep = prompt("Departamento (Ej: PLANTA, MINA, ADMINISTRACIÓN):");
        const nom = prompt("Nombre del Cargo:");
        if (dep && nom) {
            await supabase.from('cargos').insert([{ nombre: nom.toUpperCase(), departamento: dep.toUpperCase() }]);
            seccionAdmin('organigrama');
        }
    };

    window.eliminarCargo = async (id) => { if(confirm("¿Eliminar cargo?")) { await supabase.from('cargos').delete().eq('id', id); seccionAdmin('organigrama'); } };

    window.nuevoUsuario = async () => {
        const email = prompt("Ingrese el correo electrónico a autorizar:").toLowerCase().trim();
        if (email) {
            await supabase.from('autorizados').insert([{ email, rol: 'usuario' }]);
            seccionAdmin('usuarios');
        }
    };

    window.cambiarRol = async (id, nuevoRol) => {
        const { error } = await supabase.from('autorizados').update({ rol: nuevoRol }).eq('id', id);
        if(!error) alert("Rol actualizado.");
    };

    window.eliminarUsuario = async (id) => { if(confirm("¿Quitar acceso?")) { await supabase.from('autorizados').delete().eq('id', id); seccionAdmin('usuarios'); } };

    window.actualizarEmpresaFull = async () => {
        const datos = {
            nombre: document.getElementById('edit-emp-nombre').value.toUpperCase(),
            ruc: document.getElementById('edit-emp-ruc').value,
            ubicacion: document.getElementById('edit-emp-ubicacion').value.toUpperCase(),
            logo_url: document.getElementById('edit-emp-logo').value
        };
        const { error } = await supabase.from('empresas').update(datos).eq('id', empresa.id);
        if(!error) { alert("Información actualizada."); location.reload(); }
        else { alert("Error al actualizar: " + error.message); }
    };
}
