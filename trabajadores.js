// trabajadores.js - VERSIÓN: HISTORIAL MANUAL BAJO BOTONES

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0; margin-bottom:10px;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            
            <div id="tab-container">
                <button class="tab-btn active" id="tab-activos" onclick="cambiarVista('activos')">
                    <i class="fas fa-user-check"></i> <span class="desktop-text">Activos</span> 
                    <span id="count-activos" class="badge bg-green">0</span>
                </button>
                
                <button class="tab-btn" id="tab-pasivos" onclick="cambiarVista('pasivos')">
                    <i class="fas fa-user-times"></i> <span class="desktop-text">Retirados</span> 
                    <span id="count-pasivos" class="badge bg-red">0</span>
                </button>
                
                <button class="tab-btn" id="btn-nuevo" onclick="nuevaFicha()">
                    <i class="fas fa-plus"></i> <span class="desktop-text">Nuevo</span>
                </button>

                <div class="dropdown" id="cont-nombre" style="display:none;">
                    <button class="tab-btn btn-nombre" onclick="toggleMenuNombre()">
                        <i class="fas fa-user"></i> <span id="lbl-nombre-trab">NOMBRE</span> <i class="fas fa-caret-down"></i>
                    </button>
                    <div id="menu-descargas" class="dropdown-content">
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf" style="color:var(--danger)"></i> Ficha PDF</a>
                        <a onclick="toggleMenuNombre()" style="color:#666;"><i class="fas fa-times"></i> Cerrar</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">

        <div id="vista-activos">
            <input type="text" id="bus-act" placeholder="Buscar trabajador activo..." style="width:100%; border-radius:30px; margin-bottom:15px;">
            <div id="grid-activos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-pasivos" style="display:none;">
            <input type="text" id="bus-pas" placeholder="Buscar trabajador retirado..." style="width:100%; border-radius:30px; border-color:var(--danger); margin-bottom:15px;">
            <div id="grid-pasivos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-formulario" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; color:#00d2ff;" id="titulo-ficha">Ficha Personal</h3>
                <button onclick="cambiarVista('activos')" style="background:#555; width:auto; padding:8px 15px;"><i class="fas fa-arrow-left"></i> Volver</button>
            </div>

            <form id="form-trabajador">
                <input type="hidden" id="t-id">
                <input type="hidden" id="t-estado" value="ACTIVO">
                <input type="hidden" id="t-cargo-original"> 

                <div style="background:rgba(255,255,255,0.05); border:1px solid #444; border-radius:15px; padding:15px; display:flex; gap:15px; align-items:center; margin-bottom:20px;">
                    <div style="text-align:center;">
                        <img id="preview-foto" src="" style="width:100px; height:120px; object-fit:cover; border-radius:10px; background:#000;">
                        <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:5px; font-size:0.8em; width:100%;">Foto</button>
                        <input type="file" id="t-foto" hidden accept="image/*">
                    </div>
                    <div style="flex:1;">
                        <input id="t-cedula" placeholder="Cédula" style="margin-bottom:5px;" required>
                        <input id="t-nombre" placeholder="Nombre Completo" style="margin-bottom:5px;" required>
                        <div style="display:flex; gap:5px;">
                            <input type="date" id="t-nacimiento" title="Fecha de Nacimiento" required>
                            <input id="t-edad" placeholder="Edad" readonly style="width:60px; text-align:center; background:#222;">
                        </div>
                        
                        <div style="margin-top:10px; border-top:1px solid #444; padding-top:5px;">
                            <label style="font-size:0.8em; color:var(--primary);">Cargo Actual:</label>
                            <select id="t-cargo" style="margin-top:2px;" required><option value="">Seleccione Cargo...</option></select>
                            
                            <div id="div-fecha-ingreso-inicial" style="display:none;">
                                <label style="font-size:0.8em; color:var(--success);">Fecha de Ingreso (Nuevo):</label>
                                <input type="date" id="t-ingreso-manual">
                            </div>
                        </div>
                    </div>
                </div>

                <details open class="seccion-form">
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Datos Personales</summary>
                    <div class="form-grid">
                        <select id="t-sexo"><option>Hombre</option><option>Mujer</option></select>
                        <select id="t-civil" onchange="verificarCivil()">
                            <option value="Soltero">Soltero</option>
                            <option value="Casado">Casado</option>
                            <option value="Unión Libre">Unión Libre</option>
                            <option value="Divorciado">Divorciado</option>
                            <option value="Viudo">Viudo</option>
                        </select>
                        
                        <div id="div-conyuge" style="display:none; grid-column:1/-1; background:rgba(255,255,255,0.1); padding:10px; border-radius:8px;">
                            <label style="font-size:0.8em; color:#00d2ff;">Nombre del Cónyuge:</label>
                            <input id="t-conyuge" placeholder="Escriba el nombre del esposo/a">
                        </div>

                        <select id="t-sangre"><option>O+</option><option>A+</option><option>B+</option><option>AB+</option><option>O-</option></select>
                        <input id="t-nacionalidad" value="ECUATORIANA">
                        <input id="t-lugar" placeholder="Lugar Nacimiento">
                        <input id="t-religion" placeholder="Religión">
                        <input id="t-discapacidad" placeholder="Discapacidad (NO / %)">
                        <input id="t-celular" placeholder="Celular">
                        <input id="t-correo" placeholder="Correo">
                        <input id="t-licencia" placeholder="Licencia">
                    </div>
                </details>

                <details class="seccion-form">
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Otros Datos</summary>
                    <div class="form-grid">
                        <input id="t-profesion" placeholder="Profesión">
                        <input id="t-sueldo" placeholder="Sueldo $">
                        <div><label style="font-size:0.7em; color:#aaa;">Afiliación IESS:</label><input type="date" id="t-afiliacion"></div>
                        <input id="t-banco" placeholder="Banco">
                        <input id="t-cuenta" placeholder="Nº Cuenta">
                        <input id="t-direccion" placeholder="Dirección" style="grid-column:1/-1">
                        <select id="t-vivienda"><option>Propia</option><option>Arrendada</option><option>Familiar</option></select>
                        <input id="t-material" placeholder="Paredes">
                        <input id="t-cubierta" placeholder="Techo">
                        <input id="t-emer-nom" placeholder="Emergencia: Nombre">
                        <input id="t-emer-tel" placeholder="Emergencia: Teléfono">
                    </div>
                </details>

                <div class="seccion-form" style="text-align:center;">
                    <img id="preview-firma" src="" style="height:60px; display:none; margin:0 auto; background:white; padding:5px;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin-top:5px;">Subir Firma</button>
                    <input type="file" id="t-firma" hidden accept="image/*">
                </div>

                <div style="margin-top:20px;">
                    <button type="submit" id="btn-guardar" style="width:100%; margin-bottom:10px;">GUARDAR CAMBIOS</button>
                    
                    <button type="button" id="btn-dar-baja" style="width:100%; background:var(--danger); display:none;" onclick="accionDarBaja()">
                        DAR DE BAJA
                    </button>
                    
                    <button type="button" id="btn-reactivar" style="width:100%; background:var(--success); color:black; display:none;" onclick="accionReactivar()">
                        REACTIVAR TRABAJADOR
                    </button>
                </div>

                <div style="margin-top:25px; border-top: 1px solid #444; padding-top:15px;">
                    <h4 style="color:#00d2ff; margin-bottom:10px;"><i class="fas fa-history"></i> Historial Laboral</h4>
                    <div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:10px;">
                        <table id="tabla-historial" style="width:100%; font-size:0.85em; border-collapse: collapse; text-align:left;">
                            <thead>
                                <tr style="color:#aaa; border-bottom:1px solid #555;">
                                    <th style="padding:5px;">F. Ingreso</th>
                                    <th>Cargo</th>
                                    <th>F. Salida</th>
                                </tr>
                            </thead>
                            <tbody id="body-historial">
                                </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </div>
    `;

    // =========================================================
    // LÓGICA DEL NEGOCIO (FECHAS Y CARGOS)
    // =========================================================

    // 1. CARGA INICIAL
    const { data: cargos } = await supabase.from('cargos').select('*');
    const sel = document.getElementById('t-cargo');
    cargos?.forEach(c => sel.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`);

    // Helper: Verificar estado civil para cónyuge
    window.verificarCivil = () => {
        const val = document.getElementById('t-civil').value;
        document.getElementById('div-conyuge').style.display = (val === 'Casado' || val === 'Unión Libre') ? 'block' : 'none';
    };

    // Helper: Navegación
    window.cambiarVista = (vista) => {
        ['vista-activos','vista-pasivos','vista-formulario'].forEach(id=>document.getElementById(id).style.display='none');
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        if(vista==='activos'){ document.getElementById('vista-activos').style.display='block'; document.getElementById('tab-activos').classList.add('active'); }
        if(vista==='pasivos'){ document.getElementById('vista-pasivos').style.display='block'; document.getElementById('tab-pasivos').classList.add('active'); }
    };

    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value = '';
        document.getElementById('t-estado').value = 'ACTIVO';
        document.getElementById('t-cargo-original').value = '';
        
        // Limpiar
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150';
        document.getElementById('preview-firma').style.display = 'none';
        document.getElementById('body-historial').innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px; color:#666;">Guardar para iniciar historial</td></tr>';

        // Configuración para NUEVO
        document.getElementById('div-fecha-ingreso-inicial').style.display = 'block'; // Mostrar input fecha ingreso
        document.getElementById('btn-dar-baja').style.display = 'none';
        document.getElementById('btn-reactivar').style.display = 'none';
        document.getElementById('titulo-ficha').innerText = "Nuevo Ingreso";
        
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display = 'block';
    };

    // 2. ABRIR TRABAJADOR EXISTENTE
    async function abrir(t) {
        // Llenar campos simples
        const fields = ['cedula','nombre','lugar','sexo','civil','sangre','discapacidad','religion','celular','correo','licencia','profesion','sueldo','afiliacion','banco','cuenta','direccion','vivienda','material','cubierta','conyuge','emer-nom','emer-tel'];
        fields.forEach(f => {
            const el = document.getElementById('t-'+f);
            if(el) el.value = t[f.replace('-','_')] || t[f] || '';
        });

        document.getElementById('t-nacimiento').value = t.fecha_nacimiento || '';
        document.getElementById('t-cargo').value = t.cargo || '';
        document.getElementById('t-cargo-original').value = t.cargo || ''; // Guardar para detectar cambios
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-estado').value = t.estado;
        
        // Calcular Edad
        if(t.fecha_nacimiento) {
            const age = new Date().getFullYear() - new Date(t.fecha_nacimiento).getFullYear();
            document.getElementById('t-edad').value = age;
        }

        // Fotos y Visuales
        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150';
        if(t.firma_url) { document.getElementById('preview-firma').src = t.firma_url; document.getElementById('preview-firma').style.display = 'block'; }
        else document.getElementById('preview-firma').style.display = 'none';
        
        verificarCivil();

        // Botones y Inputs
        document.getElementById('div-fecha-ingreso-inicial').style.display = 'none'; // En edición no mostramos este input simple
        
        if(t.estado === 'ACTIVO') {
            document.getElementById('btn-dar-baja').style.display = 'block';
            document.getElementById('btn-reactivar').style.display = 'none';
        } else {
            document.getElementById('btn-dar-baja').style.display = 'none';
            document.getElementById('btn-reactivar').style.display = 'block';
        }

        document.getElementById('titulo-ficha').innerText = `Editando: ${t.nombre}`;
        
        // CARGAR HISTORIAL EN LA TABLA
        await cargarHistorial(t.id);

        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    }

    // 3. FUNCIÓN PARA CARGAR LA TABLA DE HISTORIAL
    async function cargarHistorial(trabajadorId) {
        const tbody = document.getElementById('body-historial');
        tbody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';

        const { data } = await supabase.from('historial_laboral')
            .select('*')
            .eq('trabajador_id', trabajadorId)
            .order('fecha_inicio', { ascending: false }); // El más reciente primero

        tbody.innerHTML = '';
        if(!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#666;">Sin historial registrado</td></tr>';
            return;
        }

        data.forEach(h => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #333';
            tr.innerHTML = `
                <td style="padding:8px; color:#fff;">${h.fecha_inicio || '-'}</td>
                <td style="color:var(--primary);">${h.cargo}</td>
                <td style="color:${h.fecha_fin ? '#ff4444' : '#00C851'}">${h.fecha_fin || 'Vigente'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. GUARDAR (Maneja Nuevo Ingreso y Cambio de Cargo)
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('t-id').value;
        const cargoNuevo = document.getElementById('t-cargo').value;
        const cargoViejo = document.getElementById('t-cargo-original').value;
        const nombre = document.getElementById('t-nombre').value.toUpperCase();

        // VALIDACIÓN: Si es nuevo, debe tener fecha de ingreso
        if (!id && !document.getElementById('t-ingreso-manual').value) {
            return alert("Por favor, ingrese la FECHA DE INGRESO para el nuevo trabajador.");
        }

        // DETECCIÓN CAMBIO DE CARGO (Solo si ya existe y el cargo es diferente)
        let fechaSalidaCargoAnterior = null;
        let fechaIngresoCargoNuevo = null;

        if (id && cargoViejo && cargoNuevo !== cargoViejo) {
            // El usuario dijo: "se agrega la fecha de retiro... yo lo ingreso"
            const confirmar = confirm(`El cargo cambió de ${cargoViejo} a ${cargoNuevo}.\n\n¿Deseas registrar este cambio en el historial?`);
            if (confirmar) {
                fechaSalidaCargoAnterior = prompt(`Ingrese la fecha de FIN del cargo: ${cargoViejo} (YYYY-MM-DD)`);
                fechaIngresoCargoNuevo = prompt(`Ingrese la fecha de INICIO del cargo: ${cargoNuevo} (YYYY-MM-DD)`);
                
                if (!fechaSalidaCargoAnterior || !fechaIngresoCargoNuevo) {
                    return alert("Cancelado: Se necesitan ambas fechas para registrar el cambio de cargo.");
                }
            } else {
                // Si dice que no, revertimos el cargo en el select visualmente para no guardar error
                document.getElementById('t-cargo').value = cargoViejo;
                return; 
            }
        }

        // Subir Archivos
        const fFoto = document.getElementById('t-foto').files[0];
        let fotoUrl = null; if(fFoto) fotoUrl = await subirArchivo(supabase, fFoto, 'fichas_personal');
        const fFirma = document.getElementById('t-firma').files[0];
        let firmaUrl = null; if(fFirma) firmaUrl = await subirArchivo(supabase, fFirma, 'fichas_personal');

        // Datos Generales
        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: nombre,
            fecha_nacimiento: document.getElementById('t-nacimiento').value,
            cargo: cargoNuevo, // Se guarda el nuevo cargo
            celular: document.getElementById('t-celular').value,
            // ... resto de campos ...
            profesion: document.getElementById('t-profesion').value,
            sueldo: document.getElementById('t-sueldo').value,
            direccion: document.getElementById('t-direccion').value,
            sexo: document.getElementById('t-sexo').value,
            estado_civil: document.getElementById('t-civil').value,
            conyuge: document.getElementById('t-conyuge').value,
            tipo_sangre: document.getElementById('t-sangre').value,
            // Guardamos las fechas principales en la tabla madre también para referencia rápida
            // Si es nuevo usamos el input, si es cambio usamos el prompt, si es edit normal no tocamos
            fecha_ingreso: id ? (fechaIngresoCargoNuevo || undefined) : document.getElementById('t-ingreso-manual').value
        };
        if(fotoUrl) datos.foto_url = fotoUrl;
        if(firmaUrl) datos.firma_url = firmaUrl;

        // GUARDAR EN BD PRINCIPAL
        let trabajadorResult;
        if(id) {
            trabajadorResult = await supabase.from('trabajadores').update(datos).eq('id',id).select();
        } else {
            datos.estado = 'ACTIVO';
            trabajadorResult = await supabase.from('trabajadores').insert([datos]).select();
        }

        const trabajadorId = id || trabajadorResult.data[0].id;

        // 5. LÓGICA DE HISTORIAL
        
        // A) SI ES NUEVO: Crear primer registro
        if (!id) {
            await supabase.from('historial_laboral').insert({
                trabajador_id: trabajadorId,
                cargo: cargoNuevo,
                fecha_inicio: document.getElementById('t-ingreso-manual').value,
                fecha_fin: null // Vigente
            });
        }

        // B) SI CAMBIÓ DE CARGO: Cerrar anterior y abrir nuevo
        if (id && fechaSalidaCargoAnterior && fechaIngresoCargoNuevo) {
            // 1. Cerrar el historial abierto anterior (buscamos el que tenga fecha_fin NULL y cargo viejo)
            await supabase.from('historial_laboral')
                .update({ fecha_fin: fechaSalidaCargoAnterior })
                .eq('trabajador_id', trabajadorId)
                .is('fecha_fin', null); // Asumimos que el último abierto es el que cerramos

            // 2. Crear el nuevo
            await supabase.from('historial_laboral').insert({
                trabajador_id: trabajadorId,
                cargo: cargoNuevo,
                fecha_inicio: fechaIngresoCargoNuevo,
                fecha_fin: null
            });
        }

        alert("Guardado correctamente.");
        
        // Recargar todo para ver la tabla actualizada
        if (id) {
            // Si estamos editando, recargamos el historial ahí mismo
            await cargarHistorial(id);
            document.getElementById('t-cargo-original').value = cargoNuevo; // Actualizar referencia
        } else {
            // Si es nuevo, volvemos a la lista
            recargarListas();
            cambiarVista('activos');
        }
    };

    // 6. DAR DE BAJA (Pide fecha salida -> Cierra historial)
    window.accionDarBaja = async () => {
        const id = document.getElementById('t-id').value;
        const nombre = document.getElementById('t-nombre').value;
        
        const fechaSalida = prompt(`Ingrese la FECHA DE RETIRO para ${nombre} (YYYY-MM-DD):`);
        if(!fechaSalida) return;

        // 1. Actualizar Trabajador a PASIVO
        await supabase.from('trabajadores').update({
            estado: 'PASIVO',
            fecha_salida: fechaSalida
        }).eq('id', id);

        // 2. Cerrar historial en la tabla
        // Busca cualquier registro abierto de este trabajador y le pone fecha fin
        await supabase.from('historial_laboral')
            .update({ fecha_fin: fechaSalida })
            .eq('trabajador_id', id)
            .is('fecha_fin', null);

        alert("Trabajador dado de baja.");
        recargarListas();
        cambiarVista('pasivos');
    };

    // 7. REACTIVAR (Pide fecha ingreso -> Abre nuevo historial)
    window.accionReactivar = async () => {
        const id = document.getElementById('t-id').value;
        const nombre = document.getElementById('t-nombre').value;
        const cargoActual = document.getElementById('t-cargo').value;

        const nuevaFecha = prompt(`Va a reactivar a ${nombre}.\n\nIngrese la NUEVA FECHA DE INGRESO (YYYY-MM-DD):`);
        if(!nuevaFecha) return;
        
        // Opcional: ¿Cambia de cargo?
        let nuevoCargo = prompt(`Confirme el CARGO para el reingreso:`, cargoActual);
        if(!nuevoCargo) nuevoCargo = cargoActual;

        // 1. Actualizar Trabajador a ACTIVO
        await supabase.from('trabajadores').update({
            estado: 'ACTIVO',
            fecha_ingreso: nuevaFecha,
            fecha_salida: null, // Limpiamos la salida general
            cargo: nuevoCargo
        }).eq('id', id);

        // 2. Crear nueva entrada en historial
        await supabase.from('historial_laboral').insert({
            trabajador_id: id,
            cargo: nuevoCargo,
            fecha_inicio: nuevaFecha,
            fecha_fin: null
        });

        alert("Trabajador reactivado exitosamente.");
        recargarListas();
        cambiarVista('activos');
    };

    // Utils
    async function listar(estado, gridId, countId) {
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');
        if(document.getElementById(countId)) document.getElementById(countId).innerText = data ? data.length : 0;
        const grid = document.getElementById(gridId); grid.innerHTML = '';
        data?.forEach(t => {
            const div = document.createElement('div'); div.className = 'worker-card';
            div.innerHTML = `<div class="w-avatar"><img src="${t.foto_url||'https://via.placeholder.com/50'}" style="width:100%;height:100%;object-fit:cover;"></div><div><h4 style="margin:0">${t.nombre}</h4><small>${t.cargo}</small></div>`;
            div.onclick = () => abrir(t); grid.appendChild(div);
        });
    }
    
    function recargarListas() { listar('ACTIVO', 'grid-activos', 'count-activos'); listar('PASIVO', 'grid-pasivos', 'count-pasivos'); }
    async function subirArchivo(sb, file, bucket) { const n = Date.now()+'_'+file.name.replace(/\W/g,''); const {error}=await sb.storage.from(bucket).upload(n,file); if(error)return null; return sb.storage.from(bucket).getPublicUrl(n).data.publicUrl; }
    
    recargarListas();
    
    const setupPreview = (inputId, imgId) => {
        document.getElementById(inputId).onchange = (e) => {
            if(e.target.files[0]){
                const r = new FileReader(); r.onload = (ev) => { document.getElementById(imgId).src = ev.target.result; document.getElementById(imgId).style.display='block'; }; r.readAsDataURL(e.target.files[0]);
            }
        }
    }
    setupPreview('t-foto', 'preview-foto'); setupPreview('t-firma', 'preview-firma');
}
