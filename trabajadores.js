// trabajadores.js - Versión Final Completa (Con PDF y Logo)

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
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf"></i> Ficha Socioeconómica</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-hard-hat"></i> Generar ATS</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list"></i> Kardex EPP</a>
                        <a onclick="imprimirDoc('induccion')"><i class="fas fa-chalkboard-teacher"></i> Inducción</a>
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
                    <summary>Datos Personales y Contacto</summary>
                    <div class="form-grid" style="margin-top:10px;">
                         <select id="t-sexo"><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option></select>
                         <select id="t-civil"><option value="Soltero">Soltero</option><option value="Casado">Casado</option><option value="Union Libre">Unión Libre</option><option value="Divorciado">Divorciado</option><option value="Viudo">Viudo</option></select>
                         <select id="t-sangre"><option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="B+">B+</option><option value="AB+">AB+</option></select>
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
                            <label><input type="checkbox" name="serv" value="TV Cable"> TV Cable</label>
                            <label><input type="checkbox" name="serv" value="Alcantarillado"> Alcantarillado</label>
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
                    <img id="preview-firma" src="" style="display:none; height:80px; margin:0 auto 10px auto; filter: invert(1);">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin:0 auto;">
                        <i class="fas fa-signature"></i> Cargar Firma
                    </button>
                    <input type="file" id="t-firma" accept="image/*" style="display:none;">
                    <p style="font-size:0.7em; color:#888; margin-top:5px;">Sube una foto clara de la firma en fondo blanco.</p>
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
    window.toggleDropdown = () => {
        document.getElementById("dropdown-print").classList.toggle("show");
    };
    
    // Cerrar menú si se hace clic fuera
    window.onclick = function(event) {
        if (!event.target.matches('#btn-nombre-trabajador') && !event.target.matches('#btn-nombre-trabajador *')) {
            const dropdowns = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < dropdowns.length; i++) {
                if (dropdowns[i].classList.contains('show')) dropdowns[i].classList.remove('show');
            }
        }
    }

    // 3. FUNCIÓN MAESTRA DE IMPRESIÓN (Aquí está lo que pediste)
    window.imprimirDoc = async (tipo) => {
        const id = document.getElementById('t-id').value;
        if (!id) return alert("Primero selecciona un trabajador.");

        const btnNombre = document.getElementById('btn-nombre-trabajador');
        const textoOriginal = btnNombre.innerHTML;
        btnNombre.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Procesando...`;

        try {
            // Obtener datos frescos de la BD
            const { data: t, error } = await supabase.from('trabajadores').select('*').eq('id', id).single();
            if (error) throw error;

            if (tipo === 'ficha') {
                await generarFichaPDF(t, empresa);
            } else {
                alert(`El módulo de ${tipo.toUpperCase()} está en construcción.`);
            }
        } catch (err) {
            console.error(err);
            alert("Error al generar: " + err.message);
        } finally {
            btnNombre.innerHTML = textoOriginal;
        }
    };

    // 4. GENERADOR DE PDF (CON LOGO EMPRESA)
    async function generarFichaPDF(t, empresa) {
        // Convertir imágenes a Base64 para que funcionen offline
        const fotoPerfil = t.foto_url ? await getBase64ImageFromUrl(t.foto_url) : null;
        const firmaTrab = t.firma_url ? await getBase64ImageFromUrl(t.firma_url) : null;
        const logoEmpresa = empresa.logo_url ? await getBase64ImageFromUrl(empresa.logo_url) : null;

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 40, 40, 40],
            content: [
                // Cabecera con Logo
                {
                    columns: [
                        { image: logoEmpresa || 'placeholder', width: 60, fit: [60, 60] },
                        {
                            text: [
                                { text: empresa.nombre.toUpperCase() + '\n', fontSize: 14, bold: true, color: '#1f4e79' },
                                { text: 'GESTIÓN DE SEGURIDAD Y SALUD\n', fontSize: 10, bold: true },
                                { text: 'FICHA SOCIOECONÓMICA', fontSize: 16, bold: true, color: '#c00000' }
                            ],
                            alignment: 'center', margin: [0, 5, 0, 0]
                        },
                        { text: '', width: 60 }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: '#1f4e79' }] },
                { text: '\n' },

                // Tabla de Datos
                {
                    style: 'tableExample',
                    color: '#333',
                    table: {
                        widths: [100, '*', 100, '*'],
                        body: [
                            [{ text: 'DATOS PERSONALES', style: 'headerRow', colSpan: 4 }, {}, {}, {}],
                            [
                                { rowSpan: 4, image: fotoPerfil || 'placeholder', fit: [90, 110], alignment: 'center' },
                                { text: 'Cédula:', bold: true }, { text: t.cedula || '', colSpan: 2 }, {}
                            ],
                            [{}, { text: 'Nombres:', bold: true }, { text: t.nombre || '', colSpan: 2 }, {}],
                            [{}, { text: 'Cargo:', bold: true }, { text: t.cargo || '', colSpan: 2 }, {}],
                            [{}, { text: 'Edad:', bold: true }, { text: (t.edad ? t.edad + ' años' : ''), colSpan: 2 }, {}],
                            
                            [{ text: 'F. Nacimiento:', bold: true }, { text: t.fecha_nacimiento || '' }, { text: 'Sangre:', bold: true }, { text: t.tipo_sangre || '' }],
                            [{ text: 'Estado Civil:', bold: true }, { text: t.estado_civil || '' }, { text: 'Nacionalidad:', bold: true }, { text: t.nacionalidad || '' }],
                            [{ text: 'Dirección:', bold: true }, { text: t.direccion || '', colSpan: 3 }, {}, {}],
                            [{ text: 'Celular:', bold: true }, { text: t.celular || '' }, { text: 'Correo:', bold: true }, { text: t.correo || '', fontSize: 8 }]
                        ]
                    }
                },
                { text: '\n' },

                // Emergencias
                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [{ text: 'EN CASO DE EMERGENCIA', style: 'headerRow', colSpan: 3 }, {}, {}],
                            [{ text: 'Nombre', bold: true }, { text: 'Parentesco', bold: true }, { text: 'Teléfono', bold: true }],
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
                                t.firma_url ? { image: firmaTrab, fit: [100, 50], alignment: 'center' } : { text: '\n\n' },
                                { canvas: [{ type: 'line', x1: 10, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                                { text: 'FIRMA DEL TRABAJADOR', alignment: 'center', fontSize: 8, bold: true },
                                { text: t.cedula, alignment: 'center', fontSize: 8 }
                            ]
                        },
                        {
                            stack: [
                                { text: '\n\n' },
                                { canvas: [{ type: 'line', x1: 10, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                                { text: 'REVISADO POR (SST)', alignment: 'center', fontSize: 8, bold: true }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                headerRow: { bold: true, fontSize: 10, fillColor: '#f2f2f2', alignment: 'left' },
                tableExample: { fontSize: 9, margin: [0, 5, 0, 15] }
            },
            images: {
                placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            }
        };
        pdfMake.createPdf(docDefinition).download(`Ficha_${t.nombre}.pdf`);
    }

    // 5. GESTIÓN DE VISTAS
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
        
        if(vista !== 'formulario') {
            document.getElementById('tab-trabajador-activo').style.display = 'none';
        }
    };

    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value = '';
        document.getElementById('t-estado').value = 'ACTIVO';
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150?text=FOTO';
        document.getElementById('preview-firma').style.display = 'none';
        
        document.getElementById('btn-dar-baja').style.display = 'none';
        document.getElementById('btn-reactivar').style.display = 'none';
        document.getElementById('titulo-formulario').innerText = "Nuevo Ingreso";
        
        document.getElementById('tab-trabajador-activo').style.display = 'none';
        document.querySelectorAll('.vista-seccion').forEach(v => v.style.display = 'none');
        document.getElementById('vista-formulario').style.display = 'block';
    };

    // 6. LISTADO Y CARGA
    async function listarTrabajadores(estado) {
        const gridId = estado === 'ACTIVO' ? 'grid-activos' : 'grid-pasivos';
        const countId = estado === 'ACTIVO' ? 'count-activos' : 'count-pasivos';
        
        const { data } = await supabase.from('trabajadores')
            .select('id, nombre, cargo, foto_url')
            .eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');

        document.getElementById(countId).innerText = data ? data.length : 0;
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';

        data?.forEach(t => {
            const div = document.createElement('div');
            div.className = 'worker-card';
            div.innerHTML = `
                <div class="w-avatar">${t.foto_url ? `<img src="${t.foto_url}" style="width:100%; height:100%; object-fit:cover;">` : t.nombre.charAt(0)}</div>
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:1em;">${t.nombre}</h4>
                    <small style="color:#aaa;">${t.cargo}</small>
                </div>`;
            div.onclick = () => abrirFicha(t.id);
            grid.appendChild(div);
        });
    }

    async function abrirFicha(id) {
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
        if(!t) return;

        // Configurar Pestaña con Nombre
        const primerNombre = t.nombre.split(' ')[0];
        document.getElementById('lbl-nombre-trab').innerText = primerNombre;
        document.getElementById('tab-trabajador-activo').style.display = 'inline-block';
        document.getElementById('titulo-formulario').innerText = `Ficha de: ${t.nombre}`;

        // Llenar Formulario
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-cedula').value = t.cedula;
        document.getElementById('t-nombre').value = t.nombre;
        document.getElementById('t-nacimiento').value = t.fecha_nacimiento;
        document.getElementById('t-cargo').value = t.cargo;
        document.getElementById('t-estado').value = t.estado;
        
        if(t.fecha_nacimiento) {
             const hoy = new Date(); const nac = new Date(t.fecha_nacimiento);
             let edad = hoy.getFullYear() - nac.getFullYear();
             if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
             document.getElementById('t-edad').value = edad + ' años';
        }

        document.getElementById('t-sexo').value = t.sexo || 'Hombre';
        document.getElementById('t-civil').value = t.estado_civil || '';
        document.getElementById('t-celular').value = t.celular || '';
        document.getElementById('t-correo').value = t.correo || '';
        document.getElementById('t-direccion').value = t.direccion || '';
        document.getElementById('t-nacionalidad').value = t.nacionalidad || 'ECUATORIANA';
        document.getElementById('t-profesion').value = t.profesion || '';
        document.getElementById('t-vivienda').value = t.tipo_vivienda || 'Propia';
        
        // Tallas
        document.getElementById('t-camisa').value = t.talla_camisa || '';
        document.getElementById('t-pantalon').value = t.talla_pantalon || '';
        document.getElementById('
