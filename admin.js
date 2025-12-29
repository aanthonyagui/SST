// admin.js - PANEL DE CONFIGURACIÓN GLOBAL
export async function cargarModuloAdmin(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2><i class="fas fa-cogs"></i> Configuración Global</h2>
            <p style="color: #aaa;">Administración de sistema para ${empresa.nombre}</p>
        </div>

        <div class="worker-grid">
            <div class="worker-card" onclick="adminSection('cargos')">
                <div class="w-avatar" style="background: var(--primary); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-briefcase" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Cargos</h4>
                    <small>Gestionar puestos de trabajo</small>
                </div>
            </div>

            <div class="worker-card" onclick="adminSection('usuarios')">
                <div class="w-avatar" style="background: var(--warning); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user-shield" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Usuarios y Roles</h4>
                    <small>Accesos y permisos (Admin/Usuario)</small>
                </div>
            </div>

            <div class="worker-card" onclick="adminSection('empresa')">
                <div class="w-avatar" style="background: var(--success); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-building" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Datos Empresa</h4>
                    <small>Logo, RUC y Configuración</small>
                </div>
            </div>
        </div>

        <div id="admin-workspace" style="margin-top: 30px; background: rgba(255,255,255,0.02); border-radius: 15px; padding: 20px; border: 1px dashed #444;">
            <p style="text-align:center; color:#666;">Seleccione una categoría para configurar</p>
        </div>
    `;

    // --- CONTROLADOR DE SECCIONES ---
    window.adminSection = async (tipo) => {
        const ws = document.getElementById('admin-workspace');
        ws.innerHTML = '<p>Cargando configuración...</p>';

        if (tipo === 'cargos') renderCargos(ws);
        if (tipo === 'usuarios') renderUsuarios(ws);
        if (tipo === 'empresa') renderEmpresa(ws);
    };

    // --- LOGICA: GESTIÓN DE CARGOS ---
    async function renderCargos(ws) {
        const { data } = await supabase.from('cargos').select('*').order('nombre');
        ws.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; color:var(--primary)">Listado de Cargos</h3>
                <button onclick="nuevoCargo()" style="width:auto; padding:8px 15px; background:var(--primary); color:black;">+ AGREGAR</button>
            </div>
            <div id="lista-cargos-admin"></div>
        `;
        const list = document.getElementById('lista-cargos-admin');
        data?.forEach(c => {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:8px; border-left: 3px solid var(--primary);">
                    <span>${c.nombre}</span>
                    <i class="fas fa-trash" style="color:var(--danger); cursor:pointer;" onclick="eliminarCargo(${c.id})"></i>
                </div>`;
        });
    }

    window.nuevoCargo = async () => {
        const nombre = prompt("Nombre del nuevo cargo:").toUpperCase();
        if(nombre) {
            await supabase.from('cargos').insert([{ nombre }]);
            adminSection('cargos');
        }
    };

    window.eliminarCargo = async (id) => {
        if(confirm("¿Eliminar este cargo? Esto no afectará a trabajadores ya registrados pero no aparecerá en nuevas fichas.")) {
            await supabase.from('cargos').delete().eq('id', id);
            adminSection('cargos');
        }
    };

    // --- LOGICA: USUARIOS Y ROLES ---
    async function renderUsuarios(ws) {
        const { data } = await supabase.from('autorizados').select('*').order('email');
        ws.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; color:var(--warning)">Correos Autorizados</h3>
                <button onclick="nuevoUsuario()" style="width:auto; padding:8px 15px; background:var(--warning); color:black;">+ AUTORIZAR</button>
            </div>
            <div id="lista-usuarios-admin"></div>
        `;
        const list = document.getElementById('lista-usuarios-admin');
        data?.forEach(u => {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:8px; border-left: 3px solid var(--warning);">
                    <div><b>${u.email}</b><br><small style="color:#aaa;">ROL: ${u.rol.toUpperCase()}</small></div>
                    <i class="fas fa-user-minus" style="color:var(--danger); cursor:pointer;" onclick="eliminarUsuario(${u.id})"></i>
                </div>`;
        });
    }

    window.nuevoUsuario = async () => {
        const email = prompt("Ingrese el correo electrónico:").toLowerCase().trim();
        const esAdmin = confirm("¿Desea otorgar permisos de ADMINISTRADOR a este correo?");
        if(email) {
            await supabase.from('autorizados').insert([{ email, rol: esAdmin ? 'admin' : 'usuario' }]);
            adminSection('usuarios');
        }
    };

    window.eliminarUsuario = async (id) => {
        if(confirm("¿Revocar acceso a este usuario?")) {
            await supabase.from('autorizados').delete().eq('id', id);
            adminSection('usuarios');
        }
    };

    // --- LOGICA: DATOS EMPRESA ---
    async function renderEmpresa(ws) {
        ws.innerHTML = `
            <h3 style="color:var(--success)">Configuración de Empresa</h3>
            <div class="seccion-form">
                <label>Nombre Comercial:</label>
                <input type="text" id="edit-emp-nombre" value="${empresa.nombre}">
                <label>URL Logo (Imagen):</label>
                <input type="text" id="edit-emp-logo" value="${empresa.logo_url}">
                <button onclick="actualizarEmpresa()" style="background:var(--success); color:black; margin-top:10px;">ACTUALIZAR DATOS</button>
            </div>
        `;
    }

    window.actualizarEmpresa = async () => {
        const nombre = document.getElementById('edit-emp-nombre').value.toUpperCase();
        const logo = document.getElementById('edit-emp-logo').value;
        const { error } = await supabase.from('empresas').update({ nombre, logo_url: logo }).eq('id', empresa.id);
        if(!error) {
            alert("DATOS ACTUALIZADOS. Reiniciando para aplicar cambios...");
            location.reload();
        }
    };
}
