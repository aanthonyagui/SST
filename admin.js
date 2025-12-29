// admin.js - Módulo de Administración Global
export async function cargarModuloAdmin(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2><i class="fas fa-cogs"></i> Panel de Administración</h2>
            <p style="color: #aaa;">Configuración global de ${empresa.nombre}</p>
        </div>

        <div class="worker-grid">
            <div class="worker-card" onclick="abrirGestionCargos()">
                <div class="w-avatar" style="background: var(--primary); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-briefcase" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Gestión de Cargos</h4>
                    <small>Agregar o eliminar cargos de nómina</small>
                </div>
            </div>

            <div class="worker-card" onclick="abrirGestionRoles()">
                <div class="w-avatar" style="background: var(--warning); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user-shield" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Usuarios y Roles</h4>
                    <small>Controlar correos autorizados y accesos</small>
                </div>
            </div>

            <div class="worker-card" onclick="alert('Configuración de empresa en desarrollo')">
                <div class="w-avatar" style="background: var(--success); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-building" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Datos de Empresa</h4>
                    <small>Logo, RUC y dirección</small>
                </div>
            </div>
        </div>

        <div id="sub-workspace-admin" style="margin-top: 30px;"></div>
    `;

    // --- FUNCIONES INTERNAS ---

    window.abrirGestionCargos = async () => {
        const subWs = document.getElementById('sub-workspace-admin');
        subWs.innerHTML = `<h3>Cargos Disponibles</h3><div id="lista-cargos-admin">Cargando...</div>
        <button onclick="nuevoCargo()" style="margin-top:10px; background: var(--primary); color:black;">+ AGREGAR CARGO</button>`;
        
        renderizarCargos();
    };

    async function renderizarCargos() {
        const { data } = await supabase.from('cargos').select('*').order('nombre');
        const list = document.getElementById('lista-cargos-admin');
        list.innerHTML = '';
        data?.forEach(c => {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:5px;">
                    <span>${c.nombre.toUpperCase()}</span>
                    <i class="fas fa-trash" style="color:var(--danger); cursor:pointer;" onclick="eliminarCargo(${c.id})"></i>
                </div>`;
        });
    }

    window.nuevoCargo = async () => {
        const nombre = prompt("Nombre del nuevo cargo:");
        if(nombre) {
            await supabase.from('cargos').insert([{ nombre: nombre.toUpperCase() }]);
            renderizarCargos();
        }
    };

    window.eliminarCargo = async (id) => {
        if(confirm("¿Seguro que desea eliminar este cargo?")) {
            await supabase.from('cargos').delete().eq('id', id);
            renderizarCargos();
        }
    };

    window.abrirGestionRoles = async () => {
        const subWs = document.getElementById('sub-workspace-admin');
        subWs.innerHTML = `<h3>Usuarios Autorizados</h3><div id="lista-usuarios-admin">Cargando...</div>
        <button onclick="nuevoUsuario()" style="margin-top:10px; background: var(--warning); color:black;">+ AUTORIZAR CORREO</button>`;
        
        renderizarUsuarios();
    };

    async function renderizarUsuarios() {
        const { data } = await supabase.from('autorizados').select('*').order('email');
        const list = document.getElementById('lista-usuarios-admin');
        list.innerHTML = '';
        data?.forEach(u => {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:5px;">
                    <div><b>${u.email}</b> <br> <small style="color:var(--primary)">ROL: ${u.rol.toUpperCase()}</small></div>
                    <i class="fas fa-user-minus" style="color:var(--danger); cursor:pointer;" onclick="eliminarUsuario(${u.id})"></i>
                </div>`;
        });
    }

    window.nuevoUsuario = async () => {
        const email = prompt("Correo a autorizar:").toLowerCase();
        const rol = confirm("¿Será Administrador?") ? 'admin' : 'usuario';
        if(email) {
            await supabase.from('autorizados').insert([{ email, rol }]);
            renderizarUsuarios();
        }
    };

    window.eliminarUsuario = async (id) => {
        if(confirm("¿Quitar autorización a este usuario?")) {
            await supabase.from('autorizados').delete().eq('id', id);
            renderizarUsuarios();
        }
    };
}
