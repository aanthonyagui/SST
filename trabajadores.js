// trabajadores.js - VERSIÓN FINAL: FICHA SIN FIRMA DIGITAL Y ATS EXTERNO

let listaCargosCache = []; 

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    const { data: cargosBD } = await supabase.from('cargos').select('*');
    listaCargosCache = cargosBD || [];

    contenedor.innerHTML = `
        <style>
            #vista-formulario input[type="text"], 
            #vista-formulario textarea, 
            #vista-formulario select { text-transform: uppercase; }
            .hijo-card { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid var(--primary); }
        </style>

        <div class="header-tools">
            <h2 style="margin:0; margin-bottom:10px;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            <div id="tab-container">
                <button class="tab-btn active" id="tab-activos" onclick="cambiarVista('activos')"><i class="fas fa-user-check"></i> <span class="desktop-text">Activos</span> <span id="count-activos" class="badge bg-green">0</span></button>
                <button class="tab-btn" id="tab-pasivos" onclick="cambiarVista('pasivos')"><i class="fas fa-user-times"></i> <span class="desktop-text">Retirados</span> <span id="count-pasivos" class="badge bg-red">0</span></button>
                
                <div class="dropdown" id="cont-opciones-mas">
                    <button class="tab-btn" onclick="toggleMenuMas()" style="background:rgba(255,255,255,0.1);"><i class="fas fa-plus"></i> <span class="desktop-text">Opciones</span> <i class="fas fa-caret-down"></i></button>
                    <div id="menu-mas" class="dropdown-content">
                        <div style="padding:10px; color:#aaa; font-size:0.8em;">GESTIÓN</div>
                        <a onclick="nuevaFicha()"><i class="fas fa-user-plus" style="color:var(--primary)"></i> Ficha Socioeconómica</a>
                        <hr style="border-color:#333; margin:5px 0;">
                        <div style="padding:10px; color:#aaa; font-size:0.8em;">REPORTES EXCEL</div>
                        <a onclick="descargarExcel('ACTIVO')"><i class="fas fa-file-excel" style="color:#00C851"></i> Descargar Activos</a>
                        <a onclick="descargarExcel('PASIVO')"><i class="fas fa-file-excel" style="color:#ff4444"></i> Descargar Pasivos</a>
                        <hr style="border-color:#333; margin:5px 0;">
                        <a onclick="toggleMenuMas()" style="color:#666;"><i class="fas fa-times"></i> Cerrar</a>
                    </div>
                </div>

                <div class="dropdown" id="cont-nombre" style="display:none;">
                    <button class="tab-btn btn-nombre" onclick="toggleMenuNombre()"><i class="fas fa-user"></i> <span id="lbl-nombre-trab">TRABAJADOR</span> <i class="fas fa-caret-down"></i></button>
                    <div id="menu-descargas" class="dropdown-content">
                        <div style="padding:10px; color:#aaa; font-size:0.8em;">DOCUMENTOS PDF</div>
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf" style="color:var(--danger)"></i> Ficha PDF</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-hard-hat" style="color:var(--warning)"></i> Generar ATS</a>
                        <a onclick="imprimirDoc('carnet')"><i class="fas fa-id-card" style="color:#f39c12"></i> Carnet</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list" style="color:var(--success)"></i> Kardex EPP</a>
                        <a onclick="imprimirDoc('induccion')"><i class="fas fa-chalkboard-teacher"></i> Inducción</a>
                        <hr style="border-color:#333; margin:5px 0;">
                        <a onclick="toggleMenuNombre()" style="color:#666;"><i class="fas fa-times"></i> Cerrar</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">

        <div id="vista-activos"><input type="text" id="bus-act" placeholder="BUSCAR TRABAJADOR ACTIVO..." style="width:100%; border-radius:30px; margin-bottom:15px; text-transform:uppercase;"><div id="grid-activos" class="worker-grid">Cargando...</div></div>
        <div id="vista-pasivos" style="display:none;"><input type="text" id="bus-pas" placeholder="BUSCAR TRABAJADOR RETIRADO..." style="width:100%; border-radius:30px; border-color:var(--danger); margin-bottom:15px; text-transform:uppercase;"><div id="grid-pasivos" class="worker-grid">Cargando...</div></div>

        <div id="vista-formulario" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;"><h3 style="margin:0; color:#00d2ff;" id="titulo-ficha">FICHA PERSONAL</h3><button onclick="cambiarVista('activos')" style="background:#555; width:auto; padding:8px 15px;"><i class="fas fa-arrow-left"></i> VOLVER</button></div>
            <form id="form-trabajador">
                <input type="hidden" id="t-id"><input type="hidden" id="t-estado" value="ACTIVO"><input type="hidden" id="t-cargo-original"> 
                
                <div style="background:rgba(255,255,255,0.05); border:1px solid #444; border-radius:15px; padding:15px; display:flex; gap:15px; align-items:center; margin-bottom:20px;">
                    <div style="text-align:center;"><img id="preview-foto" src="" style="width:100px; height:120px; object-fit:cover; border-radius:10px; background:#000;"><button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:5px; width:100%;">FOTO</button><input type="file" id="t-foto" hidden accept="image/*"></div>
                    <div style="flex:1;">
                        <input id="t-cedula" placeholder="CÉDULA" style="margin-bottom:5px;" required><input id="t-nombre" placeholder="NOMBRE COMPLETO" style="margin-bottom:5px;" required>
                        <div style="display:flex; gap:5px;"><input type="date" id="t-nacimiento" title="FECHA NACIMIENTO" required><input id="t-edad" placeholder="EDAD" readonly style="width:60px; text-align:center; background:#222;"></div>
                        <div style="margin-top:10px;"><label style="font-size:0.8em; color:var(--primary);">CARGO:</label><select id="t-cargo" style="margin-top:2px;" required><option value="">SELECCIONE...</option></select><div id="div-fecha-ingreso-inicial" style="display:none; margin-top:5px;"><label style="font-size:0.8em; color:var(--success);">INGRESO (NUEVO):</label><input type="date" id="t-ingreso-manual" style="border:1px solid var(--success);"></div></div>
                    </div>
                </div>

                <details open class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">DATOS PERSONALES</summary>
                    <div class="form-grid">
                        <select id="t-sexo"><option>HOMBRE</option><option>MUJER</option></select>
                        <select id="t-civil" onchange="verificarCivil()"><option value="SOLTERO">SOLTERO</option><option value="CASADO">CASADO</option><option value="UNION DE HECHO">UNIÓN DE HECHO</option><option value="DIVORCIADO">DIVORCIADO</option><option value="VIUDO">VIUDO</option></select>
                        <div id="div-conyuge" style="display:none; grid-column:1/-1; background:rgba(255,255,255,0.1); padding:10px; border-radius:8px;"><label style="font-size:0.8em; color:#00d2ff;">NOMBRE CÓNYUGE:</label><input id="t-conyuge" placeholder="NOMBRE ESPOSO/A"></div>
                        <select id="t-sangre"><option value="">TIPO SANGRE</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select>
                        <select id="t-religion"><option value="CATOLICA">CATÓLICA</option><option value="CRISTIANO">CRISTIANO</option><option value="EVANGELICA">EVANGÉLICA</option><option value="TESTIGO DE JEHOVA">TESTIGO DE JEHOVÁ</option><option value="ATEISMO">ATEÍSMO</option><option value="NINGUNA">NINGUNA</option><option value="OTRA">OTRA</option></select>
                        <input id="t-nacionalidad" value="ECUATORIANA"><input id="t-lugar" placeholder="LUGAR NACIMIENTO"><input id="t-discapacidad" placeholder="DISCAPACIDAD (NO / %)">
                        <input id="t-celular" placeholder="CELULAR"><input id="t-correo" placeholder="CORREO">
                        <select id="t-licencia"><option value="NINGUNA">LICENCIA: NINGUNA</option><option value="A">A</option><option value="A1">A1</option><option value="B">B</option><option value="C">C</option><option value="C1">C1</option><option value="D">D</option><option value="D1">D1</option><option value="E">E</option><option value="E1">E1</option><option value="F">F</option><option value="G">G</option></select>
                    </div>
                    <div style="margin-top:15px; border-top:1px solid #444; padding-top:10px;"><div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><label>Nº HIJOS:</label><input id="t-num-hijos" type="number" min="0" value="0" style="width:60px; text-align:center;" oninput="generarCamposHijos()"></div><div id="contenedor-hijos"></div></div>
                </details>

                <details class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">LABORAL Y BANCO</summary>
                    <div class="form-grid"><input id="t-profesion" placeholder="PROFESIÓN"><input id="t-sueldo" type="number" step="0.01" placeholder="SUELDO $"><div><label style="font-size:0.7em;">AFILIACIÓN IESS:</label><input type="date" id="t-afiliacion"></div><input id="t-banco" placeholder="BANCO"><input id="t-cuenta" placeholder="Nº CUENTA"></div>
                </details>

                <details class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">VIVIENDA Y SERVICIOS</summary>
                    <div class="form-grid"><input id="t-direccion" placeholder="DIRECCIÓN" style="grid-column:1/-1"><select id="t-vivienda"><option value="PROPIA">VIVIENDA: PROPIA</option><option value="ARRENDADA">VIVIENDA: ARRENDADA</option><option value="FAMILIAR">VIVIENDA: FAMILIAR</option><option value="PRESTADA">VIVIENDA: PRESTADA</option></select><select id="t-material"><option value="">PAREDES...</option><option value="CEMENTO">CEMENTO</option><option value="MIXTA">MIXTA</option><option value="CAÑA">CAÑA</option><option value="ADOBE">ADOBE</option><option value="MADERA">MADERA</option></select><select id="t-cubierta"><option value="">TECHO...</option><option value="ZINC">ZINC</option><option value="LOSA">LOSA</option><option value="TEJA">TEJA</option><option value="ETERNIT">ETERNIT</option></select><input id="t-habitaciones" type="number" placeholder="HABITACIONES"></div>
                    <div class="multi-select-box" style="margin-top:10px;"><label>SERVICIOS:</label><br><label><input type="checkbox" name="serv" value="LUZ"> LUZ</label><label><input type="checkbox" name="serv" value="AGUA"> AGUA</label><label><input type="checkbox" name="serv" value="INTERNET"> INTERNET</label></div>
                </details>

                <details class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">TALLAS Y EMERGENCIA</summary>
                    <div class="form-grid"><select id="t-camisa"><option value="">CAMISA...</option><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option><option value="XXXL">XXXL</option></select><select id="t-pantalon"><option value="">PANTALÓN...</option><option value="28">28</option><option value="30">30</option><option value="32">32</option><option value="34">34</option><option value="36">36</option><option value="38">38</option><option value="40">40</option><option value="42">42</option><option value="44">44</option><option value="46">46</option></select><select id="t-zapatos"><option value="">ZAPATOS...</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option></select></div>
                    <div class="form-grid" style="margin-top:10px;"><input id="t-emer-nom" placeholder="EMERGENCIA 1: NOMBRE"><input id="t-emer-tel" placeholder="EMERGENCIA 1: TELÉFONO"><input id="t-emer2-nom" placeholder="EMERGENCIA 2: NOMBRE"><input id="t-emer2-tel" placeholder="EMERGENCIA 2: TELÉFONO"></div>
                </details>

                <div class="seccion-form" style="text-align:center;"><img id="preview-firma" src="" style="height:60px; display:none; margin:0 auto; background:white; padding:5px;"><button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin-top:5px;">SUBIR FIRMA</button><input type="file" id="t-firma" hidden accept="image/*"></div>

                <div style="margin-top:20px;">
                    <button type="submit" id="btn-guardar" style="width:100%; margin-bottom:10px;">GUARDAR CAMBIOS</button>
                    <button type="button" id="btn-dar-baja" style="width:100%; background:var(--danger); display:none;" onclick="abrirModalAccion('BAJA')">DAR DE BAJA</button>
                    <button type="button" id="btn-reactivar" style="width:100%; background:var(--success); color:black; display:none;" onclick="abrirModalAccion('REACTIVAR')">REACTIVAR TRABAJADOR</button>
                </div>

                <div style="margin-top:30px; border-top: 2px solid #333; padding-top:20px; padding-bottom: 50px;"><h4 style="color:#00d2ff; margin-bottom:10px; text-align:center;"><i class="fas fa-history"></i> Historial Laboral</h4><div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:10px;"><table id="tabla-historial" style="width:100%; font-size:0.85em; border-collapse: collapse; text-align:left;"><thead><tr style="color:#aaa; border-bottom:1px solid #555;"><th style="padding:5px;">INICIO</th><th>CARGO</th><th>FIN</th></tr></thead><tbody id="body-historial"></tbody></table></div></div>
            </form>
        </div>

        <div id="modal-acciones" class="modal"><div class="container" style="max-width:350px;"><h3 id="modal-titulo" style="color:var(--primary)">ACCIÓN</h3><p id="modal-desc" style="font-size:0.9em; color:#ccc;"></p><div id="modal-inputs"></div><div style="margin-top:15px; display:flex; gap:10px;"><button onclick="document.getElementById('modal-acciones').style.display='none'" style="background:#444;">CANCELAR</button><button id="btn-confirmar-accion" style="background:var(--primary); color:black; font-weight:bold;">CONFIRMAR</button></div></div></div>
    `;

    // ================== LÓGICA ==================
    let trabajadorSeleccionadoId = null;
    let datosAccionTemp = {}; 
    const selForm = document.getElementById('t-cargo');
    listaCargosCache.forEach(c => selForm.innerHTML += `<option value="${c.nombre.toUpperCase()}">${c.nombre.toUpperCase()}</option>`);

    const obtenerTexto = (id) => { const el = document.getElementById(id); return (el && el.value.trim() !== "") ? el.value.toUpperCase() : null; };
    const getFecha = (id) => { const val = document.getElementById(id).value; return val === "" ? null : val; };
    const getNumber = (id) => { const val = document.getElementById(id).value; return val === "" ? null : val; };

    window.generarCamposHijos = (datosCargados = []) => {
        const num = parseInt(document.getElementById('t-num-hijos').value) || 0;
        const contenedor = document.getElementById('contenedor-hijos');
        if (datosCargados.length === 0) {
            contenedor.innerHTML = '';
            for (let i = 0; i < num; i++) contenedor.innerHTML += `<div class="hijo-card"><div style="font-size:0.8em; color:var(--primary); margin-bottom:5px;">HIJO ${i+1}</div><input class="hijo-nombre" placeholder="NOMBRE APELLIDO" style="width:100%; margin-bottom:5px;"><input type="date" class="hijo-fecha" style="width:100%;"></div>`;
        } else {
            contenedor.innerHTML = '';
            datosCargados.forEach((h, i) => contenedor.innerHTML += `<div class="hijo-card"><div style="font-size:0.8em; color:var(--primary); margin-bottom:5px;">HIJO ${i+1}</div><input class="hijo-nombre" placeholder="NOMBRE APELLIDO" value="${h.nombre}" style="width:100%; margin-bottom:5px;"><input type="date" class="hijo-fecha" value="${h.fecha}" style="width:100%;"></div>`);
        }
    };

    window.toggleMenuMas = () => { const m=document.getElementById('menu-mas'), c=document.getElementById('cont-opciones-mas'); document.getElementById('menu-descargas').classList.remove('show'); document.getElementById('cont-nombre').classList.remove('show-bg'); m.classList.toggle('show'); c.classList.toggle('show-bg', m.classList.contains('show')); };
    window.toggleMenuNombre = () => { const m=document.getElementById('menu-descargas'), c=document.getElementById('cont-nombre'); document.getElementById('menu-mas').classList.remove('show'); document.getElementById('cont-opciones-mas').classList.remove('show-bg'); m.classList.toggle('show'); c.classList.toggle('show-bg', m.classList.contains('show')); };
    window.verificarCivil = () => { const val = document.getElementById('t-civil').value; document.getElementById('div-conyuge').style.display = (val === 'CASADO' || val === 'UNION DE HECHO') ? 'block' : 'none'; };
    window.cambiarVista = (vista) => { ['vista-activos','vista-pasivos','vista-formulario'].forEach(id=>document.getElementById(id).style.display='none'); document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); if(vista==='activos'){ document.getElementById('vista-activos').style.display='block'; document.getElementById('tab-activos').classList.add('active'); } if(vista==='pasivos'){ document.getElementById('vista-pasivos').style.display='block'; document.getElementById('tab-pasivos').classList.add('active'); } };

    window.nuevaFicha = () => {
        toggleMenuMas(); document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value = ''; document.getElementById('t-estado').value = 'ACTIVO'; document.getElementById('t-cargo-original').value = '';
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150'; document.getElementById('preview-firma').style.display = 'none';
        document.getElementById('body-historial').innerHTML = '<tr><td colspan="4" style="text-align:center; padding:10px; color:#666;">GUARDE PARA INICIAR HISTORIAL.</td></tr>';
        document.querySelectorAll('input[name="serv"]').forEach(c => c.checked = false);
        document.getElementById('t-num-hijos').value = 0; document.getElementById('contenedor-hijos').innerHTML = '';
        document.getElementById('div-fecha-ingreso-inicial').style.display = 'block'; document.getElementById('t-ingreso-manual').required = true;
        document.getElementById('btn-dar-baja').style.display = 'none'; document.getElementById('btn-reactivar').style.display = 'none';
        document.getElementById('titulo-ficha').innerText = "NUEVO INGRESO"; document.getElementById('div-conyuge').style.display = 'none'; document.getElementById('cont-nombre').style.display = 'none'; 
        cambiarVista('xxx'); document.getElementById('vista-formulario').style.display = 'block';
    };

    window.descargarExcel = async (estado) => {
        toggleMenuMas(); if (typeof XLSX === 'undefined') return alert("ERROR: LIBRERÍA XLSX NO CARGADA.");
        const mensaje = estado === 'ACTIVO' ? 'DESCARGANDO ACTIVOS...' : 'DESCARGANDO PASIVOS...'; alert(mensaje); 
        const { data, error } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado);
        if(error) return alert("ERROR AL DESCARGAR: " + error.message);
        if(!data || data.length === 0) return alert("NO HAY TRABAJADORES " + estado + "S PARA DESCARGAR.");
        const columnasExcluidas = ['id', 'empresa_id', 'foto_url', 'firma_url', 'tipo_vivienda', 'vivienda', 'servicios_basicos', 'motivo_salida', 'religion', 'discapacidad', 'carnet_conadis', 'banco', 'cuenta', 'sueldo', 'licencia', 'material_paredes', 'material_cubierta', 'habitaciones', 'seguridad_sector', 'conyuge'];
        const dataFiltrada = data.map(trabajador => { const copia = { ...trabajador }; columnasExcluidas.forEach(col => delete copia[col]); return copia; });
        const ws = XLSX.utils.json_to_sheet(dataFiltrada); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "TRABAJADORES");
        const date = new Date().toISOString().split('T')[0]; XLSX.writeFile(wb, `NOMINA_${estado}_${empresa.nombre}_${date}.xlsx`);
    };

    async function abrir(t) {
        const map = {
            'cedula': t.cedula, 'nombre': t.nombre, 'lugar': t.lugar_nacimiento, 'nacionalidad': t.nacionalidad, 'sexo': t.sexo, 'civil': t.estado_civil, 'sangre': t.tipo_sangre, 'discapacidad': t.discapacidad, 'religion': t.religion, 'celular': t.celular, 'correo': t.correo, 'licencia': t.licencia, 'profesion': t.profesion, 'sueldo': t.sueldo, 'afiliacion': t.afiliacion, 'banco': t.banco, 'cuenta': t.cuenta, 'direccion': t.direccion, 'vivienda': t.vivienda, 'material': t.material_paredes, 'cubierta': t.material_cubierta, 'habitaciones': t.habitaciones, 'conyuge': t.conyuge, 'emer-nom': t.emergencia_nombre, 'emer-tel': t.emergencia_telefono, 'emer2-nom': t.emergencia2_nombre, 'emer2-tel': t.emergencia2_telefono, 'camisa': t.talla_camisa, 'pantalon': t.talla_pantalon, 'zapatos': t.talla_zapatos
        };
        for (const [id, val] of Object.entries(map)) { const el = document.getElementById('t-' + id); if (el) el.value = val || ''; }
        let hijosData = []; try { hijosData = JSON.parse(t.datos_hijos || '[]'); } catch { hijosData = []; }
        document.getElementById('t-num-hijos').value = hijosData.length; generarCamposHijos(hijosData);
        document.getElementById('t-nacimiento').value = t.fecha_nacimiento || ''; document.getElementById('t-ingreso-manual').value = t.fecha_ingreso || ''; document.getElementById('t-cargo').value = t.cargo || ''; document.getElementById('t-cargo-original').value = t.cargo || ''; document.getElementById('t-id').value = t.id; document.getElementById('t-estado').value = t.estado;
        const serv = (t.servicios_basicos || '').split(','); document.querySelectorAll('input[name="serv"]').forEach(c => c.checked = serv.includes(c.value));
        if(t.fecha_nacimiento) { const age = new Date().getFullYear() - new Date(t.fecha_nacimiento).getFullYear(); document.getElementById('t-edad').value = age; }
        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150'; document.getElementById('preview-firma').style.display = t.firma_url ? 'block' : 'none'; if(t.firma_url) document.getElementById('preview-firma').src = t.firma_url;
        verificarCivil(); document.getElementById('lbl-nombre-trab').innerText = t.nombre.split(' ')[0]; document.getElementById('cont-nombre').style.display = 'inline-flex'; document.getElementById('div-fecha-ingreso-inicial').style.display = 'none'; document.getElementById('t-ingreso-manual').required = false; 
        if(t.estado === 'ACTIVO') { document.getElementById('btn-dar-baja').style.display = 'block'; document.getElementById('btn-reactivar').style.display = 'none'; } else { document.getElementById('btn-dar-baja').style.display = 'none'; document.getElementById('btn-reactivar').style.display = 'block'; }
        document.getElementById('titulo-ficha').innerText = `EDITANDO: ${t.nombre}`; await cargarHistorial(t.id); cambiarVista('xxx'); document.getElementById('vista-formulario').style.display='block';
    }

    async function cargarHistorial(trabajadorId) {
        const tbody = document.getElementById('body-historial'); tbody.innerHTML = '<tr><td colspan="4">CARGANDO...</td></tr>';
        const { data } = await supabase.from('historial_laboral').select('*').eq('trabajador_id', trabajadorId).order('fecha_inicio', { ascending: false });
        tbody.innerHTML = ''; if(!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#666;">SIN HISTORIAL</td></tr>'; return; }
        data.forEach(h => { const tr = document.createElement('tr'); tr.style.borderBottom = '1px solid #333'; tr.innerHTML = `<td style="padding:8px; color:#fff;">${h.fecha_inicio||'-'}</td><td style="color:var(--primary);">${h.cargo}</td><td style="color:${h.fecha_fin?'#ff4444':'#00C851'}">${h.fecha_fin||'VIGENTE'}</td><td style="color:#aaa; font-style:italic;">${h.motivo||''}</td>`; tbody.appendChild(tr); });
    }

    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        let id = document.getElementById('t-id').value; const cargoNuevo = document.getElementById('t-cargo').value; const cargoViejo = document.getElementById('t-cargo-original').value;
        if (!id && !document.getElementById('t-ingreso-manual').value) return alert("INGRESE FECHA DE INGRESO");
        if (id && cargoViejo && cargoNuevo !== cargoViejo) { trabajadorSeleccionadoId = id; abrirModalAccion('CAMBIO_CARGO', { cargoNuevo: cargoNuevo, cargoViejo: cargoViejo }); return; }
        await procesarGuardadoFinal();
    };

    async function procesarGuardadoFinal(datosExtra = {}) {
        let id = document.getElementById('t-id').value;
        const fFoto = document.getElementById('t-foto').files[0]; let fotoUrl = null; if(fFoto) fotoUrl = await subirArchivo(supabase, fFoto, 'fichas_personal');
        const fFirma = document.getElementById('t-firma').files[0]; let firmaUrl = null; if(fFirma) firmaUrl = await subirArchivo(supabase, fFirma, 'fichas_personal');
        const serv = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c=>c.value).join(',');
        const hijosNombres = document.querySelectorAll('.hijo-nombre'); const hijosFechas = document.querySelectorAll('.hijo-fecha');
        let hijosArray = []; hijosNombres.forEach((input, index) => { if(input.value.trim() !== "") { hijosArray.push({ nombre: input.value.toUpperCase(), fecha: hijosFechas[index].value }); } });

        const datos = {
            empresa_id: empresa.id, cedula: obtenerTexto('t-cedula'), nombre: obtenerTexto('t-nombre'), fecha_nacimiento: getFecha('t-nacimiento'),
            cargo: obtenerTexto('t-cargo'), celular: obtenerTexto('t-celular'), correo: obtenerTexto('t-correo'), profesion: obtenerTexto('t-profesion'), sueldo: getNumber('t-sueldo'),
            direccion: obtenerTexto('t-direccion'), sexo: obtenerTexto('t-sexo'), estado_civil: obtenerTexto('t-civil'), conyuge: obtenerTexto('t-conyuge'), tipo_sangre: obtenerTexto('t-sangre'),
            lugar_nacimiento: obtenerTexto('t-lugar'), nacionalidad: obtenerTexto('t-nacionalidad'), religion: obtenerTexto('t-religion'), discapacidad: obtenerTexto('t-discapacidad'), licencia: obtenerTexto('t-licencia'),
            afiliacion: getFecha('t-afiliacion'), banco: obtenerTexto('t-banco'), cuenta: obtenerTexto('t-cuenta'), vivienda: obtenerTexto('t-vivienda'),
            material_paredes: obtenerTexto('t-material'), material_cubierta: obtenerTexto('t-cubierta'), habitaciones: getNumber('t-habitaciones'), servicios_basicos: serv,
            emergencia_nombre: obtenerTexto('t-emer-nom'), emergencia_telefono: obtenerTexto('t-emer-tel'), emergencia2_nombre: obtenerTexto('t-emer2-nom'), emergencia2_telefono: obtenerTexto('t-emer2-tel'),
            talla_camisa: obtenerTexto('t-camisa'), talla_pantalon: obtenerTexto('t-pantalon'), talla_zapatos: obtenerTexto('t-zapatos'), datos_hijos: JSON.stringify(hijosArray), fecha_ingreso: (!id) ? getFecha('t-ingreso-manual') : undefined
        };
        if(datos.fecha_ingreso === undefined) delete datos.fecha_ingreso; if(fotoUrl) datos.foto_url = fotoUrl; if(firmaUrl) datos.firma_url = firmaUrl;

        let data, error; if(id) { const res = await supabase.from('trabajadores').update(datos).eq('id',id).select(); data = res.data; error = res.error; } else { datos.estado = 'ACTIVO'; const res = await supabase.from('trabajadores').insert([datos]).select(); data = res.data; error = res.error; }
        if(error) return alert("ERROR SUPABASE: " + error.message);
        const trabajadorId = data[0].id; document.getElementById('t-id').value = trabajadorId;
        if (!id) { await supabase.from('historial_laboral').insert({ trabajador_id: trabajadorId, cargo: datos.cargo, fecha_inicio: datos.fecha_ingreso, motivo: 'INGRESO INICIAL' }); }
        if (datosExtra.tipo === 'CAMBIO_CARGO') { await supabase.from('historial_laboral').update({ fecha_fin: datosExtra.fechaSalida, motivo: datosExtra.motivoSalida ? datosExtra.motivoSalida.toUpperCase() : 'CAMBIO DE CARGO' }).eq('trabajador_id', trabajadorId).is('fecha_fin', null); await supabase.from('historial_laboral').insert({ trabajador_id: trabajadorId, cargo: datosExtra.cargoNuevo, fecha_inicio: datosExtra.fechaEntrada, motivo: 'CAMBIO DE CARGO' }); }
        alert("GUARDADO EXITOSAMENTE."); document.getElementById('modal-acciones').style.display = 'none'; if(!id) abrir(data[0]); else { await cargarHistorial(trabajadorId); document.getElementById('t-cargo-original').value = datos.cargo; } recargarListas(); 
    }

    window.abrirModalAccion = (tipo, extraData = null) => {
        const modal = document.getElementById('modal-acciones'), titulo = document.getElementById('modal-titulo'), desc = document.getElementById('modal-desc'), inputs = document.getElementById('modal-inputs'), nombre = document.getElementById('t-nombre').value, cargoActual = document.getElementById('t-cargo-original').value;
        trabajadorSeleccionadoId = document.getElementById('t-id').value; datosAccionTemp = { tipo: tipo, ...extraData }; inputs.innerHTML = ''; 
        if (tipo === 'BAJA') { titulo.innerText = "DAR DE BAJA"; desc.innerText = `FINALIZAR CONTRATO DE ${nombre}`; inputs.innerHTML = `<label>FECHA DE SALIDA:</label><input type="date" id="acc-fecha-salida" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;"><label>MOTIVO:</label><input type="text" id="acc-motivo" placeholder="EJ: RENUNCIA VOLUNTARIA" style="width:100%; padding:10px;">`; }
        else if (tipo === 'REACTIVAR') { titulo.innerText = "REACTIVAR"; desc.innerText = `REINGRESO DE ${nombre}`; let options = listaCargosCache.map(c => `<option value="${c.nombre.toUpperCase()}" ${c.nombre.toUpperCase()===cargoActual?'selected':''}>${c.nombre.toUpperCase()}</option>`).join(''); inputs.innerHTML = `<label>FECHA REINGRESO:</label><input type="date" id="acc-fecha-ingreso" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;"><label>CARGO:</label><select id="acc-cargo-nuevo" style="width:100%; padding:10px;">${options}</select>`; }
        else if (tipo === 'CAMBIO_CARGO') { const cViejo = datosAccionTemp.cargoViejo; const cNuevo = datosAccionTemp.cargoNuevo; titulo.innerText = "CAMBIO DE CARGO"; desc.innerText = `DE ${cViejo} A ${cNuevo}`; inputs.innerHTML = `<label>FECHA FIN (${cViejo}):</label><input type="date" id="acc-fecha-salida" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;"><label>FECHA INICIO (${cNuevo}):</label><input type="date" id="acc-fecha-ingreso" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; margin-bottom:10px;"><label>MOTIVO:</label><input type="text" id="acc-motivo" placeholder="EJ: ASCENSO" style="width:100%; padding:10px;">`; }
        modal.style.display = 'flex';
    };

    document.getElementById('btn-confirmar-accion').onclick = async () => {
        const tipo = datosAccionTemp.tipo; const id = trabajadorSeleccionadoId;
        if (tipo === 'BAJA') { const fecha = document.getElementById('acc-fecha-salida').value; const motivo = document.getElementById('acc-motivo').value; if(!fecha || !motivo) return alert("COMPLETE LOS CAMPOS"); const motivoMayus = motivo.toUpperCase(); await supabase.from('trabajadores').update({ estado: 'PASIVO', fecha_salida: fecha }).eq('id', id); await supabase.from('historial_laboral').update({ fecha_fin: fecha, motivo: motivoMayus }).eq('trabajador_id', id).is('fecha_fin', null); alert("BAJA REGISTRADA."); document.getElementById('modal-acciones').style.display = 'none'; recargarListas(); cambiarVista('pasivos'); }
        else if (tipo === 'REACTIVAR') { const fecha = document.getElementById('acc-fecha-ingreso').value; const cargo = document.getElementById('acc-cargo-nuevo').value; await supabase.from('trabajadores').update({ estado: 'ACTIVO', fecha_ingreso: fecha, fecha_salida: null, cargo: cargo }).eq('id', id); await supabase.from('historial_laboral').insert({ trabajador_id: id, cargo: cargo, fecha_inicio: fecha, motivo: 'REINGRESO' }); alert("REACTIVADO."); document.getElementById('modal-acciones').style.display = 'none'; recargarListas(); cambiarVista('activos'); }
        else if (tipo === 'CAMBIO_CARGO') { const fSalida = document.getElementById('acc-fecha-salida').value; const fEntrada = document.getElementById('acc-fecha-ingreso').value; const motivo = document.getElementById('acc-motivo').value; const motivoMayus = motivo ? motivo.toUpperCase() : 'CAMBIO DE CARGO'; await procesarGuardadoFinal({ tipo: 'CAMBIO_CARGO', fechaSalida: fSalida, fechaEntrada: fEntrada, cargoNuevo: datosAccionTemp.cargoNuevo, motivoSalida: motivoMayus }); }
    };

    const getBase64ImageFromURL = (url) => { return new Promise((resolve) => { const img = new Image(); img.crossOrigin = "Anonymous"; img.onload = () => { const canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height; const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png")); }; img.onerror = () => resolve(null); img.src = url; }); };

    window.imprimirDoc = async (tipo) => {
        toggleMenuNombre(); const id = document.getElementById('t-id').value; if (!id) return;
        if (tipo === 'ficha') await generarPDF_Ficha(id);
        else if (tipo === 'ats') window.open('./ATS.pdf', '_blank'); // <--- AHORA ABRE EL PDF DE GITHUB
        else alert(`GENERANDO ${tipo.toUpperCase()}... (EN DESARROLLO)`);
    };

    // --- PDF: FICHA SOCIOECONÓMICA (FORMATO PDF SUBIDO) ---
    async function generarPDF_Ficha(id) {
        alert("GENERANDO FICHA...");
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
        
        // Imagenes
        const logoUrl = empresa.logo_url;
        const fotoUrl = t.foto_url;
        // YA NO DESCARGAMOS LA FIRMA
        const [logoBase64, fotoBase64] = await Promise.all([
            logoUrl ? getBase64ImageFromURL(logoUrl) : null,
            fotoUrl ? getBase64ImageFromURL(fotoUrl) : null
        ]);

        // Hijos
        let hijos = [];
        try { hijos = JSON.parse(t.datos_hijos || '[]'); } catch { }
        
        const filasHijos = hijos.map(h => [h.nombre, 'HIJO/A', '', h.fecha, '', 'ESTUDIANTE']);
        if (filasHijos.length === 0) filasHijos.push([{ text: 'NO REGISTRA', colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {}]);

        const docDefinition = {
            pageSize: 'A4', pageMargins: [30, 30, 30, 30],
            content: [
                // CABECERA
                {
                    columns: [
                        { image: logoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', width: 70, height: 40, fit: [70, 40] },
                        { text: 'FICHA SOCIO-ECONOMICA', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
                        { text: '', width: 70 }
                    ]
                },
                { text: '\n' },

                // 1. DATOS PERSONALES
                { text: 'DATOS PERSONALES:', style: 'sectionHeader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['15%', '35%', '15%', '35%'],
                        body: [
                            [{ text: 'Nombres:', bold: true }, t.nombre, { text: 'Empresa:', bold: true }, empresa.nombre],
                            [{ text: 'Cédula:', bold: true }, t.cedula, { text: 'Tipo de Empresa:', bold: true }, 'MINA-PLANTA'],
                            [{ text: 'Sexo:', bold: true }, t.sexo, { text: 'Subarea:', bold: true }, 'OPERACIONES'],
                            [{ text: 'Nacionalidad:', bold: true }, t.nacionalidad, { text: 'Cargo:', bold: true }, t.cargo],
                            [{ text: 'Lugar Nac:', bold: true }, t.lugar_nacimiento, { text: 'Sucursal:', bold: true }, 'PRINCIPAL'],
                            [{ text: 'Fecha Nac:', bold: true }, t.fecha_nacimiento, { text: 'Tipo de Contrato:', bold: true }, 'INDEFINIDO'],
                            [{ text: 'Edad:', bold: true }, document.getElementById('t-edad').value, { text: 'Alergia:', bold: true }, 'NINGUNA'],
                            [{ text: 'Código:', bold: true }, t.id, { text: 'Banco:', bold: true }, t.banco || 'N/A'],
                            [{ text: 'Gen Sanguineo:', bold: true }, t.tipo_sangre, { text: 'Cuenta:', bold: true }, t.cuenta || 'N/A'],
                            [{ text: 'Religión:', bold: true }, t.religion, { text: 'Estado:', bold: true }, t.estado],
                            [{ text: 'Profesión:', bold: true }, t.profesion, { text: 'Medio Transporte:', bold: true }, 'VARIOS'],
                            [{ text: 'Sueldo:', bold: true }, '$ ' + t.sueldo, { text: 'Celular:', bold: true }, t.celular],
                            [{ text: 'Afiliado IESS:', bold: true }, t.afiliacion ? 'SI' : 'NO', { text: 'Teléfono:', bold: true }, 'N/A'],
                            [{ text: 'Fecha Afiliación:', bold: true }, t.afiliacion || '', { text: 'Correo:', bold: true }, t.correo],
                            [{ text: 'Estado Civil:', bold: true }, t.estado_civil, { text: 'Discapacidad:', bold: true }, t.discapacidad || 'NO'],
                            [{ text: 'Tiempo Conv:', bold: true }, 'N/A', { text: 'Carnet:', bold: true }, 'NO'],
                            [{ text: 'Cónyuge:', bold: true }, t.conyuge || 'N/A', { text: 'Hijos:', bold: true }, hijos.length > 0 ? 'SI' : 'NO'],
                            [{ text: 'Ciudad Res:', bold: true }, 'SANTA ROSA', { text: 'Número de Hijos:', bold: true }, hijos.length],
                            [{ text: 'Barrio:', bold: true }, 'CENTRO', { text: 'Licencia:', bold: true }, t.licencia],
                            [{ text: 'Dirección:', bold: true }, { text: t.direccion, colSpan: 3 }, {}, {}]
                        ]
                    }
                },
                { text: '\n' },

                // 2. NIVEL DE ESTUDIO
                {
                    style: 'tableExample',
                    table: {
                        widths: ['30%', '40%', '30%'],
                        headerRows: 1,
                        body: [
                            [{ text: 'Nivel de estudio', style: 'tableHeader' }, { text: 'Establecimiento educativo', style: 'tableHeader' }, { text: 'Observación', style: 'tableHeader' }],
                            ['SECUNDARIA / SUPERIOR', 'COLEGIO / UNIVERSIDAD', t.profesion || '']
                        ]
                    }
                },
                { text: '\n' },

                // 3. VIVIENDA Y SERVICIOS
                { text: 'VIVIENDA ACTUAL Y SERVICIOS BASICOS:', style: 'sectionHeader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['20%', '30%', '20%', '30%'],
                        body: [
                            [{ text: 'Tendencia:', bold: true }, t.vivienda, { text: 'Servicio Higiénico:', bold: true }, 'POZO SÉPTICO'],
                            [{ text: 'Tipo Vivienda:', bold: true }, t.material_paredes, { text: 'Recolección Basura:', bold: true }, 'SI'],
                            [{ text: 'Cubierta:', bold: true }, t.material_cubierta, { text: 'UPC cercano:', bold: true }, 'NO'],
                            [{ text: 'Nº Habitaciones:', bold: true }, t.habitaciones || '0', { text: 'Seguridad:', bold: true }, 'REGULAR'],
                            [{ text: 'Servicios:', bold: true }, t.servicios_basicos || 'NINGUNO', { text: 'Tipo Familia:', bold: true }, 'NUCLEAR'],
                            [{ text: 'Agua:', bold: true }, 'RED PÚBLICA', { text: 'Problema Familiar:', bold: true }, 'NINGUNO']
                        ]
                    }
                },
                { text: '\n' },

                // 4. TALLAS
                {
                    style: 'tableExample',
                    table: {
                        widths: ['25%', '25%', '25%', '25%'],
                        headerRows: 1,
                        body: [
                            [{ text: 'Talla Ropa', style: 'tableHeader', colSpan: 4 }, {}, {}, {}],
                            ['Camisa', t.talla_camisa || '', 'Pantalon', t.talla_pantalon || ''],
                            ['Zapatos', t.talla_zapatos || '', '', '']
                        ]
                    }
                },
                { text: '\n' },

                // 5. EMERGENCIA
                { text: 'EN CASO DE EMERGENCIA:', style: 'sectionHeader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['30%', '20%', '25%', '25%'],
                        headerRows: 1,
                        body: [
                            [{ text: 'Persona', style: 'tableHeader' }, { text: 'Parentesco', style: 'tableHeader' }, { text: 'Teléfono', style: 'tableHeader' }, { text: 'Celular', style: 'tableHeader' }],
                            [t.emergencia_nombre || '', 'FAMILIAR', '', t.emergencia_telefono || ''],
                            [t.emergencia2_nombre || '', 'FAMILIAR', '', t.emergencia2_telefono || '']
                        ]
                    }
                },
                { text: '\n' },

                // 6. CARGAS FAMILIARES
                { text: 'CARGAS FAMILIARES:', style: 'sectionHeader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['25%', '10%', '15%', '15%', '10%', '25%'],
                        headerRows: 1,
                        body: [
                            [{ text: 'Persona', style: 'tableHeader' }, { text: 'Sexo', style: 'tableHeader' }, { text: 'Parentesco', style: 'tableHeader' }, { text: 'F. Nacim', style: 'tableHeader' }, { text: 'Edad', style: 'tableHeader' }, { text: 'Ocupación', style: 'tableHeader' }],
                            ...filasHijos
                        ]
                    }
                },
                { text: '\n' },

                // 7. EGRESOS (ESTÁTICO PARA CUMPLIR FORMATO)
                { text: 'EGRESOS MENSUALES ESTIMADOS:', style: 'sectionHeader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['25%', '25%', '25%', '25%'],
                        headerRows: 1,
                        body: [
                            [{ text: 'Rubro', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }, { text: 'Rubro', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }],
                            ['Alimento', '$ 150', 'Salud', '$ 20'],
                            ['Luz', '$ 20', 'Vestido', '$ 30'],
                            ['Agua', '$ 10', 'Arriendo', '$ 0'],
                            ['Educación', '$ 50', 'Otros', '$ 50']
                        ]
                    }
                },
                { text: '\n' },

                // 8. COMUNICACIÓN FAMILIAR (ESTÁTICO)
                { text: 'COMUNICACIÓN FAMILIAR:', style: 'sectionHeader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['50%', '50%'],
                        body: [
                            [{ text: 'Nivel de comunicación:', bold: true }, 'BUENO'],
                            [{ text: 'Designa tareas a sus hijos:', bold: true }, 'SI'],
                            [{ text: 'Causas de conflicto:', bold: true }, 'NINGUNA'],
                            [{ text: 'Formas de recreación:', bold: true }, 'PASEOS']
                        ]
                    }
                },
                { text: '\n\n' },

                // FIRMA (SIN IMAGEN, SOLO LINEA)
                {
                    stack: [
                        { text: '\n\n\n\n' }, // Espacio para firmar
                        { text: '_______________________________', alignment: 'center' },
                        { text: 'FIRMA DEL SOLICITANTE', alignment: 'center', bold: true },
                        { text: t.nombre, alignment: 'center' },
                        { text: t.cedula, alignment: 'center' }
                    ]
                }
            ],
            styles: {
                header: { fontSize: 14, bold: true, decoration: 'underline' },
                sectionHeader: { fontSize: 10, bold: true, margin: [0, 5, 0, 2] },
                tableExample: { margin: [0, 2, 0, 5], fontSize: 8 },
                tableHeader: { bold: true, fontSize: 9, color: 'black', fillColor: '#cccccc', alignment: 'center' }
            },
            defaultStyle: { fontSize: 8 }
        };

        pdfMake.createPdf(docDefinition).open();
    }

    async function listar(estado, gridId, countId) {
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');
        if(document.getElementById(countId)) document.getElementById(countId).innerText = data ? data.length : 0;
        const grid = document.getElementById(gridId); grid.innerHTML = '';
        data?.forEach(t => {
            const div = document.createElement('div'); div.className = 'worker-card';
            div.innerHTML = `<div class="w-avatar"><img src="${t.foto_url||'https://via.placeholder.com/50'}" style="width:100%;height:100%;object-fit:cover;"></div><div><h4 style="margin:0">${t.nombre}</h4><small>${t.cargo}</small></div>`;
            div.onclick = () => abrir(t); 
            grid.appendChild(div);
        });
    }
    
    function recargarListas() { listar('ACTIVO', 'grid-activos', 'count-activos'); listar('PASIVO', 'grid-pasivos', 'count-pasivos'); }
    async function subirArchivo(sb, file, bucket) { const n = Date.now()+'_'+file.name.replace(/\W/g,''); const {error}=await sb.storage.from(bucket).upload(n,file); if(error)return null; return sb.storage.from(bucket).getPublicUrl(n).data.publicUrl; }
    recargarListas();
    const setupPreview = (inputId, imgId) => { document.getElementById(inputId).onchange = (e) => { if(e.target.files[0]){ const r = new FileReader(); r.onload = (ev) => { document.getElementById(imgId).src = ev.target.result; document.getElementById(imgId).style.display='block'; }; r.readAsDataURL(e.target.files[0]); } } }
    setupPreview('t-foto', 'preview-foto'); setupPreview('t-firma', 'preview-firma');
}
