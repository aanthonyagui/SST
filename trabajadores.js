// trabajadores.js - VERSIÓN ORIGINAL MEJORADA (PDF GOLDMINS)

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            
            <div id="tab-container">
                <button class="tab-btn active" id="tab-activos" onclick="cambiarVista('activos')">
                    <i class="fas fa-user-check"></i> <span class="desktop-text">Activos</span> 
                    <span id="count-activos" class="badge" style="background:var(--success); color:black;">0</span>
                </button>
                
                <button class="tab-btn" id="tab-pasivos" onclick="cambiarVista('pasivos')">
                    <i class="fas fa-user-times"></i> <span class="desktop-text">Retirados</span> 
                    <span id="count-pasivos" class="badge" style="background:var(--danger); margin-left:5px;">0</span>
                </button>
                
                <button class="tab-btn" id="btn-nueva-ficha" onclick="nuevaFicha()">
                    <i class="fas fa-plus"></i> <span class="desktop-text">Nuevo</span>
                </button>

                <div class="dropdown" id="tab-trabajador-activo" style="display:none;">
                    <button class="tab-btn active" onclick="toggleDropdown()" id="btn-nombre-trabajador" style="border-color:#f1c40f; color:#f1c40f;">
                        <i class="fas fa-user-cog"></i> <span id="lbl-nombre-trab">NOMBRE</span> <i class="fas fa-caret-down"></i>
                    </button>
                    <div id="dropdown-print" class="dropdown-content">
                        <div style="text-align:center; padding:10px; color:#aaa; font-size:0.8em; border-bottom:1px solid #444;">DOCUMENTOS</div>
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf" style="color:var(--danger);"></i> Ficha Socioeconómica</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-hard-hat" style="color:var(--warning);"></i> Generar ATS</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list" style="color:var(--success);"></i> Kardex EPP</a>
                        <a onclick="imprimirDoc('induccion')"><i class="fas fa-chalkboard-teacher"></i> Inducción</a>
                        <a onclick="toggleDropdown()" style="color:#aaa; justify-content:center; border-top:1px solid #444;"><i class="fas fa-times"></i> Cerrar</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin:15px 0;">

        <div id="vista-activos" class="vista-seccion">
            <input type="text" id="buscador-activos" placeholder="Buscar trabajador activo..." style="width:100%; padding:10px; border-radius:10px; border:1px solid #444; background:rgba(0,0,0,0.5); color:white; margin-bottom:10px;">
            <div id="grid-activos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-pasivos" class="vista-seccion" style="display:none;">
            <input type="text" id="buscador-pasivos" placeholder="Buscar trabajador retirado..." style="width:100%; padding:10px; border-radius:10px; border:1px solid var(--danger); background:rgba(0,0,0,0.5); color:white; margin-bottom:10px;">
            <div id="grid-pasivos" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-formulario" class="vista-seccion" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="color:#00d2ff; margin:0;" id="titulo-formulario">Ficha</h3>
                
                <div style="display:flex; gap:5px;">
                    <button id="btn-dar-baja" class="btn-small" style="background:var(--danger); display:none;"><i class="fas fa-user-slash"></i> <span class="desktop-text">Dar Baja</span></button>
                    <button id="btn-reactivar" class="btn-small" style="background:var(--success); color:black; display:none;"><i class="fas fa-user-check"></i> <span class="desktop-text">Reactivar</span></button>
                    <button class="btn-small" style="background:#555;" onclick="cambiarVista('activos')"><i class="fas fa-times"></i></button>
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
                            <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:5px; width:100%;">Foto</button>
                        </div>
                        <div class="form-grid" style="flex:1;">
                            <input type="text" id="t-cedula" placeholder="Cédula" maxlength="10" required>
                            <input type="text" id="t-nombre" placeholder="Nombres Completos" required>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                                <div><label style="font-size:0.7em; color:#aaa;">Fecha Nacimiento</label><input type="date" id="t-nacimiento"></div>
                                <input id="t-lugar" placeholder="Lugar de Nacimiento" style="margin-top:19px;">
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                                <select id="t-sexo"><option>Hombre</option><option>Mujer</option></select>
                                <select id="t-civil"><option>Soltero</option><option>Casado</option><option>Unión Libre</option><option>Divorciado</option></select>
                            </div>
                            <select id="t-sangre"><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>AB+</option></select>
                            <input type="text" id="t-nacionalidad" value="ECUATORIANA">
                            <input id="t-religion" placeholder="Religión">
                            <input id="t-discapacidad" placeholder="Discapacidad (NO / %)">
                            <input type="text" id="t-celular" placeholder="Celular">
                            <input type="email" id="t-correo" placeholder="Correo">
                            <input id="t-licencia" placeholder="Licencia (A, B, C...)">
                        </div>
                    </div>
                </div>

                <div class="seccion-form">
                    <h4 style="color:var(--primary); border-bottom:1px solid #444;">Información Laboral</h4>
                    <div class="form-grid">
                        <select id="t-cargo" required><option>Cargando cargos...</option></select>
                        <input type="text" id="t-profesion" placeholder="Profesión">
                        <input id="t-sueldo" placeholder="Sueldo Mensual ($)">
                        <div><label style="font-size:0.7em; color:#aaa;">Fecha Afiliación IESS</label><input type="date" id="t-afiliacion"></div>
                        <input id="t-banco" placeholder="Banco (Pichincha...)">
                        <input id="t-cuenta" placeholder="Nº Cuenta">
                    </div>
                </div>

                <div class="seccion-form">
                    <h4 style="color:var(--primary); border-bottom:1px solid #444;">Vivienda</h4>
                    <div class="form-grid">
                        <select id="t-vivienda"><option>Propia</option><option>Arrendada</option><option>Familiar</option></select>
                        <input type="text" id="t-direccion" placeholder="Dirección Domiciliaria" style="grid-column:1/-1">
                        <input id="t-material" placeholder="Material Paredes (Cemento...)">
                        <input id="t-cubierta" placeholder="Material Techo (Zinc...)">
                        <input id="t-habitaciones" placeholder="Nº Habitaciones">
                        <input id="t-seguridad" placeholder="Seguridad Sector (Buena/Mala)">
                    </div>
                    <div class="multi-select-box" style="margin-top:10px;">
                        <label>Servicios Básicos:</label>
                        <label><input type="checkbox" name="serv" value="Luz"> Luz</label>
                        <label><input type="checkbox" name="serv" value="Agua"> Agua</label>
                        <label><input type="checkbox" name="serv" value="Internet"> Internet</label>
                        <label><input type="checkbox" name="serv" value="Alcantarillado"> Alcantarillado</label>
                    </div>
                </div>

                <div class="seccion-form">
                    <h4 style="color:var(--primary); border-bottom:1px solid #444;">Emergencia y Tallas</h4>
                    <div class="form-grid">
                        <input type="text" id="t-emer-nom" placeholder="Nombre Contacto 1">
                        <input type="text" id="t-emer-par" placeholder="Parentesco">
                        <input type="text" id="t-emer-tel" placeholder="Teléfono">
                    </div>
                    <hr style="border-color:#444; margin:10px 0;">
                    <div class="form-grid">
                        <input id="t-emer2-nom" placeholder="Nombre Contacto 2">
                        <input id="t-emer2-par" placeholder="Parentesco">
                        <input id="t-emer2-tel" placeholder="Teléfono">
                    </div>
                    <div class="form-grid" style="grid-template-columns: repeat(3, 1fr); margin-top:15px;">
                        <input type="text" id="t-camisa" placeholder="Camisa">
                        <input type="text" id="t-pantalon" placeholder="Pantalón">
                        <input type="text" id="t-zapatos" placeholder="Zapatos">
                    </div>
                </div>

                <div class="seccion-form" style="text-align:center; border:1px dashed #555;">
                    <h4 style="margin-bottom:10px;">Firma del Trabajador</h4>
                    <img id="preview-firma" src="" style="display:none; height:80px; margin:0 auto 10px auto; background:white; padding:5px; border-radius:5px;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin:0 auto;">
                        <i class="fas fa-signature"></i> Cargar Firma
                    </button>
                    <input type="file" id="t-firma" accept="image/*" style="display:none;">
                    <p style="font-size:0.7em; color:#888; margin-top:5px;">Sube una foto clara de la firma.</p>
                </div>

                <div style="margin-top:20px; padding-bottom:60px; display:flex; gap:10px;">
                    <button type="submit" id="btn-guardar" style="background:#00d2ff; color:black;">Guardar Cambios</button>
                    <button type="button" onclick="cambiarVista('activos')" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA ---

    // Menu Desplegable
    window.toggleDropdown = () => {
        const drop = document.getElementById("dropdown-print");
        const btn = document.getElementById("tab-trabajador-activo");
        drop.classList.toggle("show");
        if(drop.classList.contains("show")) btn.classList.add("show");
        else btn.classList.remove("show");
    };

    // Previews
    const setupPreview = (inputId, imgId) => {
        document.getElementById(inputId).onchange = (e) => {
            if(e.target.files[0]){
                const r = new FileReader();
                r.onload = (ev) => { document.getElementById(imgId).src = ev.target.result; document.getElementById(imgId).style.display = 'block'; }
                r.readAsDataURL(e.target.files[0]);
            }
        }
    }
    setupPreview('t-foto', 'preview-foto');
    setupPreview('t-firma', 'preview-firma');

    // Navegación
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
        if(vista !== 'formulario') document.getElementById('tab-trabajador-activo').style.display = 'none';
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
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display = 'block';
    };

    // Listar
    async function listarTrabajadores(estado) {
        const gridId = estado === 'ACTIVO' ? 'grid-activos' : 'grid-pasivos';
        const countId = estado === 'ACTIVO' ? 'count-activos' : 'count-pasivos';
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');

        document.getElementById(countId).innerText = data ? data.length : 0;
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';

        data?.forEach(t => {
            const div = document.createElement('div');
            div.className = 'worker-card';
            div.innerHTML = `
                <div class="w-avatar">${t.foto_url ? `<img src="${t.foto_url}" style="width:100%; height:100%; object-fit:cover;">` : t.nombre.charAt(0)}</div>
                <div style="flex:1;"><h4 style="margin:0; font-size:1em;">${t.nombre}</h4><small style="color:#aaa;">${t.cargo}</small></div>
            `;
            div.onclick = () => abrirFicha(t.id);
            grid.appendChild(div);
        });
    }

    async function abrirFicha(id) {
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
        if(!t) return;

        // Mostrar Nombre y Menú
        document.getElementById('lbl-nombre-trab').innerText = t.nombre.split(' ')[0];
        document.getElementById('tab-trabajador-activo').style.display = 'inline-block';
        document.getElementById('titulo-formulario').innerText = `Ficha: ${t.nombre}`;

        // Mapeo de datos (Simple)
        const fields = ['cedula','nombre','nacimiento','lugar','sexo','civil','sangre','discapacidad','religion','celular','correo','licencia','cargo','profesion','sueldo','afiliacion','banco','cuenta','direccion','vivienda','material','cubierta','habitaciones','seguridad','camisa','pantalon','zapatos'];
        fields.forEach(f => {
            const el = document.getElementById('t-'+f);
            if(el) el.value = t[f.replace('-','_')] || (t['tipo_'+f] || '') || (t[f] || ''); // Intenta varias formas
        });

        document.getElementById('t-id').value = t.id;
        document.getElementById('t-estado').value = t.estado;
        document.getElementById('t-nacionalidad').value = t.nacionalidad || 'ECUATORIANA';

        // Emergencia
        document.getElementById('t-emer-nom').value = t.emergencia_nombre;
        document.getElementById('t-emer-par').value = t.emergencia_parentesco;
        document.getElementById('t-emer-tel').value = t.emergencia_telefono;
        document.getElementById('t-emer2-nom').value = t.emergencia2_nombre;
        document.getElementById('t-emer2-par').value = t.emergencia2_parentesco;
        document.getElementById('t-emer2-tel').value = t.emergencia2_telefono;

        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150?text=FOTO';
        if(t.firma_url) { document.getElementById('preview-firma').src = t.firma_url; document.getElementById('preview-firma').style.display = 'block'; }

        document.querySelectorAll('input[name="serv"]').forEach(c => c.checked = false);
        if(t.servicios_basicos) t.servicios_basicos.split(',').forEach(s => {
            const chk = document.querySelector(`input[name="serv"][value="${s}"]`);
            if(chk) chk.checked = true;
        });

        // Botones Estado
        const btnBaja = document.getElementById('btn-dar-baja');
        const btnReac = document.getElementById('btn-reactivar');
        if(t.estado === 'ACTIVO') {
            btnBaja.style.display = 'inline-flex'; btnReac.style.display = 'none';
            btnBaja.onclick = () => cambiarEstadoTrabajador(t.id, 'PASIVO', supabase);
        } else {
            btnBaja.style.display = 'none'; btnReac.style.display = 'inline-flex';
            btnReac.onclick = () => cambiarEstadoTrabajador(t.id, 'ACTIVO', supabase);
        }

        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display = 'block';
    }

    // Submit
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const servicios = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c => c.value).join(',');
        
        let fotoUrl = null; let firmaUrl = null;
        const fFoto = document.getElementById('t-foto').files[0];
        if(fFoto) fotoUrl = await subirArchivo(supabase, fFoto, 'fichas_personal');
        const fFirma = document.getElementById('t-firma').files[0];
        if(fFirma) firmaUrl = await subirArchivo(supabase, fFirma, 'fichas_personal');

        // OBJETO DE DATOS COMPLETO
        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: document.getElementById('t-nombre').value.toUpperCase(),
            fecha_nacimiento: document.getElementById('t-nacimiento').value,
            lugar_nacimiento: document.getElementById('t-lugar').value.toUpperCase(),
            sexo: document.getElementById('t-sexo').value,
            estado_civil: document.getElementById('t-civil').value,
            tipo_sangre: document.getElementById('t-sangre').value,
            discapacidad: document.getElementById('t-discapacidad').value,
            religion: document.getElementById('t-religion').value.toUpperCase(),
            celular: document.getElementById('t-celular').value,
            correo: document.getElementById('t-correo').value.toLowerCase(),
            tipo_licencia: document.getElementById('t-licencia').value.toUpperCase(),
            nacionalidad: document.getElementById('t-nacionalidad').value,
            
            cargo: document.getElementById('t-cargo').value,
            profesion: document.getElementById('t-profesion').value.toUpperCase(),
            sueldo: document.getElementById('t-sueldo').value,
            fecha_afiliacion: document.getElementById('t-afiliacion').value,
            tipo_banco: document.getElementById('t-banco').value.toUpperCase(),
            numero_cuenta: document.getElementById('t-cuenta').value,
            
            direccion: document.getElementById('t-direccion').value.toUpperCase(),
            tipo_vivienda: document.getElementById('t-vivienda').value,
            material_vivienda: document.getElementById('t-material').value.toUpperCase(),
            tipo_cubierta: document.getElementById('t-cubierta').value.toUpperCase(),
            num_habitaciones: document.getElementById('t-habitaciones').value,
            seguridad_sector: document.getElementById('t-seguridad').value.toUpperCase(),
            servicios_basicos: servicios,
            
            talla_camisa: document.getElementById('t-camisa').value,
            talla_pantalon: document.getElementById('t-pantalon').value,
            talla_zapatos: document.getElementById('t-zapatos').value,
            
            emergencia_nombre: document.getElementById('t-emer-nom').value.toUpperCase(),
            emergencia_parentesco: document.getElementById('t-emer-par').value.toUpperCase(),
            emergencia_telefono: document.getElementById('t-emer-tel').value,
            emergencia2_nombre: document.getElementById('t-emer2-nom').value.toUpperCase(),
            emergencia2_parentesco: document.getElementById('t-emer2-par').value.toUpperCase(),
            emergencia2_telefono: document.getElementById('t-emer2-tel').value
        };
        if(fotoUrl) datos.foto_url = fotoUrl;
        if(firmaUrl) datos.firma_url = firmaUrl;

        let error;
        if(id) { const res = await supabase.from('trabajadores').update(datos).eq('id', id); error = res.error; } 
        else { const res = await supabase.from('trabajadores').insert([datos]); error = res.error; }

        if(error) alert("Error: " + error.message);
        else { alert("Guardado"); listarTrabajadores('ACTIVO'); cambiarVista('activos'); }
    };

    // IMPRIMIR PDF (ESTILO GOLDMINS COMPLETO)
    window.imprimirDoc = async (tipo) => {
        if(tipo !== 'ficha') return alert("En construcción");
        const id = document.getElementById('t-id').value;
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
        const logo = await safeImageLoad(empresa.logo_url);
        const foto = await safeImageLoad(t.foto_url);
        const firma = await safeImageLoad(t.firma_url);

        const doc = {
            pageSize: 'A4',
            pageMargins: [40, 40, 40, 40],
            content: [
                {
                    columns: [
                        { image: logo || 'pixel', width: 60, fit: [60, 60] },
                        {
                            text: [
                                { text: empresa.nombre.toUpperCase() + '\n', fontSize: 14, bold: true, color: '#1f4e79' },
                                { text: 'FICHA SOCIOECONÓMICA', fontSize: 16, bold: true, color: '#c00000', margin: [0, 5, 0, 0] }
                            ],
                            alignment: 'center'
                        },
                        { text: '', width: 60 }
                    ]
                },
                { text: '\n' },
                {
                    table: {
                        widths: [90, '*', 90, '*'],
                        body: [
                            [{image: foto||'pixel', width:80, rowSpan:6, alignment:'center'}, {text:'Cédula:', bold:true}, t.cedula||'', {}],
                            ['', {text:'Nombre:', bold:true}, {text:t.nombre||'', colSpan:2}, {}],
                            ['', {text:'Nacimiento:', bold:true}, t.fecha_nacimiento||'', {text:'Edad: '+calcEdad(t.fecha_nacimiento)}],
                            ['', {text:'Cargo:', bold:true}, {text:t.cargo||'', colSpan:2}, {}],
                            ['', {text:'Dirección:', bold:true}, {text:t.direccion||'', colSpan:2}, {}],
                            ['', {text:'Celular:', bold:true}, t.celular||'', {text:'Sangre: '+(t.tipo_sangre||'')}]
                        ]
                    }
                },
                { text: 'DETALLES ADICIONALES', style:'header', margin:[0,10,0,5] },
                {
                    table: {
                        widths: ['*', '*', '*', '*'],
                        body: [
                            ['Banco', t.tipo_banco||'-', 'Cuenta', t.numero_cuenta||'-'],
                            ['Licencia', t.tipo_licencia||'-', 'Religión', t.religion||'-'],
                            ['Sueldo', '$'+(t.sueldo||'0'), 'Afiliación', t.fecha_afiliacion||'-']
                        ]
                    }, layout:'lightHorizontalLines'
                },
                { text: 'VIVIENDA', style:'header', margin:[0,10,0,5] },
                {
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            ['Tenencia: '+(t.tipo_vivienda||'-'), 'Material: '+(t.material_vivienda||'-'), 'Cubierta: '+(t.tipo_cubierta||'-')],
                            [{text:'Servicios: '+(t.servicios_basicos||'-'), colSpan:3, fontSize:8}, {}, {}]
                        ]
                    }, layout:'lightHorizontalLines'
                },
                { text: '\n\n' },
                { image: firma||'pixel', width:100, alignment:'center' },
                { text: 'FIRMA TRABAJADOR', alignment:'center', fontSize:9 }
            ],
            images: { pixel: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
            styles: { header: { fontSize: 11, bold: true, color: '#1f4e79', margin: [0, 5, 0, 5] } }
        };
        pdfMake.createPdf(doc).download(`Ficha_${t.nombre}.pdf`);
    };

    async function safeImageLoad(url) {
        if (!url) return null;
        try { const r = await fetch(url); const b = await r.blob(); return new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); }); } catch { return null; }
    }
    
    function calcEdad(f){ if(!f) return '-'; const h=new Date(); const n=new Date(f); let e=h.getFullYear()-n.getFullYear(); if(h.getMonth()<n.getMonth()) e--; return e+' años'; }

    cargarCargos(supabase);
    listarTrabajadores('ACTIVO');
    listarTrabajadores('PASIVO');
    async function cargarCargos(sb){ const { data } = await sb.from('cargos').select('*').order('nombre'); const s=document.getElementById('t-cargo'); s.innerHTML='<option>Seleccione...</option>'; data?.forEach(c=>s.innerHTML+=`<option>${c.nombre}</option>`); }
    async function cambiarEstadoTrabajador(id, nuevo, sb) { if(confirm(`¿Cambiar a ${nuevo}?`)) { await sb.from('trabajadores').update({estado:nuevo}).eq('id',id); document.getElementById('tab-activos').click(); } }
    async function subirArchivo(sb, file, bucket) { const n = Date.now()+'_'+file.name.replace(/\W/g,''); const {error}=await sb.storage.from(bucket).upload(n,file); if(error)return null; return sb.storage.from(bucket).getPublicUrl(n).data.publicUrl; }
    document.getElementById('buscador-activos').onkeyup=(e)=>{ const t=e.target.value.toLowerCase(); document.querySelectorAll('#grid-activos .worker-card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(t)?'flex':'none'); }
}
