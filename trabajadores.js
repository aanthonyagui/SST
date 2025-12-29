// trabajadores.js - VERSIÓN: BOTÓN AMARILLO + FECHAS CALENDARIO + MOTIVOS + SELECT CARGOS

let listaCargosCache = []; // Variable global para guardar los cargos y usarlos en los modals

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // Cargar cargos al inicio para tenerlos listos
    const { data: cargosBD } = await supabase.from('cargos').select('*');
    listaCargosCache = cargosBD || [];

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
                            
                            <div id="div-fecha-ingreso-inicial" style="display:none; margin-top:5px;">
                                <label style="font-size:0.8em; color:var(--success);">Fecha de Ingreso (Nuevo):</label>
                                <input type="date" id="t-ingreso-manual" style="border:1px solid var(--success);">
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

                <div style="margin-top:20px;">
                    <button type="submit" id="btn-guardar" style="width:100%; margin-bottom:10px;">GUARDAR CAMBIOS</button>
                    
                    <button type="button" id="btn-dar-baja" style="width:100%; background:var(--danger); display:none;" onclick="abrirModalAccion('BAJA')">
                        DAR DE BAJA
                    </button>
                    
                    <button type="button" id="btn-reactivar" style="width:100%; background:var(--success); color:black; display:none;" onclick="abrirModalAccion('REACTIVAR')">
                        REACTIVAR TRABAJADOR
                    </button>
                </div>

                <div style="margin-top:30px; border-top: 2px solid #333; padding-top:20px; padding-bottom: 50px;">
                    <h4 style="color:#00d2ff; margin-bottom:10px; text-align:center;"><i class="fas fa-history"></i> Historial Laboral</h4>
                    <div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:10px;">
                        <table id="tabla-historial" style="width:100%; font-size:0.85em; border-collapse: collapse; text-align:left;">
                            <thead>
                                <tr style="color:#aaa; border-bottom:1px solid #555;">
                                    <th style="padding:5px;">Inicio</th>
                                    <th>Cargo</th>
                                    <th>Fin</th>
                                    <th>Motivo</th>
                                </tr>
                            </thead>
                            <tbody id="body-historial"></tbody>
                        </table>
                    </div>
                </div>
            </form>
        </div>

        <div id="modal-acciones" class="modal">
            <div class="container" style="max-width:350px;">
                <h3 id="modal-titulo" style="color:var(--primary)">Acción</h3>
                <p id="modal-desc" style="font-size:0.9em; color:#ccc;"></p>
                
                <div id="modal-inputs">
                    </div>

                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="document.getElementById('modal-acciones').style.display='none'" style="background:#444;">Cancelar</button>
                    <button id="btn-confirmar-accion" style="background:var(--primary); color:black; font-weight:bold;">Confirmar</button>
                </div>
            </div>
        </div>

        <div id="modal-opciones-rapidas" class="modal">
            <div class="container" style="max-width:300px;">
                <h3 style="margin-top:0;">Opciones</h3>
                <h4 id="opts-nombre" style="color:#aaa; margin-bottom:15px;"></h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button onclick="ejecutarOpcion('ficha')" style="text-align:left;"><i class="fas fa-file-pdf" style="color:var(--danger)"></i> Ficha PDF</button>
                    <button onclick="ejecutarOpcion('ats')" style="text-align:left;"><i class="fas fa-hard-hat" style="color:var(--warning)"></i> Generar ATS</button>
                    <button onclick="ejecutarOpcion('kardex')" style="text-align:left;"><i class="fas fa-clipboard-list" style="color:var(--success)"></i> Kardex EPP</button>
                    <button onclick="ejecutarOpcion('induccion')" style="text-align:left;"><i class="fas fa-chalkboard-teacher"></i> Inducción</button>
                </div>
                <button onclick="document.getElementById('modal-opciones-rapidas').style.display='none'" style="margin-top:15px; background:#444;">Cerrar</button>
            </div>
        </div>
    `;

    // =========================================================
    // LÓGICA
    // =========================================================

    // Variables temporales para el modal
    let trabajadorSeleccionadoId = null;
    let datosAccionTemp = {}; 

    // 1. LLENAR SELECT DE CARGOS EN EL FORMULARIO PRINCIPAL
    const selForm = document.getElementById('t-cargo');
    listaCargosCache.forEach(c => selForm.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`);

    // Helper: Estado Civil
    window.verificarCivil = () => {
        const val = document.getElementById('t-civil').value;
        document.getElementById('div-conyuge').style.display = (val === 'Casado' || val === 'Unión Libre') ? 'block' : 'none';
    };

    window.cambiarVista = (vista) => {
        ['vista-activos','vista-pasivos','vista-formulario'].forEach(id=>document.getElementById(id).style.display='none');
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        if(vista==='activos'){ document.getElementById('vista-activos').style.display='block'; document.getElementById('tab-activos').classList.add('active'); }
        if(vista==='pasivos'){ document.getElementById('vista-pasivos').style.display='block'; document.getElementById('tab-pasivos').classList.add('active'); }
    };

    // 2. NUEVA FICHA
    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value = '';
        document.getElementById('t-estado').value = 'ACTIVO';
        document.getElementById('t-cargo-original').value = '';
        
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150';
        document.getElementById('preview-firma').style.display = 'none';
        document.getElementById('body-historial').innerHTML = '<tr><td colspan="4" style="text-align:center; padding:10px; color:#666;">Guarde la ficha para iniciar el historial.</td></tr>';

        document.getElementById('div-fecha-ingreso-inicial').style.display = 'block'; 
        document.getElementById('t-ingreso-manual').required = true;
        document.getElementById('btn-dar-baja').style.display = 'none';
        document.getElementById('btn-reactivar').style.display = 'none';
        document.getElementById('titulo-ficha').innerText = "Nuevo Ingreso";
        document.getElementById('div-conyuge').style.display = 'none';
        
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display = 'block';
    };

    // 3. ABRIR TRABAJADOR
    async function abrir(t) {
        // Llenar datos básicos
        const fields = ['cedula','nombre','lugar','sexo','civil','sangre','discapacidad','religion','celular','correo','licencia','profesion','sueldo','afiliacion','banco','cuenta','direccion','vivienda','material','cubierta','conyuge','emer-nom','emer-tel','camisa','pantalon','zapatos'];
        fields.forEach(f => {
            const el = document.getElementById('t-'+f);
            if(el) el.value = t[f.replace('-','_')] || t[f] || '';
        });

        document.getElementById('t-nacimiento').value = t.fecha_nacimiento || '';
        document.getElementById('t-cargo').value = t.cargo || '';
        document.getElementById('t-cargo-original').value = t.cargo || ''; 
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-estado').value = t.estado;
        
        if(t.fecha_nacimiento) {
            const age = new Date().getFullYear() - new Date(t.fecha_nacimiento).getFullYear();
            document.getElementById('t-edad').value = age;
        }

        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150';
        document.getElementById('preview-firma').style.display = t.firma_url ? 'block' : 'none';
        if(t.firma_url) document.getElementById('preview-firma').src = t.firma_url;
        
        verificarCivil();

        document.getElementById('div-fecha-ingreso-inicial').style.display = 'none'; 
        document.getElementById('t-ingreso-manual').required = false; 
        
        if(t.estado === 'ACTIVO') {
            document.getElementById('btn-dar-baja').style.display = 'block';
            document.getElementById('btn-reactivar').style.display = 'none';
        } else {
            document.getElementById('btn-dar-baja').style.display = 'none';
            document.getElementById('btn-reactivar').style.display = 'block';
        }

        document.getElementById('titulo-ficha').innerText = `Editando: ${t.nombre}`;
        await cargarHistorial(t.id);
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    }

    async function cargarHistorial(trabajadorId) {
        const tbody = document.getElementById('body-historial');
        tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

        const { data } = await supabase.from('historial_laboral')
            .select('*')
            .eq('trabajador_id', trabajadorId)
            .order('fecha_inicio', { ascending: false });

        tbody.innerHTML = '';
        if(!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#666;">Sin historial</td></tr>';
            return;
        }

        data.forEach(h => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #333';
            tr.innerHTML = `
                <td style="padding:8px; color:#fff;">${h.fecha_inicio || '-'}</td>
                <td style="color:var(--primary);">${h.cargo}</td>
                <td style="color:${h.fecha_fin ? '#ff4444' : '#00C851'}">${h.fecha_fin || 'Vigente'}</td>
                <td style="color:#aaa; font-style:italic;">${h.motivo || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. GUARDAR (Maneja Nuevo Ingreso y Cambio de Cargo con MODAL)
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        
        let id = document.getElementById('t-id').value;
        const cargoNuevo = document.getElementById('t-cargo').value;
        const cargoViejo = document.getElementById('t-cargo-original').value;
        const nombre = document.getElementById('t-nombre').value.toUpperCase();

        if (!id && !document.getElementById('t-ingreso-manual').value) {
            return alert("ERROR: Ingrese la FECHA DE INGRESO para el nuevo trabajador.");
        }

        // DETECCIÓN CAMBIO DE CARGO -> ABRIR MODAL INTERNO
        if (id && cargoViejo && cargoNuevo !== cargoViejo) {
            // Guardamos datos temporalmente y abrimos modal
            trabajadorSeleccionadoId = id;
            datosAccionTemp = { tipo: 'CAMBIO_CARGO', cargoNuevo: cargoNuevo, cargoViejo: cargoViejo };
            abrirModalAccion('CAMBIO_CARGO');
            return; // DETENEMOS EL SUBMIT AQUÍ, SE CONTINÚA EN confirmarAccion
        }

        // Si no hay cambio de cargo especial, guardamos directo
        await procesarGuardadoFinal();
    };

    // Función que realmente guarda en la BD (llamada directa o por el modal)
    async function procesarGuardadoFinal(datosExtra = {}) {
        let id = document.getElementById('t-id').value;
        const nombre = document.getElementById('t-nombre').value.toUpperCase();
        
        const fFoto = document.getElementById('t-foto').files[0];
        let fotoUrl = null; if(fFoto) fotoUrl = await subirArchivo(supabase, fFoto, 'fichas_personal');
        const fFirma = document.getElementById('t-firma').files[0];
        let firmaUrl = null; if(fFirma) firmaUrl = await subirArchivo(supabase, fFirma, 'fichas_personal');

        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: nombre,
            fecha_nacimiento: document.getElementById('t-nacimiento').value,
            cargo: document.getElementById('t-cargo').value,
            celular: document.getElementById('t-celular').value,
            profesion: document.getElementById('t-profesion').value,
            sueldo: document.getElementById('t-sueldo').value,
            direccion: document.getElementById('t-direccion').value,
            sexo: document.getElementById('t-sexo').value,
            estado_civil: document.getElementById('t-civil').value,
            conyuge: document.getElementById('t-conyuge').value,
            tipo_sangre: document.getElementById('t-sangre').value,
            fecha_ingreso: (!id) ? document.getElementById('t-ingreso-manual').value : undefined
        };
        if(datos.fecha_ingreso === undefined) delete datos.fecha_ingreso;
        if(fotoUrl) datos.foto_url = fotoUrl;
        if(firmaUrl) datos.firma_url = firmaUrl;

        // GUARDADO EN SUPABASE
        let data, error;
        if(id) {
            const res = await supabase.from('trabajadores').update(datos).eq('id',id).select();
            data = res.data; error = res.error;
        } else {
            datos.estado = 'ACTIVO';
            const res = await supabase.from('trabajadores').insert([datos]).select();
            data = res.data; error = res.error;
        }

        if(error) return alert("Error al guardar: " + error.message);
        
        const trabajadorId = data[0].id;
        document.getElementById('t-id').value = trabajadorId; // update ID

        // LÓGICA HISTORIAL
        // A) SI ES NUEVO
        if (!id) {
            await supabase.from('historial_laboral').insert({
                trabajador_id: trabajadorId,
                cargo: datos.cargo,
                fecha_inicio: document.getElementById('t-ingreso-manual').value,
                motivo: 'Ingreso Inicial'
            });
        }

        // B) SI HUBO CAMBIO DE CARGO (Viene del modal)
        if (datosExtra.tipo === 'CAMBIO_CARGO') {
            // Cerrar anterior
            await supabase.from('historial_laboral')
                .update({ fecha_fin: datosExtra.fechaSalida, motivo: datosExtra.motivoSalida })
                .eq('trabajador_id', trabajadorId)
                .is('fecha_fin', null);

            // Abrir nuevo
            await supabase.from('historial_laboral').insert({
                trabajador_id: trabajadorId,
                cargo: datosExtra.cargoNuevo,
                fecha_inicio: datosExtra.fechaEntrada,
                motivo: 'Cambio de Cargo'
            });
        }

        alert("Guardado exitosamente.");
        document.getElementById('modal-acciones').style.display = 'none'; // Cerrar modal si estaba abierto
        
        if(!id) abrir(data[0]); 
        else {
            await cargarHistorial(trabajadorId);
            document.getElementById('t-cargo-original').value = datos.cargo;
        }
        recargarListas(); 
    }

    // =========================================================
    // SISTEMA DE MODAL DE ACCIONES (BAJA / REACTIVAR / CAMBIO)
    // =========================================================

    window.abrirModalAccion = (tipo) => {
        const modal = document.getElementById('modal-acciones');
        const titulo = document.getElementById('modal-titulo');
        const desc = document.getElementById('modal-desc');
        const inputs = document.getElementById('modal-inputs');
        const nombre = document.getElementById('t-nombre').value;
        const cargoActual = document.getElementById('t-cargo-original').value;

        trabajadorSeleccionadoId = document.getElementById('t-id').value;
        datosAccionTemp = { tipo: tipo };
        inputs.innerHTML = ''; // Limpiar

        // 1. MODAL DAR DE BAJA
        if (tipo === 'BAJA') {
            titulo.innerText = "Dar de Baja";
            desc.innerText = `Finalizar contrato de ${nombre}`;
            inputs.innerHTML = `
                <label>Fecha de Salida:</label>
                <input type="date" id="acc-fecha-salida" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;">
                <label>Motivo de Salida:</label>
                <input type="text" id="acc-motivo" placeholder="Ej: Renuncia voluntaria, Despido..." style="width:100%; padding:10px;">
            `;
        }
        // 2. MODAL REACTIVAR
        else if (tipo === 'REACTIVAR') {
            titulo.innerText = "Reactivar Trabajador";
            desc.innerText = `Reingreso de ${nombre}`;
            
            // Crear select de cargos HTML
            let options = listaCargosCache.map(c => `<option value="${c.nombre}" ${c.nombre===cargoActual?'selected':''}>${c.nombre}</option>`).join('');
            
            inputs.innerHTML = `
                <label>Fecha de Reingreso:</label>
                <input type="date" id="acc-fecha-ingreso" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;">
                <label>Cargo de Reingreso:</label>
                <select id="acc-cargo-nuevo" style="width:100%; padding:10px;">${options}</select>
            `;
        }
        // 3. MODAL CAMBIO CARGO (Automático desde el submit)
        else if (tipo === 'CAMBIO_CARGO') {
            titulo.innerText = "Cambio de Cargo";
            desc.innerText = `De ${datosAccionTemp.cargoViejo} a ${datosAccionTemp.cargoNuevo}`;
            inputs.innerHTML = `
                <label>Fecha Fin (${datosAccionTemp.cargoViejo}):</label>
                <input type="date" id="acc-fecha-salida" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;">
                <label>Fecha Inicio (${datosAccionTemp.cargoNuevo}):</label>
                <input type="date" id="acc-fecha-ingreso" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;">
                <label>Motivo Cambio (Opcional):</label>
                <input type="text" id="acc-motivo" placeholder="Ej: Ascenso, Reestructuración" style="width:100%; padding:10px;">
            `;
        }

        modal.style.display = 'flex';
    };

    // Botón CONFIRMAR del Modal
    document.getElementById('btn-confirmar-accion').onclick = async () => {
        const tipo = datosAccionTemp.tipo;
        const id = trabajadorSeleccionadoId;

        // EJECUTAR BAJA
        if (tipo === 'BAJA') {
            const fecha = document.getElementById('acc-fecha-salida').value;
            const motivo = document.getElementById('acc-motivo').value;
            if(!fecha || !motivo) return alert("Ingrese fecha y motivo");

            await supabase.from('trabajadores').update({ estado: 'PASIVO', fecha_salida: fecha }).eq('id', id);
            await supabase.from('historial_laboral').update({ fecha_fin: fecha, motivo: motivo }).eq('trabajador_id', id).is('fecha_fin', null);

            alert("Baja registrada.");
            document.getElementById('modal-acciones').style.display = 'none';
            recargarListas();
            cambiarVista('pasivos');
        }

        // EJECUTAR REACTIVACIÓN
        else if (tipo === 'REACTIVAR') {
            const fecha = document.getElementById('acc-fecha-ingreso').value;
            const cargo = document.getElementById('acc-cargo-nuevo').value;
            if(!fecha) return alert("Ingrese fecha");

            await supabase.from('trabajadores').update({ estado: 'ACTIVO', fecha_ingreso: fecha, fecha_salida: null, cargo: cargo }).eq('id', id);
            await supabase.from('historial_laboral').insert({ trabajador_id: id, cargo: cargo, fecha_inicio: fecha, motivo: 'Reingreso' });

            alert("Reactivado exitosamente.");
            document.getElementById('modal-acciones').style.display = 'none';
            recargarListas();
            cambiarVista('activos');
        }

        // EJECUTAR CAMBIO DE CARGO
        else if (tipo === 'CAMBIO_CARGO') {
            const fSalida = document.getElementById('acc-fecha-salida').value;
            const fEntrada = document.getElementById('acc-fecha-ingreso').value;
            const motivo = document.getElementById('acc-motivo').value || 'Cambio de Cargo';
            
            if(!fSalida || !fEntrada) return alert("Ambas fechas son obligatorias");

            // Pasamos los datos a la función principal de guardado para que termine el proceso
            await procesarGuardadoFinal({
                tipo: 'CAMBIO_CARGO',
                fechaSalida: fSalida,
                fechaEntrada: fEntrada,
                cargoNuevo: datosAccionTemp.cargoNuevo,
                motivoSalida: motivo
            });
        }
    };

    // =========================================================
    // BOTÓN AMARILLO (OPCIONES RÁPIDAS EN LA LISTA)
    // =========================================================

    // Variable global para saber qué trabajador se eligió en opciones
    let trabajadorOpciones = null;

    window.abrirOpciones = (e, t) => {
        e.stopPropagation(); // EVITA QUE SE ABRA LA FICHA AL DAR CLIC AL BOTÓN
        trabajadorOpciones = t;
        document.getElementById('opts-nombre').innerText = t.nombre;
        document.getElementById('modal-opciones-rapidas').style.display = 'flex';
    };

    window.ejecutarOpcion = (opcion) => {
        if(!trabajadorOpciones) return;
        const nombre = trabajadorOpciones.nombre;
        
        if(opcion === 'ficha') alert(`Generando PDF Ficha para: ${nombre} (En desarrollo)`);
        if(opcion === 'ats') alert(`Generando ATS para: ${nombre}`);
        if(opcion === 'kardex') alert(`Generando Kardex para: ${nombre}`);
        if(opcion === 'induccion') alert(`Constancia Inducción para: ${nombre}`);

        document.getElementById('modal-opciones-rapidas').style.display = 'none';
    };

    // LISTAR (Incluye el Botón Amarillo)
    async function listar(estado, gridId, countId) {
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');
        if(document.getElementById(countId)) document.getElementById(countId).innerText = data ? data.length : 0;
        const grid = document.getElementById(gridId); grid.innerHTML = '';
        
        data?.forEach(t => {
            const div = document.createElement('div'); div.className = 'worker-card';
            // Layout con botón amarillo a la derecha
            div.innerHTML = `
                <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                    <div class="w-avatar"><img src="${t.foto_url||'https://via.placeholder.com/50'}" style="width:100%;height:100%;object-fit:cover;"></div>
                    <div style="margin-left:10px;"><h4 style="margin:0; font-size:0.95em;">${t.nombre}</h4><small style="color:#aaa">${t.cargo}</small></div>
                </div>
                <button class="btn-yellow-opt" style="background:#ffbb33; color:black; border:none; width:35px; height:35px; border-radius:50%; margin-left:10px; cursor:pointer; flex-shrink:0;">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            `;
            // Clic en la tarjeta abre la ficha
            div.onclick = () => abrir(t);
            // Clic en el botón amarillo abre opciones (se asigna el evento al botón interno)
            div.querySelector('.btn-yellow-opt').onclick = (e) => abrirOpciones(e, t);
            
            grid.appendChild(div);
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
