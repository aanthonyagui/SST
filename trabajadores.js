// trabajadores.js - VERSIÓN CON HISTORIAL Y CÓNYUGE

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
                        <div style="padding:10px; color:#aaa; font-size:0.8em;">ACCIONES</div>
                        <a onclick="verHistorial()"><i class="fas fa-history" style="color:#fff"></i> Ver Historial</a>
                        <hr style="border-color:#333">
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
                        <select id="t-cargo" style="margin-top:5px;" required><option value="">Seleccione Cargo...</option></select>
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
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Laboral (Historial)</summary>
                    <div class="form-grid">
                        <input id="t-profesion" placeholder="Profesión">
                        <input id="t-sueldo" placeholder="Sueldo $">
                        
                        <div>
                            <label style="font-size:0.7em; color:#aaa;">Fecha Ingreso (Actual):</label>
                            <input type="date" id="t-ingreso" readonly style="background:#222; color:#888;">
                        </div>
                        <div>
                            <label style="font-size:0.7em; color:#aaa;">Fecha Salida:</label>
                            <input type="date" id="t-salida" readonly style="background:#222; color:#888;">
                        </div>
                        
                        <div><label style="font-size:0.7em; color:#aaa;">Afiliación IESS:</label><input type="date" id="t-afiliacion"></div>
                        <input id="t-banco" placeholder="Banco">
                        <input id="t-cuenta" placeholder="Nº Cuenta">
                    </div>
                </details>

                <details class="seccion-form">
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Vivienda y Emergencia</summary>
                    <div class="form-grid">
                        <input id="t-direccion" placeholder="Dirección" style="grid-column:1/-1">
                        <select id="t-vivienda"><option>Propia</option><option>Arrendada</option><option>Familiar</option></select>
                        <input id="t-material" placeholder="Paredes">
                        <input id="t-cubierta" placeholder="Techo">
                        <input id="t-emer-nom" placeholder="Emergencia: Nombre">
                        <input id="t-emer-tel" placeholder="Emergencia: Teléfono">
                    </div>
                    <div class="form-grid" style="margin-top:10px;">
                        <input id="t-camisa" placeholder="Talla Camisa">
                        <input id="t-pantalon" placeholder="Talla Pantalón">
                        <input id="t-zapatos" placeholder="Talla Zapatos">
                    </div>
                </details>

                <div class="seccion-form" style="text-align:center;">
                    <img id="preview-firma" src="" style="height:60px; display:none; margin:0 auto; background:white; padding:5px;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin-top:5px;">Subir Firma</button>
                    <input type="file" id="t-firma" hidden accept="image/*">
                </div>

                <div style="margin-top:20px; padding-bottom:80px;">
                    <button type="submit" id="btn-guardar" style="width:100%; margin-bottom:10px;">GUARDAR FICHA</button>
                    
                    <button type="button" id="btn-dar-baja" style="width:100%; background:var(--danger); display:none;" onclick="accionBaja()">
                        DAR DE BAJA (Salida)
                    </button>
                    <button type="button" id="btn-reactivar" style="width:100%; background:var(--success); color:black; display:none;" onclick="accionReactivar()">
                        REACTIVAR (Reingreso)
                    </button>
                </div>
            </form>
        </div>

        <div id="modal-historial" class="modal">
            <div class="container" style="width:95%; max-width:500px;">
                <h3>Historial Laboral</h3>
                <div id="lista-historial" style="max-height:300px; overflow-y:auto; text-align:left; font-size:0.9em;"></div>
                <button onclick="document.getElementById('modal-historial').style.display='none'" style="margin-top:10px; background:#555;">Cerrar</button>
            </div>
        </div>
    `;

    // ==========================================
    // LÓGICA DEL MÓDULO
    // ==========================================

    window.verificarCivil = () => {
        const val = document.getElementById('t-civil').value;
        const div = document.getElementById('div-conyuge');
        if(val === 'Casado' || val === 'Unión Libre') {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
            document.getElementById('t-conyuge').value = ''; // Limpiar si cambia
        }
    };

    window.toggleMenuNombre = () => {
        const menu = document.getElementById('menu-descargas');
        const cont = document.getElementById('cont-nombre');
        menu.classList.toggle('show');
        if(menu.classList.contains('show')) cont.classList.add('show-bg');
        else cont.classList.remove('show-bg');
    };

    window.cambiarVista = (vista) => {
        ['vista-activos','vista-pasivos','vista-formulario'].forEach(id=>document.getElementById(id).style.display='none');
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        
        if(vista === 'activos') {
            document.getElementById('vista-activos').style.display='block';
            document.getElementById('tab-activos').classList.add('active');
            document.getElementById('cont-nombre').style.display='none';
            document.getElementById('bus-act').focus();
        }
        if(vista === 'pasivos') {
            document.getElementById('vista-pasivos').style.display='block';
            document.getElementById('tab-pasivos').classList.add('active');
            document.getElementById('cont-nombre').style.display='none';
        }
    };

    // ------------------------------------------
    // CARGA DE DATOS
    // ------------------------------------------

    // Llenar combo de cargos al inicio
    const { data: cargos } = await supabase.from('cargos').select('*');
    const sel = document.getElementById('t-cargo');
    cargos?.forEach(c => sel.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`);

    async function listar(estado, gridId, countId) {
        const { data } = await supabase.from('trabajadores')
            .select('*')
            .eq('empresa_id', empresa.id)
            .eq('estado', estado)
            .order('nombre');
        
        if(document.getElementById(countId)) document.getElementById(countId).innerText = data ? data.length : 0;
        
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';
        
        data?.forEach(t => {
            const div = document.createElement('div');
            div.className = 'worker-card';
            div.innerHTML = `
                <div class="w-avatar"><img src="${t.foto_url || 'https://via.placeholder.com/50'}" style="width:100%; height:100%; object-fit:cover;"></div>
                <div><h4 style="margin:0">${t.nombre}</h4><small style="color:#aaa">${t.cargo}</small></div>
            `;
            div.onclick = () => abrir(t);
            grid.appendChild(div);
        });
    }

    function abrir(t) {
        // Llenado básico
        const fields = ['cedula','nombre','lugar','sexo','civil','sangre','discapacidad','religion','celular','correo','licencia','cargo','profesion','sueldo','afiliacion','banco','cuenta','direccion','vivienda','material','cubierta','camisa','pantalon','zapatos','conyuge'];
        fields.forEach(f => {
            const el = document.getElementById('t-'+f);
            if(el) el.value = t[f.replace('-','_')] || t[f] || '';
        });
        
        // Manejo específico de fechas
        document.getElementById('t-nacimiento').value = t.fecha_nacimiento || '';
        document.getElementById('t-ingreso').value = t.fecha_ingreso || '';
        document.getElementById('t-salida').value = t.fecha_salida || '';
        
        // Guardar estado original para detectar cambios
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-cargo-original').value = t.cargo; 
        document.getElementById('t-estado').value = t.estado;

        // Cónyuge
        verificarCivil(); // Muestra/oculta según el valor cargado

        // Edad
        if(t.fecha_nacimiento) {
            const h = new Date(); const n = new Date(t.fecha_nacimiento + 'T00:00:00');
            let e = h.getFullYear() - n.getFullYear(); 
            if(h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
            document.getElementById('t-edad').value = e;
        }

        // Emergencias y Fotos
        document.getElementById('t-emer-nom').value = t.emergencia_nombre;
        document.getElementById('t-emer-tel').value = t.emergencia_telefono;
        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150';
        
        if(t.firma_url) { 
            document.getElementById('preview-firma').src = t.firma_url; 
            document.getElementById('preview-firma').style.display = 'block'; 
        } else {
            document.getElementById('preview-firma').style.display = 'none';
        }

        // Botones de acción
        if(t.estado === 'ACTIVO') {
            document.getElementById('btn-dar-baja').style.display = 'block';
            document.getElementById('btn-reactivar').style.display = 'none';
        } else {
            document.getElementById('btn-dar-baja').style.display = 'none';
            document.getElementById('btn-reactivar').style.display = 'block';
        }

        document.getElementById('lbl-nombre-trab').innerText = t.nombre.split(' ')[0];
        document.getElementById('cont-nombre').style.display = 'inline-flex';
        document.getElementById('titulo-ficha').innerText = `Editando: ${t.nombre}`;

        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    }

    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value = '';
        document.getElementById('t-estado').value = 'ACTIVO';
        document.getElementById('t-cargo-original').value = '';
        
        // Limpiar visuales
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150';
        document.getElementById('preview-firma').style.display = 'none';
        document.getElementById('div-conyuge').style.display = 'none';
        
        // Habilitar fecha ingreso para el nuevo
        document.getElementById('t-ingreso').removeAttribute('readonly');
        document.getElementById('t-ingreso').style.background = '#000';
        document.getElementById('t-ingreso').focus();

        document.getElementById('btn-dar-baja').style.display = 'none';
        document.getElementById('btn-reactivar').style.display = 'none';
        document.getElementById('titulo-ficha').innerText = "Nuevo Ingreso";
        document.getElementById('cont-nombre').style.display = 'none';

        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display = 'block';
    };

    // ------------------------------------------
    // GUARDADO INTELIGENTE (Detecta cambio de cargo)
    // ------------------------------------------

    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('t-id').value;
        const cargoNuevo = document.getElementById('t-cargo').value;
        const cargoViejo = document.getElementById('t-cargo-original').value;
        const nombre = document.getElementById('t-nombre').value.toUpperCase();
        
        // 1. Detectar si hubo CAMBIO DE CARGO en un trabajador existente
        let fechaFinViejo = null;
        let fechaInicioNuevo = null;

        if (id && cargoViejo && cargoNuevo !== cargoViejo) {
            const confirmar = confirm(`Has cambiado el cargo de ${cargoViejo} a ${cargoNuevo}.\n\n¿Deseas registrar esto en el historial?`);
            if (confirmar) {
                fechaFinViejo = prompt(`Fecha de fin para el cargo ${cargoViejo} (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);
                fechaInicioNuevo = prompt(`Fecha de inicio para el cargo ${cargoNuevo} (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);
                
                if (!fechaFinViejo || !fechaInicioNuevo) return alert("Debes ingresar ambas fechas para registrar el cambio.");
            } else {
                // Si cancela, revertimos el cargo en el select visualmente (opcional) o simplemente guardamos sin historial
                alert("Se guardará el cambio sin historial.");
            }
        }

        // 2. Subir Archivos
        const fFoto = document.getElementById('t-foto').files[0];
        let fotoUrl = null; if(fFoto) fotoUrl = await subirArchivo(supabase, fFoto, 'fichas_personal');
        
        const fFirma = document.getElementById('t-firma').files[0];
        let firmaUrl = null; if(fFirma) firmaUrl = await subirArchivo(supabase, fFirma, 'fichas_personal');

        // 3. Preparar Datos Generales
        const serv = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c=>c.value).join(',');
        
        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: nombre,
            fecha_nacimiento: document.getElementById('t-nacimiento').value,
            cargo: cargoNuevo,
            // Solo actualizamos fecha_ingreso si es NUEVO registro o Reactivación explícita
            // En edición normal, no tocamos fechas a menos que el usuario las haya desbloqueado
            celular: document.getElementById('t-celular').value,
            emergencia_nombre: document.getElementById('t-emer-nom').value,
            emergencia_telefono: document.getElementById('t-emer-tel').value,
            profesion: document.getElementById('t-profesion').value,
            sueldo: document.getElementById('t-sueldo').value,
            direccion: document.getElementById('t-direccion').value,
            lugar_nacimiento: document.getElementById('t-lugar').value,
            sexo: document.getElementById('t-sexo').value,
            estado_civil: document.getElementById('t-civil').value,
            conyuge: document.getElementById('t-conyuge').value, // NUEVO CAMPO
            tipo_sangre: document.getElementById('t-sangre').value,
            vivienda: document.getElementById('t-vivienda').value,
            material_paredes: document.getElementById('t-material').value,
            material_cubierta: document.getElementById('t-cubierta').value,
            talla_camisa: document.getElementById('t-camisa').value,
            talla_pantalon: document.getElementById('t-pantalon').value,
            talla_zapatos: document.getElementById('t-zapatos').value
        };

        if(fotoUrl) datos.foto_url = fotoUrl;
        if(firmaUrl) datos.firma_url = firmaUrl;
        
        // Si es NUEVO, tomamos la fecha de ingreso del input (que desbloqueamos)
        if(!id) {
            datos.fecha_ingreso = document.getElementById('t-ingreso').value;
            datos.estado = 'ACTIVO';
        }
        
        // Si hubo cambio de cargo con fechas
        if (fechaInicioNuevo) {
            datos.fecha_ingreso = fechaInicioNuevo; // Actualizamos la fecha de ingreso "actual" al nuevo cargo
        }

        // 4. GUARDAR EN BD
        let result;
        if(id) {
            result = await supabase.from('trabajadores').update(datos).eq('id',id).select();
        } else {
            result = await supabase.from('trabajadores').insert([datos]).select();
        }

        const trabajadorGuardado = result.data[0];

        // 5. ACTUALIZAR HISTORIAL (Si hubo cambio de cargo o es Nuevo)
        if (id && fechaFinViejo && fechaInicioNuevo) {
            // Cerrar historial anterior
            await supabase.from('historial_laboral').insert({
                trabajador_id: id,
                cargo: cargoViejo,
                fecha_inicio: document.getElementById('t-ingreso').value, // La fecha que tenía antes
                fecha_fin: fechaFinViejo,
                motivo: 'Cambio de Cargo'
            });
            // El nuevo periodo empieza implícitamente ahora, se guardará cuando termine este cargo
        } 
        else if (!id) {
            // Es nuevo, opcionalmente podemos crear un registro inicial en historial
             await supabase.from('historial_laboral').insert({
                trabajador_id: trabajadorGuardado.id,
                cargo: trabajadorGuardado.cargo,
                fecha_inicio: trabajadorGuardado.fecha_ingreso,
                motivo: 'Ingreso Inicial'
            });
        }
        
        alert("Ficha guardada correctamente");
        recargarListas();
        cambiarVista('activos');
    };

    // ------------------------------------------
    // ACCIONES DE ESTADO (BAJA / REACTIVAR)
    // ------------------------------------------

    window.accionBaja = async () => {
        const id = document.getElementById('t-id').value;
        const nombre = document.getElementById('t-nombre').value;
        
        const fechaSalida = prompt(`Ingrese la FECHA DE SALIDA para ${nombre} (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);
        if(!fechaSalida) return;

        // 1. Guardar en historial el periodo que termina
        const cargoActual = document.getElementById('t-cargo').value;
        const fechaInicioActual = document.getElementById('t-ingreso').value;

        await supabase.from('historial_laboral').insert({
            trabajador_id: id,
            cargo: cargoActual,
            fecha_inicio: fechaInicioActual,
            fecha_fin: fechaSalida,
            motivo: 'Baja / Renuncia'
        });

        // 2. Actualizar trabajador
        const { error } = await supabase.from('trabajadores').update({
            estado: 'PASIVO',
            fecha_salida: fechaSalida
        }).eq('id', id);

        if(error) alert("Error al dar de baja");
        else {
            alert("Trabajador dado de baja correctamente.");
            recargarListas();
            cambiarVista('pasivos');
        }
    };

    window.accionReactivar = async () => {
        const id = document.getElementById('t-id').value;
        const nombre = document.getElementById('t-nombre').value;
        
        // Al reactivar, necesitamos la NUEVA fecha de ingreso (re-ingreso)
        const nuevaFechaIngreso = prompt(`Ingrese la FECHA DE RE-INGRESO para ${nombre} (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);
        if(!nuevaFechaIngreso) return;
        
        // Opcional: ¿Cambia de cargo al volver?
        const nuevoCargo = prompt("Ingrese el CARGO de reingreso (o deje vacío para mantener el anterior):");
        const datosUpdate = {
            estado: 'ACTIVO',
            fecha_ingreso: nuevaFechaIngreso,
            fecha_salida: null // Limpiamos la salida porque volvió
        };
        if(nuevoCargo) datosUpdate.cargo = nuevoCargo;

        // Actualizar
        await supabase.from('trabajadores').update(datosUpdate).eq('id', id);
        
        // Registrar inicio de nuevo ciclo en historial? 
        // Normalmente el historial guarda periodos CERRADOS, pero podemos guardar el inicio
         await supabase.from('historial_laboral').insert({
            trabajador_id: id,
            cargo: nuevoCargo || document.getElementById('t-cargo').value,
            fecha_inicio: nuevaFechaIngreso,
            motivo: 'Reingreso'
        });

        alert("Trabajador reactivado exitosamente.");
        recargarListas();
        cambiarVista('activos');
    };

    window.verHistorial = async () => {
        const id = document.getElementById('t-id').value;
        if(!id) return;
        
        const { data } = await supabase.from('historial_laboral')
            .select('*').eq('trabajador_id', id).order('fecha_inicio', { ascending: false });
        
        const lista = document.getElementById('lista-historial');
        lista.innerHTML = '';
        
        if(!data || data.length === 0) {
            lista.innerHTML = '<p>No hay historial registrado aún.</p>';
        } else {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.innerHTML = `<tr style="border-bottom:1px solid #555; text-align:left;"><th>Cargo</th><th>Inicio</th><th>Fin</th><th>Motivo</th></tr>`;
            
            data.forEach(h => {
                table.innerHTML += `
                    <tr style="border-bottom:1px solid #333; font-size:0.85em;">
                        <td style="padding:5px;">${h.cargo}</td>
                        <td>${h.fecha_inicio || '-'}</td>
                        <td>${h.fecha_fin || 'Activo'}</td>
                        <td style="color:#aaa">${h.motivo || ''}</td>
                    </tr>
                `;
            });
            lista.appendChild(table);
        }
        document.getElementById('modal-historial').style.display = 'flex';
    };

    // Utils
    function recargarListas() {
        listar('ACTIVO', 'grid-activos', 'count-activos');
        listar('PASIVO', 'grid-pasivos', 'count-pasivos');
    }
    async function subirArchivo(sb, file, bucket) { const n = Date.now()+'_'+file.name.replace(/\W/g,''); const {error}=await sb.storage.from(bucket).upload(n,file); if(error)return null; return sb.storage.from(bucket).getPublicUrl(n).data.publicUrl; }

    recargarListas();
    
    // Preview imagenes
    const setupPreview = (inputId, imgId) => {
        document.getElementById(inputId).onchange = (e) => {
            if(e.target.files[0]){
                const r = new FileReader();
                r.onload = (ev) => { document.getElementById(imgId).src = ev.target.result; document.getElementById(imgId).style.display='block'; };
                r.readAsDataURL(e.target.files[0]);
            }
        }
    }
    setupPreview('t-foto', 'preview-foto');
    setupPreview('t-firma', 'preview-firma');
}
