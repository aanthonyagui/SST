// trabajadores.js - Módulo de Gestión de Personal y PDF (Supabase)

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // 1. ESTRUCTURA HTML
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            
            <div id="tab-container" style="display:flex; gap:5px; margin-top:10px; align-items:center;">
                <button class="tab-btn active" id="tab-activos" onclick="cambiarVista('activos')">
                    <i class="fas fa-user-check"></i> 
                    <span class="desktop-text">Activos</span> 
                    <span id="count-activos" class="badge" style="background:var(--success); color:black; margin-left:5px;">0</span>
                </button>
                
                <button class="tab-btn" id="tab-pasivos" onclick="cambiarVista('pasivos')">
                    <i class="fas fa-user-times"></i> 
                    <span class="desktop-text">Retirados</span> 
                    <span id="count-pasivos" class="badge" style="background:var(--danger); margin-left:5px;">0</span>
                </button>
                
                <button class="tab-btn" id="btn-nueva-ficha" onclick="nuevaFicha()">
                    <i class="fas fa-plus"></i> <span class="desktop-text">Nuevo</span>
                </button>

                <div class="dropdown" id="tab-trabajador-activo" style="display:none;">
                    <button class="tab-btn active" onclick="toggleDropdown()" id="btn-nombre-trabajador" style="border-color:#f1c40f; color:#f1c40f;">
                        <i class="fas fa-user-cog"></i> 
                        <span id="lbl-nombre-trab">NOMBRE</span> 
                        <i class="fas fa-caret-down"></i>
                    </button>
                    <div id="dropdown-print" class="dropdown-content">
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf"></i> Descargar Ficha</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-hard-hat"></i> Generar ATS</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list"></i> Kardex EPP</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin:15px 0;">

        <div id="vista-activos" class="vista-seccion">
            <input type="text" id="buscador-activos" placeholder="Buscar trabajador activo..." style="width:100%; padding:10px; margin-bottom:10px;">
            <div id="grid-activos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-pasivos" class="vista-seccion" style="display:none;">
            <input type="text" id="buscador-pasivos" placeholder="Buscar trabajador retirado..." style="width:100%; padding:10px; margin-bottom:10px; border-color:var(--danger);">
            <div id="grid-pasivos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-formulario" class="vista-seccion" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="color:#00d2ff; margin:0;" id="titulo-formulario">Ficha</h3>
                <div style="display:flex; gap:5px;">
                    <button id="btn-dar-baja" class="btn-small" style="background:#555; display:none;"><i class="fas fa-archive"></i> <span class="desktop-text">Dar Baja</span></button>
                    <button id="btn-reactivar" class="btn-small" style="background:#2ecc71; display:none;"><i class="fas fa-undo"></i> <span class="desktop-text">Reactivar</span></button>
                </div>
            </div>

            <form id="form-trabajador" class="form-scroll">
                <input type="hidden" id="t-id">
                <input type="hidden" id="t-estado" value="ACTIVO">

                <div class="seccion-form">
                    <div style="display:flex; flex-wrap:wrap; gap:20px;">
                        <div style="text-align:center; flex:0 0 120px; margin:0 auto;">
                            <img id="preview-foto" src="https://via.placeholder.com/150?text=FOTO" class="foto-perfil">
                            <input type="file" id="t-foto" accept="image/*" style="display:none;">
                            <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small">Cambiar Foto</button>
                        </div>
                        <div class="form-grid" style="flex:1;">
                            <input type="text" id="t-cedula" placeholder="Cédula" maxlength="10" required>
                            <input type="text" id="t-nombre" placeholder="Apellidos y Nombres" required>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                                <input type="date" id="t-nacimiento" required>
                                <input type="text" id="t-edad" placeholder="Edad" readonly style="background:#333;">
                            </div>
                            <select id="t-cargo" required><option>Cargando cargos...</option></select>
                        </div>
                    </div>
                </div>

                <details open class="seccion-form">
                    <summary>Datos Personales</summary>
                    <div class="form-grid" style="margin-top:10px;">
                         <select id="t-sexo"><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option></select>
                         <select id="t-civil"><option value="Soltero">Soltero</option><option value="Casado">Casado</option><option value="Union Libre">Unión Libre</option><option value="Divorciado">Divorciado</option><option value="Viudo">Viudo</option></select>
                         <select id="t-sangre"><option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="B+">B+</option></select>
                         <input type="text" id="t-nacionalidad" value="ECUATORIANA" placeholder="Nacionalidad">
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
                            <label><input type="checkbox" name="serv" value="TV Cable"> TV Cable</label>
                        </div>
                    </div>
                </details>

                <details class="seccion-form">
                    <summary>Tallas y Emergencia</summary>
                    <div class="form-grid" style="margin-top:10px; grid-template-columns:1fr 1fr 1fr;">
                        <input type="text" id="t-camisa" placeholder="Camisa">
                        <input type="text" id="t-pantalon" placeholder="Pantalón">
                        <input type="text" id="t-zapatos" placeholder="Zapatos">
                    </div>
                    <hr style="border-color:#444;">
                    <div class="form-grid">
                        <input type="text" id="t-emer-nom" placeholder="Nombre Contacto 1">
                        <input type="text" id="t-emer-par" placeholder="Parentesco">
                        <input type="text" id="t-emer-tel" placeholder="Teléfono">
                    </div>
                    <div class="form-grid">
                        <input type="text" id="t-emer2-nom" placeholder="Nombre Contacto 2">
                        <input type="text" id="t-emer2-par" placeholder="Parentesco">
                        <input type="text" id="t-emer2-tel" placeholder="Teléfono">
                    </div>
                </details>

                <div class="seccion-form" style="text-align:center; border:1px dashed #555;">
                    <h4 style="margin-bottom:10px;">Firma del Trabajador</h4>
                    <img id="preview-firma" src="" style="display:none; height:80px; margin:0 auto 10px auto; background:white; padding:5px; border-radius:5px;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin:0 auto;">
                        <i class="fas fa-signature"></i> Cargar Firma
                    </button>
                    <input type="file" id="t-firma" accept="image/*" style="display:none;">
                    <p style="font-size:0.7em; color:#888; margin-top:5px;">Subir foto de la firma (fondo blanco)</p>
                </div>

                <div style="margin-top:20px; padding-bottom:60px; display:flex; gap:10px;">
                    <button type="submit" id="btn-guardar" style="background:#00d2ff; color:black;">Guardar Cambios</button>
                    <button type="button" onclick="cambiarVista('activos')" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA DE JAVASCRIPT ---

    // 1. CARGA INICIAL
    cargarCargos(supabase);
    listarTrabajadores('ACTIVO');
    listarTrabajadores('PASIVO');

    // 2. GESTIÓN DEL MENÚ DESPLEGABLE
    window.toggleDropdown = () => document.getElementById("dropdown-print").classList.toggle("show");
    window.onclick = (e) => {
        if (!e.target.matches('#btn-nombre-trabajador') && !e.target.matches('#btn-nombre-trabajador *')) {
            const drops = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < drops.length; i++) if (drops[i].classList.contains('show')) drops[i].classList.remove('show');
        }
    };

    // 3. IMPRIMIR PDF (CONEXIÓN SUPABASE)
    window.imprimirDoc = async (tipo) => {
        const id = document.getElementById('t-id').value;
        if (!id) return alert("Selecciona un trabajador.");

        const btn = document.getElementById('btn-nombre-trabajador');
        const txt = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generando...`;

        try {
            // Consulta directa a Supabase para tener los datos más recientes
            const { data: t, error } = await supabase.from('trabajadores').select('*').eq('id', id).single();
            if (error) throw error;

            if (tipo === 'ficha') {
                await generarFichaPDF(t, empresa);
            } else {
                alert(`Módulo ${tipo} en construcción.`);
            }
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            btn.innerHTML = txt;
        }
    };

    // 4. GENERADOR PDFMAKE (ESTRUCTURA GOLDMINS)
    async function generarFichaPDF(t, empresa) {
        // Cargar imágenes de forma segura (sin que bloqueen si fallan)
        const logo = await safeImageLoad(empresa.logo_url);
        const foto = await safeImageLoad(t.foto_url);
        const firma = await safeImageLoad(t.firma_url);

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 40, 40, 40],
            content: [
                // Cabecera
                {
                    columns: [
                        { image: logo || 'pixel', width: 60, fit: [60, 60] },
                        {
                            text: [
                                { text: (empresa.nombre || 'EMPRESA').toUpperCase() + '\n', fontSize: 14, bold: true, color: '#1f4e79' },
                                { text: 'GESTIÓN DE TALENTO HUMANO\n', fontSize: 10, bold: true },
                                { text: 'FICHA SOCIOECONÓMICA', fontSize: 16, bold: true, color: '#c00000', margin: [0, 5, 0, 0] }
                            ],
                            alignment: 'center', margin: [0, 5, 0, 0]
                        },
                        { text: '', width: 60 }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: '#1f4e79' }] },
                { text: '\n' },

                // Sección 1: Datos Personales
                {
                    style: 'tableExample',
                    table: {
                        widths: [100, '*', 100, '*'],
                        body: [
                            [{ text: 'DATOS PERSONALES', style: 'headerRow', colSpan: 4 }, {}, {}, {}],
                            [
                                { rowSpan: 4, image: foto || 'pixel', fit: [90, 110], alignment: 'center' },
                                { text: 'Cédula:', bold: true }, { text: t.cedula || '' }, {}
                            ],
                            [{}, { text: 'Nombres:', bold: true }, { text: t.nombre || '', colSpan: 2 }, {}],
                            [{}, { text: 'Cargo:', bold: true }, { text: t.cargo || '', colSpan: 2 }, {}],
                            [{}, { text: 'Edad:', bold: true }, { text: (t.edad ? t.edad + ' años' : ''), colSpan: 2 }, {}],
                            
                            [{ text: 'F. Nacimiento:', bold: true }, t.fecha_nacimiento || '', { text: 'Tipo Sangre:', bold: true }, t.tipo_sangre || ''],
                            [{ text: 'Estado Civil:', bold: true }, t.estado_civil || '', { text: 'Nacionalidad:', bold: true }, t.nacionalidad || ''],
                            [{ text: 'Celular:', bold: true }, t.celular || '', { text: 'Correo:', bold: true }, { text: t.correo || '', fontSize: 8 }],
                            [{ text: 'Dirección:', bold: true }, { text: t.direccion || '', colSpan: 3 }, {}, {}]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: '\n' },

                // Sección 2: Vivienda y Tallas
                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*', '*', '*'],
                        body: [
                            [{ text: 'VIVIENDA Y DOTACIÓN', style: 'headerRow', colSpan: 4 }, {}, {}, {}],
                            [{ text: 'Vivienda:', bold: true }, t.tipo_vivienda || '', { text: 'Servicios:', bold: true }, { text: t.servicios_basicos || '-', fontSize: 8 }],
                            [{ text: 'Talla Camisa:', bold: true }, t.talla_camisa || '', { text: 'Talla Pantalón:', bold: true }, t.talla_pantalon || ''],
                            [{ text: 'Talla Zapatos:', bold: true }, t.talla_zapatos || '', {}, {}]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: '\n' },

                // Sección 3: Emergencia
                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [{ text: 'CONTACTOS DE EMERGENCIA', style: 'headerRow', colSpan: 3 }, {}, {}],
                            [{ text: 'Nombre', bold: true, fillColor: '#eee' }, { text: 'Parentesco', bold: true, fillColor: '#eee' }, { text: 'Teléfono', bold: true, fillColor: '#eee' }],
                            [t.emergencia_nombre || '-', t.emergencia_parentesco || '-', t.emergencia_telefono || '-'],
                            [t.emergencia2_nombre || '-', t.emergencia2_parentesco || '-', t.emergencia2_telefono || '-']
                        ]
                    }
                },
                { text: '\n\n\n' },

                // Firmas
                {
                    columns: [
                        {
                            stack: [
                                firma ? { image: firma, fit: [100, 60], alignment: 'center' } : { text: '\n\n' },
                                { canvas: [{ type: 'line', x1: 20, y1: 0, x2: 180, y2: 0, lineWidth: 1 }] },
                                { text: 'FIRMA DEL TRABAJADOR', alignment: 'center', fontSize: 9, bold: true },
                                { text: t.cedula, alignment: 'center', fontSize: 8 }
                            ]
                        },
                        {
                            stack: [
                                { text: '\n\n\n' }, /* Espacio para firma manual */
                                { canvas: [{ type: 'line', x1: 20, y1: 0, x2: 180, y2: 0, lineWidth: 1 }] },
                                {
