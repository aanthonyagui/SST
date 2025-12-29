// trabajadores.js - VERSIÓN FINAL: FICHA GENERADA + ATS ESTÁTICO + PROTECCIÓN IMÁGENES

let listaCargosCache = []; 

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // 1. Cargar cargos
    const { data: cargosBD } = await supabase.from('cargos').select('*');
    listaCargosCache = cargosBD || [];

    contenedor.innerHTML = `
        <style>
            #vista-formulario input[type="text"], 
            #vista-formulario textarea, 
            #vista-formulario select { text-transform: uppercase; }
            .hijo-card { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid var(--primary); }
            .sub-title { color: #aaa; font-size: 0.85em; margin-top: 10px; margin-bottom: 5px; width: 100%; border-bottom: 1px solid #444; }
        </style>

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
                
                <div class="dropdown" id="cont-opciones-mas">
                    <button class="tab-btn" onclick="toggleMenuMas()" style="background:rgba(255,255,255,0.1);">
                        <i class="fas fa-plus"></i> <span class="desktop-text">Opciones</span> <i class="fas fa-caret-down"></i>
                    </button>
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
                    <button class="tab-btn btn-nombre" onclick="toggleMenuNombre()">
                        <i class="fas fa-user"></i> <span id="lbl-nombre-trab">TRABAJADOR</span> <i class="fas fa-caret-down"></i>
                    </button>
                    <div id="menu-descargas" class="dropdown-content">
                        <div style="padding:10px; color:#aaa; font-size:0.8em;">DOCUMENTOS</div>
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf" style="color:var(--danger)"></i> Ficha PDF</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-file-pdf" style="color:var(--warning)"></i> ATS</a>
                        <a onclick="imprimirDoc('carnet')"><i class="fas fa-id-card" style="color:#f39c12"></i> Carnet</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list" style="color:var(--success)"></i> Kardex</a>
                        <a onclick="imprimirDoc('induccion')"><i class="fas fa-chalkboard-teacher"></i> Inducción</a>
                        <hr style="border-color:#333; margin:5px 0;">
                        <a onclick="toggleMenuNombre()" style="color:#666;"><i class="fas fa-times"></i> Cerrar</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">

        <div id="vista-activos">
            <input type="text" id="bus-act" placeholder="BUSCAR TRABAJADOR ACTIVO..." style="width:100%; border-radius:30px; margin-bottom:15px; text-transform:uppercase;">
            <div id="grid-activos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-pasivos" style="display:none;">
            <input type="text" id="bus-pas" placeholder="BUSCAR TRABAJADOR RETIRADO..." style="width:100%; border-radius:30px; border-color:var(--danger); margin-bottom:15px; text-transform:uppercase;">
            <div id="grid-pasivos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-formulario" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; color:#00d2ff;" id="titulo-ficha">FICHA PERSONAL</h3>
                <button onclick="cambiarVista('activos')" style="background:#555; width:auto; padding:8px 15px;"><i class="fas fa-arrow-left"></i> VOLVER</button>
            </div>

            <form id="form-trabajador">
                <input type="hidden" id="t-id">
                <input type="hidden" id="t-estado" value="ACTIVO">
                <input type="hidden" id="t-cargo-original"> 
                
                <div style="background:rgba(255,255,255,0.05); border:1px solid #444; border-radius:15px; padding:15px; display:flex; gap:15px; align-items:center; margin-bottom:20px;">
                    <div style="text-align:center;">
                        <img id="preview-foto" src="" style="width:100px; height:120px; object-fit:cover; border-radius:10px; background:#000;">
                        <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:5px; width:100%;">FOTO</button>
                        <input type="file" id="t-foto" hidden accept="image/*">
                    </div>
                    <div style="flex:1;">
                        <input id="t-cedula" placeholder="CÉDULA" style="margin-bottom:5px;" required>
                        <input id="t-nombre" placeholder="NOMBRE COMPLETO" style="margin-bottom:5px;" required>
                        <div style="display:flex; gap:5px;">
                            <input type="date" id="t-nacimiento" title="FECHA NACIMIENTO" required>
                            <input id="t-edad" placeholder="EDAD" readonly style="width:60px; text-align:center; background:#222;">
                        </div>
                        
                        <div style="margin-top:10px;">
                            <label style="font-size:0.8em; color:var(--primary);">CARGO:</label>
                            <select id="t-cargo" style="margin-top:2px;" required><option value="">SELECCIONE...</option></select>
                            
                            <div id="div-fecha-ingreso-inicial" style="display:none; margin-top:5px;">
                                <label style="font-size:0.8em; color:var(--success);">INGRESO (NUEVO):</label>
                                <input type="date" id="t-ingreso-manual" style="border:1px solid var(--success);">
                            </div>
                        </div>
                    </div>
                </div>

                <details open class="seccion-form">
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">1. DATOS PERSONALES</summary>
                    <div class="form-grid">
                        <select id="t-sexo"><option>HOMBRE</option><option>MUJER</option></select>
                        <select id="t-civil" onchange="verificarCivil()">
                            <option value="SOLTERO">SOLTERO</option>
                            <option value="CASADO">CASADO</option>
                            <option value="UNION DE HECHO">UNIÓN DE HECHO</option>
                            <option value="DIVORCIADO">DIVORCIADO</option>
                            <option value="VIUDO">VIUDO</option>
                        </select>
                        
                        <div id="div-conyuge" style="display:none; grid-column:1/-1; background:rgba(255,255,255,0.1); padding:10px; border-radius:8px;">
                            <label style="font-size:0.8em; color:#00d2ff;">NOMBRE CÓNYUGE:</label>
                            <input id="t-conyuge" placeholder="NOMBRE ESPOSO/A">
                        </div>

                        <select id="t-sangre">
                            <option value="">TIPO SANGRE</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                        </select>

                        <input id="t-nacionalidad" value="ECUATORIANA"><input id="t-lugar" placeholder="LUGAR NACIMIENTO">
                        <input id="t-discapacidad" placeholder="DISCAPACIDAD (NO / %)">
                        <input id="t-celular" placeholder="CELULAR"><input id="t-correo" placeholder="CORREO">
                        
                        <input id="t-alergia" placeholder="ALERGIAS (NINGUNA)"><input id="t-transporte" placeholder="MEDIO TRANSPORTE (BUS/AUTO)">
                        <input id="t-ciudad" placeholder="CIUDAD RESIDENCIA"><input id="t-barrio" placeholder="BARRIO">
                        <input id="t-carnet" placeholder="Nº CARNET CONADIS (NO)">
                        
                        <select id="t-religion"><option value="CATOLICA">CATÓLICA</option><option value="CRISTIANO">CRISTIANO</option><option value="EVANGELICA">EVANGÉLICA</option><option value="TESTIGO DE JEHOVA">TESTIGO DE JEHOVÁ</option><option value="ATEISMO">ATEÍSMO</option><option value="NINGUNA">NINGUNA</option><option value="OTRA">OTRA</option></select>
                        <select id="t-licencia"><option value="NINGUNA">LICENCIA: NINGUNA</option><option value="A">A</option><option value="A1">A1</option><option value="B">B</option><option value="C">C</option><option value="C1">C1</option><option value="D">D</option><option value="D1">D1</option><option value="E">E</option><option value="E1">E1</option><option value="F">F</option><option value="G">G</option></select>
                    </div>
                    
                    <div style="margin-top:15px; border-top:1px solid #444; padding-top:10px;">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><label>Nº HIJOS:</label><input id="t-num-hijos" type="number" min="0" value="0" style="width:60px; text-align:center;" oninput="generarCamposHijos()"></div>
                        <div id="contenedor-hijos"></div>
                    </div>
                </details>

                <details class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">2. ESTUDIOS Y LABORAL</summary>
                    <div class="form-grid">
                        <input id="t-profesion" placeholder="PROFESIÓN / TÍTULO">
                        <select id="t-nivel-estudio"><option value="">NIVEL ESTUDIO...</option><option value="PRIMARIA">PRIMARIA</option><option value="SECUNDARIA">SECUNDARIA</option><option value="SUPERIOR">SUPERIOR</option></select>
                        <input id="t-establecimiento" placeholder="ESTABLECIMIENTO EDUCATIVO">
                        <input id="t-sueldo" type="number" step="0.01" placeholder="SUELDO $">
                        <div><label style="font-size:0.7em;">AFILIACIÓN IESS:</label><input type="date" id="t-afiliacion"></div>
                        <input id="t-banco" placeholder="BANCO"><input id="t-cuenta" placeholder="Nº CUENTA">
                    </div>
                </details>

                <details class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">3. VIVIENDA Y SERVICIOS</summary>
                    <div class="form-grid">
                        <input id="t-direccion" placeholder="DIRECCIÓN EXACTA" style="grid-column:1/-1">
                        <select id="t-vivienda"><option value="PROPIA">VIVIENDA: PROPIA</option><option value="ARRENDADA">VIVIENDA: ARRENDADA</option><option value="FAMILIAR">VIVIENDA: FAMILIAR</option><option value="PRESTADA">VIVIENDA: PRESTADA</option></select>
                        <select id="t-material"><option value="">PAREDES...</option><option value="CEMENTO">CEMENTO</option><option value="MIXTA">MIXTA</option><option value="CAÑA">CAÑA</option><option value="ADOBE">ADOBE</option><option value="MADERA">MADERA</option></select>
                        <select id="t-cubierta"><option value="">TECHO...</option><option value="ZINC">ZINC</option><option value="LOSA">LOSA</option><option value="TEJA">TEJA</option><option value="ETERNIT">ETERNIT</option></select>
                        <input id="t-habitaciones" type="number" placeholder="Nº HABITACIONES">
                        
                        <select id="t-servicio-higienico"><option value="RED PUBLICA">HIGIÉNICO: RED PÚBLICA</option><option value="POZO SEPTICO">HIGIÉNICO: POZO SÉPTICO</option></select>
                        <select id="t-basura"><option value="SI">RECOLECCIÓN BASURA: SI</option><option value="NO">RECOLECCIÓN BASURA: NO</option></select>
                        <select id="t-upc"><option value="SI">UPC CERCANO: SI</option><option value="NO">UPC CERCANO: NO</option></select>
                        <select id="t-seguridad-sector"><option value="BUENA">SEGURIDAD SECTOR: BUENA</option><option value="REGULAR">SEGURIDAD SECTOR: REGULAR</option><option value="MALA">SEGURIDAD SECTOR: MALA</option></select>
                        <select id="t-tipo-familia"><option value="NUCLEAR">FAMILIA NUCLEAR</option><option value="EXTENSA">FAMILIA EXTENSA</option><option value="MONOPARENTAL">MONOPARENTAL</option></select>
                        <input id="t-problema-familiar" placeholder="PROBLEMA FAMILIAR (NINGUNO)">
                    </div>
                    <div class="multi-select-box" style="margin-top:10px;"><label>SERVICIOS BÁSICOS:</label><br><label><input type="checkbox" name="serv" value="LUZ"> LUZ</label><label><input type="checkbox" name="serv" value="AGUA"> AGUA</label><label><input type="checkbox" name="serv" value="INTERNET"> INTERNET</label></div>
                </details>

                <details class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">4. GASTOS Y COMUNICACIÓN</summary>
                    <div class="sub-title">EGRESOS MENSUALES ($)</div>
                    <div class="form-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
                        <input id="g-alimento" type="number" placeholder="Alimento">
                        <input id="g-luz" type="number" placeholder="Luz">
                        <input id="g-agua" type="number" placeholder="Agua">
                        <input id="g-educacion" type="number" placeholder="Educación">
                        <input id="g-salud" type="number" placeholder="Salud">
                        <input id="g-vestido" type="number" placeholder="Vestido">
                        <input id="g-arriendo" type="number" placeholder="Arriendo">
                        <input id="g-otros" type="number" placeholder="Otros">
                    </div>
                    <div class="sub-title">COMUNICACIÓN FAMILIAR</div>
                    <div class="form-grid">
                        <select id="c-nivel"><option value="BUENO">COMUNICACIÓN: BUENA</option><option value="REGULAR">COMUNICACIÓN: REGULAR</option><option value="MALA">COMUNICACIÓN: MALA</option></select>
                        <select id="c-tareas"><option value="SI">DESIGNA TAREAS: SI</option><option value="NO">DESIGNA TAREAS: NO</option></select>
                        <input id="c-conflicto" placeholder="CAUSA CONFLICTO (NINGUNA)">
                        <input id="c-recreacion" placeholder="RECREACIÓN (PASEOS)">
                    </div>
                </details>

                <details class="seccion-form"><summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">TALLAS Y EMERGENCIA</summary>
                    <div class="form-grid">
                        <select id="t-camisa"><option value="">CAMISA...</option><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option><option value="XXXL">XXXL</option></select>
                        <select id="t-pantalon"><option value="">PANTALÓN...</option><option value="28">28</option><option value="30">30</option><option value="32">32</option><option value="34">34</option><option value="36">36</option><option value="38">38</option><option value="40">40</option><option value="42">42</option><option value="44">44</option><option value="46">46</option></select>
                        <select id="t-zapatos"><option value="">ZAPATOS...</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option></select>
                    </div>
                    <div class="form-grid" style="margin-top:10px;">
                        <input id="t-emer-nom" placeholder="EMERGENCIA 1: NOMBRE">
                        <input id="t-emer-tel" placeholder="EMERGENCIA 1: TELÉFONO">
                        <input id="t-emer2-nom" placeholder="EMERGENCIA 2: NOMBRE">
                        <input id="t-emer2-tel" placeholder="EMERGENCIA 2: TELÉFONO">
                    </div>
                </details>

                <div class="seccion-form" style="text-align:center;">
                    <img id="preview-firma" src="" style="height:60px; display:none; margin:0 auto; background:white; padding:5px;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin-top:5px;">SUBIR FIRMA</button>
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
                                    <th style="padding:5px;">INICIO</th>
                                    <th>CARGO</th>
                                    <th>FIN</th>
                                    <th>MOTIVO</th>
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
                <h3 id="modal-titulo" style="color:var(--primary)">ACCIÓN</h3>
                <p id="modal-desc" style="font-size:0.9em; color:#ccc;"></p>
                <div id="modal-inputs"></div>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="document.getElementById('modal-acciones').style.display='none'" style="background:#444;">CANCELAR</button>
                    <button id="btn-confirmar-accion" style="background:var(--primary); color:black; font-weight:bold;">CONFIRMAR</button>
                </div>
            </div>
        </div>
    `;

    // ================== LÓGICA DE NEGOCIO ==================
    let trabajadorSeleccionadoId = null;
    let datosAccionTemp = {}; 

    // Llenar select de cargos
    const selForm = document.getElementById('t-cargo');
    listaCargosCache.forEach(c => selForm.innerHTML += `<option value="${c.nombre.toUpperCase()}">${c.nombre.toUpperCase()}</option>`);

    // Helper functions
    const obtenerTexto = (id) => { const el = document.getElementById(id); return (el && el.value.trim() !== "") ? el.value.toUpperCase() : null; };
    const getFecha = (id) => { const val = document.getElementById(id).value; return val === "" ? null : val; };
    const getNumber = (id) => { const val = document.getElementById(id).value; return val === "" ? null : val; };

    window.toggleMenuMas = () => { const m=document.getElementById('menu-mas'), c=document.getElementById('cont-opciones-mas'); document.getElementById('menu-descargas').classList.remove('show'); document.getElementById('cont-nombre').classList.remove('show-bg'); m.classList.toggle('show'); c.classList.toggle('show-bg', m.classList.contains('show')); };
    window.toggleMenuNombre = () => { const m=document.getElementById('menu-descargas'), c=document.getElementById('cont-nombre'); document.getElementById('menu-mas').classList.remove('show'); document.getElementById('cont-opciones-mas').classList.remove('show-bg'); m.classList.toggle('show'); c.classList.toggle('show-bg', m.classList.contains('show')); };
    window.verificarCivil = () => { const val = document.getElementById('t-civil').value; document.getElementById('div-conyuge').style.display = (val === 'CASADO' || val === 'UNION DE HECHO') ? 'block' : 'none'; };
    window.cambiarVista = (vista) => { ['vista-activos','vista-pasivos','vista-formulario'].forEach(id=>document.getElementById(id).style.display='none'); document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); if(vista==='activos'){ document.getElementById('vista-activos').style.display='block'; document.getElementById('tab-activos').classList.add('active'); } if(vista==='pasivos'){ document.getElementById('vista-pasivos').style.display='block'; document.getElementById('tab-pasivos').classList.add('active'); } };

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
        toggleMenuMas(); if (typeof XLSX === 'undefined') return alert("ERROR: LIBRERÍA XLSX NO
