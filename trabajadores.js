// trabajadores.js - V3.0 (Contadores, Pasivos y Scroll Fix)

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // 1. HTML MEJORADO
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            
            <div id="tab-container" style="display:flex; gap:5px; margin-top:10px; overflow-x:auto; padding-bottom:5px;">
                <button class="tab-btn active" id="tab-activos" onclick="cambiarVista('activos')">
                    <i class="fas fa-user-check"></i> Activos <span id="count-activos" class="badge">0</span>
                </button>
                
                <button class="tab-btn" id="tab-pasivos" onclick="cambiarVista('pasivos')">
                    <i class="fas fa-user-times"></i> Retirados <span id="count-pasivos" class="badge">0</span>
                </button>
                
                <button class="tab-btn" id="btn-nueva-ficha" onclick="nuevaFicha()">
                    <i class="fas fa-plus"></i> Nuevo
                </button>

                <div id="tab-trabajador-activo" style="display:none;"></div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin:15px 0;">

        <div id="vista-activos" class="vista-seccion">
            <div class="search-bar">
                <input type="text" id="buscador-activos" placeholder="Buscar trabajador activo...">
            </div>
            <div id="grid-activos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-pasivos" class="vista-seccion" style="display:none;">
            <div class="search-bar" style="border-color:#e74c3c;">
                <input type="text" id="buscador-pasivos" placeholder="Buscar trabajador retirado...">
            </div>
            <div id="grid-pasivos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-formulario" class="vista-seccion" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="color:#00d2ff; margin:0;" id="titulo-formulario">Ficha</h3>
                <div style="display:flex; gap:5px;">
                    <button id="btn-imprimir" class="btn-small" style="background:#e74c3c; display:none;"><i class="fas fa-file-pdf"></i> PDF</button>
                    <button id="btn-dar-baja" class="btn-small" style="background:#555; display:none;" title="Mover a Retirados"><i class="fas fa-archive"></i> Dar Baja</button>
                    <button id="btn-reactivar" class="btn-small" style="background:#2ecc71; display:none;" title="Volver a Activar"><i class="fas fa-undo"></i> Reactivar</button>
                </div>
            </div>

            <form id="form-trabajador" class="form-scroll">
                <input type="hidden" id="t-id">
                <input type="hidden" id="t-estado" value="ACTIVO">

                <div class="seccion-form">
                    <div style="display:flex; flex-wrap:wrap; gap:20px;">
                        <div style="text-align:center; flex:0 0 120px;">
                            <img id="preview-foto" src="https://via.placeholder.com/150?text=FOTO" class="foto-perfil">
                            <input type="file" id="t-foto" accept="image/*" style="display:none;">
                            <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small">Cambiar Foto</button>
                        </div>
                        <div class="form-grid" style="flex:1;">
                            <input type="text" id="t-cedula" placeholder="Cédula (10 dígitos)" maxlength="10" required>
                            <input type="text" id="t-nombre" placeholder="Apellidos y Nombres" required>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                                <input type="date" id="t-nacimiento" required title="Fecha Nacimiento">
                                <input type="text" id="t-edad" placeholder="Edad" readonly style="background:#333;">
                            </div>
                            <select id="t-cargo" required><option>Cargando cargos...</option></select>
                        </div>
                    </div>
                </div>

                <details open class="seccion-form">
                    <summary>Datos Personales y Contacto</summary>
                    <div class="form-grid" style="margin-top:10px;">
                         <select id="t-sexo"><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option></select>
                         <select id="t-civil"><option value="Soltero">Soltero</option><option value="Casado">Casado</option><option value="Union Libre">Unión Libre</option><option value="Divorciado">Divorciado</option><option value="Viudo">Viudo</option></select>
                         <select id="t-sangre"><option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="AB+">AB+</option></select>
                         <input type="text" id="t-nacionalidad" value="ECUATORIANA">
                         <input type="text" id="t-profesion" placeholder="Profesión">
                         <input type="text" id="t-celular" placeholder="Celular">
                         <input type="email" id="t-correo" placeholder="Correo">
                         <input type="text" id="t-direccion" placeholder="Dirección" style="grid-column:1/-1">
                    </div>
                </details>

                <details class="seccion-form">
                    <summary>Vivienda y Servicios</summary>
                    <div class="form-grid" style="margin-top:10px;">
                        <select id="t-vivienda"><option value="Propia">Propia</option><option value="Arrendada">Arrendada</option><option value="Familiar">Familiar</option></select>
                        <div class="multi-select-box">
                            <label><input type="checkbox" name="serv" value="Luz"> Luz</label>
                            <label><input type="checkbox" name="serv" value="Agua"> Agua</label>
                            <label><input type="checkbox" name="serv" value="Internet"> Internet</label>
                            <label><input type="checkbox" name="serv" value="Alcantarillado"> Alcantarillado</label>
                        </div>
                    </div>
                </details>

                <details class="seccion-form">
                    <summary>Tallas y Emergencia</summary>
                    <div class="form-grid" style="margin-top:10px; grid-template-columns:1fr 1fr 1fr;">
                        <input type="text" id="t-camisa" placeholder="Camisa">
                        <input type="text" id="t-pantalon" placeholder="Pantalón">
                        <input type="text" id="t-zapatos" placeholder="Zapato">
                    </div>
                    <hr style="border-color:#444;">
                    <p style="font-size:0.8em; color:#aaa; margin:5px 0;">Contacto 1</p>
                    <div class="form-grid">
                        <input type="text" id="t-emer-nom" placeholder="Nombre">
                        <input type="text" id="t-emer-par" placeholder="Parentesco">
                        <input type="text" id="t-emer-tel" placeholder="Teléfono">
                    </div>
                    <p style="font-size:0.8em; color:#aaa; margin:5px 0;">Contacto 2</p>
                    <div class="form-grid">
                        <input type="text" id="t-emer2-nom" placeholder="Nombre">
                        <input type="text" id="t-emer2-par" placeholder="Parentesco">
                        <input type="text" id="t-emer2-tel" placeholder="Teléfono">
                    </div>
                </details>

                <div style="margin-top:20px; display:flex; gap:10px; padding-bottom:50px;">
                    <button type="submit" id="btn-guardar" style="background:#00d2ff; color:black;">Guardar Cambios</button>
                    <button type="button" onclick="cambiarVista('activos')" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA JAVASCRIPT ---

    // 1. CARGA INICIAL
    cargarCargos(supabase);
    listarTrabajadores('ACTIVO');
    listarTrabajadores('PASIVO'); // Carga silenciosa para el contador

    // 2. GESTIÓN DE VISTAS (TABS)
    window.cambiarVista = (vista) => {
        document.querySelectorAll('.vista-seccion').forEach(v => v.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        if(vista === 'activos') {
            document.getElementById('vista-activos').style.display = 'block';
            document.getElementById('tab-activos').classList.add('active');
        } else if(vista === 'pasivos') {
            document.getElementById('vista-pasivos').style.display = 'block';
            document.getElementById('tab-pasivos').classList.add('active');
        }
        
        // Ocultar pestaña de trabajador si cambiamos a lista general
        if(vista !== 'formulario') {
            document.getElementById('tab-trabajador-activo').style.display = 'none';
        }
    };

    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value = '';
        document.getElementById('t-estado').value = 'ACTIVO';
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150?text=SIN+FOTO';
        
        // Configurar botones
        document.getElementById('btn-dar-baja').style.display = 'none';
        document.getElementById('btn-reactivar').style.display = 'none';
        document.getElementById('btn-imprimir').style.display = 'none';
        document.getElementById('titulo-formulario').innerText = "Nuevo Ingreso";

        // Abrir pestaña visual "Nuevo"
        const tabActivo = document.getElementById('tab-trabajador-activo');
        tabActivo.innerHTML = `<button class="tab-btn active" style="border-color:#2ecc71; color:#2ecc71;">Nuevo</button>`;
        tabActivo.style.display = 'block';
        
        document.querySelectorAll('.vista-seccion').forEach(v => v.style.display = 'none');
        document.getElementById('vista-formulario').style.display = 'block';
    };

    // 3. LISTAR TRABAJADORES (ACTIVOS O PASIVOS)
    async function listarTrabajadores(estado) {
        const gridId = estado === 'ACTIVO' ? 'grid-activos' : 'grid-pasivos';
        const countId = estado === 'ACTIVO' ? 'count-activos' : 'count-pasivos';
        
        const { data } = await supabase.from('trabajadores')
            .select('id, nombre, cargo, cedula, foto_url')
            .eq('empresa_id', empresa.id)
            .eq('estado', estado) // Filtro clave
            .order('nombre');

        // Actualizar contador
        document.getElementById(countId).innerText = data ? data.length : 0;
        
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';

        if(!data || data.length === 0) {
            grid.innerHTML = `<p style="opacity:0.6; padding:10px;">No hay trabajadores ${estado.toLowerCase()}s.</p>`;
            return;
        }

        data.forEach(t => {
            const div = document.createElement('div');
            div.className = 'worker-card';
            div.style.borderColor = estado === 'PASIVO' ? '#e74c3c' : 'rgba(255,255,255,0.1)';
            div.innerHTML = `
                <div class="w-avatar">
                    ${t.foto_url ? `<img src="${t.foto_url}" style="width:100%; height:100%; object-fit:cover;">` : t.nombre.charAt(0)}
                </div>
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:1em;">${t.nombre}</h4>
                    <small style="color:#aaa;">${t.cargo}</small>
                </div>
            `;
            div.onclick = () => abrirFicha(t.id);
            grid.appendChild(div);
        });
    }

    // 4. ABRIR FICHA (EDITAR)
    async function abrirFicha(id) {
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
        if(!t) return;

        // Pestaña con nombre del trabajador (LO QUE VEÍAS COMO ANTHONY)
        const tabActivo = document.getElementById('tab-trabajador-activo');
        // Tomamos el primer nombre para la pestaña
        const primerNombre = t.nombre.split(' ')[0]; 
        tabActivo.innerHTML = `<button class="tab-btn active"><i class="fas fa-user-edit"></i> ${primerNombre}</button>`;
        tabActivo.style.display = 'block';

        // Llenar campos básicos
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-estado').value = t.estado;
        document.getElementById('t-cedula').value = t.cedula;
        document.getElementById('t-nombre').value = t.nombre;
        document.getElementById('t-nacimiento').value = t.fecha_nacimiento;
        document.getElementById('t-cargo').value = t.cargo;
        
        // Calcular edad al abrir
        if(t.fecha_nacimiento) {
             const hoy = new Date(); const nac = new Date(t.fecha_nacimiento);
             let edad = hoy.getFullYear() - nac.getFullYear();
             if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
             document.getElementById('t-edad').value = edad + ' años';
        }

        // Llenar resto de campos (Simplificado para brevedad, expandir según necesidad)
        document.getElementById('t-sexo').value = t.sexo || 'Hombre';
        document.getElementById('t-civil').value = t.estado_civil || '';
        document.getElementById('t-celular').value = t.celular || '';
        document.getElementById('t-foto').value = ''; // Reset input file
        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150?text=SIN+FOTO';

        // Checkboxes servicios
        document.querySelectorAll('input[name="serv"]').forEach(c => c.checked = false);
        if(t.servicios_basicos) {
            t.servicios_basicos.split(',').forEach(s => {
                const chk = document.querySelector(`input[name="serv"][value="${s}"]`);
                if(chk) chk.checked = true;
            });
        }

        // Botones de estado
        const btnBaja = document.getElementById('btn-dar-baja');
        const btnReac = document.getElementById('btn-reactivar');
        
        if(t.estado === 'ACTIVO') {
            btnBaja.style.display = 'inline-flex';
            btnReac.style.display = 'none';
            btnBaja.onclick = () => cambiarEstadoTrabajador(t.id, 'PASIVO', supabase);
        } else {
            btnBaja.style.display = 'none';
            btnReac.style.display = 'inline-flex';
            btnReac.onclick = () => cambiarEstadoTrabajador(t.id, 'ACTIVO', supabase);
        }

        // Mostrar formulario
        document.querySelectorAll('.vista-seccion').forEach(v => v.style.display = 'none');
        document.getElementById('vista-formulario').style.display = 'block';
    }

    // 5. GUARDAR (INSERT/UPDATE)
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const servicios = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c => c.value).join(',');
        
        // Lógica de subida de foto...
        let fotoUrl = null;
        const file = document.getElementById('t-foto').files[0];
        if(file) {
            const name = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "")}`;
            const { data } = await supabase.storage.from('fichas_personal').upload(name, file);
            if(data) {
                const { data: pub } = supabase.storage.from('fichas_personal').getPublicUrl(name);
                fotoUrl = pub.publicUrl;
            }
        }

        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: document.getElementById('t-nombre').value.toUpperCase(),
            fecha_nacimiento: document.getElementById('t-nacimiento').value,
            cargo: document.getElementById('t-cargo').value,
            celular: document.getElementById('t-celular').value,
            estado_civil: document.getElementById('t-civil').value,
            servicios_basicos: servicios,
            // ... agregar resto de campos
        };
        if(fotoUrl) datos.foto_url = fotoUrl;

        let error;
        if(id) {
            const res = await supabase.from('trabajadores').update(datos).eq('id', id);
            error = res.error;
        } else {
            const res = await supabase.from('trabajadores').insert([datos]);
            error = res.error;
        }

        if(error) alert("Error: " + error.message);
        else {
            alert("Guardado exitosamente");
            listarTrabajadores('ACTIVO');
            cambiarVista('activos');
        }
    };

    // 6. BUSCADORES
    document.getElementById('buscador-activos').onkeyup = (e) => filtrarGrid('grid-activos', e.target.value);
    document.getElementById('buscador-pasivos').onkeyup = (e) => filtrarGrid('grid-pasivos', e.target.value);
}

// FUNCIONES AUXILIARES GLOBALES
function filtrarGrid(gridId, texto) {
    const t = texto.toLowerCase();
    document.querySelectorAll(`#${gridId} .worker-card`).forEach(c => {
        c.style.display = c.innerText.toLowerCase().includes(t) ? 'flex' : 'none';
    });
}

async function cambiarEstadoTrabajador(id, nuevoEstado, supabase) {
    if(!confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;
    
    await supabase.from('trabajadores').update({ estado: nuevoEstado }).eq('id', id);
    alert("Estado actualizado.");
    
    // Recargar módulo
    document.getElementById('tab-activos').click(); // Volver a lista
    // Truco rápido para recargar contadores:
    document.getElementById('tab-activos').click(); 
}

async function cargarCargos(supabase) {
    const { data } = await supabase.from('cargos').select('*').order('nombre');
    const sel = document.getElementById('t-cargo');
    sel.innerHTML = '<option value="">Seleccione Cargo...</option>';
    data?.forEach(c => sel.innerHTML += `<option>${c.nombre}</option>`);
}
