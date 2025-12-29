// admin.js - PANEL DE CONFIGURACIÓN AVANZADA
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

    // --- 1. ORGANIGRAMA POR DEPARTAMENTOS ---
    async function renderOrganigrama(ws) {
        const { data: cargos } = await supabase.from('cargos').select('*').order('departamento');
        
        // Agrupar cargos por departamento
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

    window.nuevoCargo = async () => {
        const dep = prompt("Departamento (Ej: PLANTA, MINA, ADMINISTRACIÓN):");
        const nom = prompt("Nombre del Cargo:");
        if (dep && nom) {
            await supabase.from('cargos').insert([{ nombre: nom.toUpperCase(), departamento: dep.toUpperCase() }]);
            seccionAdmin('organigrama');
        }
    };

    // --- 2. GESTIÓN DE USUARIOS Y ROLES ---
    async function renderUsuarios(ws) {
        const { data: users } = await supabase.from('autorizados').select('*').order('email');
        ws.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#f1c40f;">Usuarios del Sistema</h3>
                <button onclick="nuevoUsuario()" style="width:auto; padding:8px 15px; background:#f1c40f; color:black;">+ AUTORIZAR</button>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:0.9em;">
                <thead><tr style="border-bottom:1px solid #444; color:#aaa; text-align:left;">
                    <th style="padding:10px;">CORREO</th>
                    <th>ROL</th>
                    <th>ACCIÓN</th>
                </tr></thead>
                <tbody id="body-users"></tbody>
            </table>
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

    window.cambiarRol = async (id, nuevoRol) => {
        const { error } = await supabase.from('autorizados').update({ rol: nuevoRol }).eq('id', id);
        if(!error) alert("Rol actualizado correctamente.");
    };

    // --- 3. DATOS DE EMPRESA (FULL) ---
    async function renderEmpresa(ws) {
        ws.innerHTML = `
            <h3 style="color:#2ecc71; margin-bottom:20px;">Datos Institucionales</h3>
            <div class="seccion-form">
                <label>Nombre de la Empresa:</label>
                <input type="text" id="edit-emp-nombre" value="${empresa.nombre || ''}">
                
                <label>RUC:</label>
                <input type="text" id="edit-emp-ruc" value="${empresa.ruc || ''}" placeholder="Ej: 0791755220001">

                <label>Ubicación / Dirección:</label>
                <input type="text" id="edit-emp-ubicacion" value="${empresa.ubicacion || ''}" placeholder="Ej: Zaruma, El Oro">

                <label>URL Logo:</label>
                <input type="text" id="edit-emp-logo" value="${empresa.logo_url || ''}">
                <img src="${empresa.logo_url}" style="height:50px; margin-top:5px; background:white; padding:5px; border-radius:5px;">

                <button onclick="actualizarEmpresaFull()" style="background:#2ecc71; color:black; margin-top:20px; font-weight:bold;">GUARDAR CAMBIOS</button>
            </div>
        `;
    }

    window.actualizarEmpresaFull = async () => {
        const datos = {
            nombre: document.getElementById('edit-emp-nombre').value.toUpperCase(),
            ruc: document.getElementById('edit-emp-ruc').value,
            ubicacion: document.getElementById('edit-emp-ubicacion').value.toUpperCase(),
            logo_url: document.getElementById('edit-emp-logo').value
        };
        const { error } = await supabase.from('empresas').update(datos).eq('id', empresa.id);
        if(!error) {
            alert("Información actualizada. La página se recargará.");
            location.reload();
        }
    };

    window.eliminarCargo = async (id) => { if(confirm("¿Eliminar cargo?")) { await supabase.from('cargos').delete().eq('id', id); seccionAdmin('organigrama'); } };
    window.eliminarUsuario = async (id) => { if(confirm("¿Quitar acceso?")) { await supabase.from('autorizados').delete().eq('id', id); seccionAdmin('usuarios'); } };
}
