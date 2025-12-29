// admin.js - PANEL DE CONFIGURACIÓN TOTAL
export async function cargarModuloAdmin(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2><i class="fas fa-cogs"></i> Configuración del Sistema</h2>
            <p style="color: #aaa;">Administración global para ${empresa.nombre}</p>
        </div>

        <div class="worker-grid">
            <div class="worker-card" onclick="seccionAdmin('cargos')">
                <div class="w-avatar" style="background: var(--primary); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-briefcase" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Cargos</h4>
                    <small>Gestionar puestos de nómina</small>
                </div>
            </div>

            <div class="worker-card" onclick="seccionAdmin('usuarios')">
                <div class="w-avatar" style="background: var(--warning); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user-shield" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Usuarios y Roles</h4>
                    <small>Correos autorizados y permisos</small>
                </div>
            </div>

            <div class="worker-card" onclick="seccionAdmin('empresa')">
                <div class="w-avatar" style="background: var(--success); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-building" style="color: black;"></i>
                </div>
                <div>
                    <h4 style="margin:0">Datos Empresa</h4>
                    <small>Editar Logo y Nombre</small>
                </div>
            </div>
        </div>

        <div id="admin-sub-workspace" style="margin-top: 30px; padding: 20px; border: 1px dashed #444; border-radius: 15px;">
            <p style="text-align:center; color:#666;">Seleccione una categoría para configurar.</p>
        </div>
    `;

    // Controlador de navegación interna
    window.seccionAdmin = (seccion) => {
        const subWs = document.getElementById('admin-sub-workspace');
        if (seccion === 'cargos') renderCargos(subWs);
        if (seccion === 'usuarios') renderUsuarios(subWs);
        if (seccion === 'empresa') renderEmpresa(subWs);
    };

    // Funciones de renderizado (Cargos, Usuarios, Empresa)...
    async function renderCargos(ws) {
        const { data } = await supabase.from('cargos').select('*').order('nombre');
        ws.innerHTML = `<h3>Listado de Cargos</h3><div id="lista-cargos-admin"></div>
        <button onclick="nuevoCargo()" style="background:var(--primary); color:black; margin-top:10px;">+ AGREGAR CARGO</button>`;
        data?.forEach(c => {
            document.getElementById('lista-cargos-admin').innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:8px;">
                    <span>${c.nombre}</span>
                    <i class="fas fa-trash" style="color:var(--danger); cursor:pointer;" onclick="eliminarCargo(${c.id})"></i>
                </div>`;
        });
    }

    window.nuevoCargo = async () => {
        const n = prompt("Nombre del nuevo cargo:").toUpperCase();
        if(n) { await supabase.from('cargos').insert([{ nombre: n }]); seccionAdmin('cargos'); }
    };

    window.eliminarCargo = async (id) => {
        if(confirm("¿Eliminar cargo?")) { await supabase.from('cargos').delete().eq('id', id); seccionAdmin('cargos'); }
    };
    
    // Lógica adicional para Usuarios y Empresa...
}
