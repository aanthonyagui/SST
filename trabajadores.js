// trabajadores.js - VERSIÓN EXPANDIDA (DATOS PDF + UI MÓVIL)

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            
            <div id="tab-container">
                <button class="tab-btn active" id="tab-activos" onclick="cambiarVista('activos')">
                    <i class="fas fa-user-check"></i> <span class="desktop-text">Activos</span>
                    <span id="count-activos" class="badge">0</span>
                </button>
                <button class="tab-btn" id="tab-pasivos" onclick="cambiarVista('pasivos')">
                    <i class="fas fa-user-times"></i> <span class="desktop-text">Pasivos</span>
                </button>
                <button class="tab-btn" onclick="nuevaFicha()">
                    <i class="fas fa-plus"></i> <span class="desktop-text">Nuevo</span>
                </button>
                
                <div class="dropdown" id="dropdown-trabajador" style="display:none;">
                    <button class="tab-btn active" style="border-color:#f1c40f; color:#f1c40f;" onclick="toggleDrop()">
                        <i class="fas fa-cog"></i> <span id="lbl-nombre-trab">OPCIONES</span>
                    </button>
                    <div id="drop-content" class="dropdown-content">
                        <div style="text-align:center; padding:10px; color:#aaa; font-size:0.8em; border-bottom:1px solid #444;">GENERAR DOCUMENTOS</div>
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf"></i> Ficha Socioeconómica</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-hard-hat"></i> Generar ATS</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list"></i> Kardex EPP</a>
                        <a onclick="imprimirDoc('induccion')"><i class="fas fa-chalkboard-teacher"></i> Inducción</a>
                        <a onclick="cerrarDrop()" style="color:#e74c3c; justify-content:center;"><i class="fas fa-times"></i> Cerrar Menú</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin:15px 0;">

        <div id="vista-activos">
            <input type="text" id="buscador-activos" placeholder="Buscar trabajador..." style="width:100%; padding:12px; border-radius:30px; border:1px solid #444; background:#111; color:white; margin-bottom:15px;">
            <div id="grid-activos" class="worker-grid">Cargando...</div>
        </div>
        <div id="vista-pasivos" style="display:none;">
            <div id="grid-pasivos" class="worker-grid"></div>
        </div>

        <div id="vista-formulario" style="display:none;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <button class="btn-small" style="background:#555;" onclick="cambiarVista('activos')"><i class="fas fa-arrow-left"></i> Volver</button>
                <h3 style="margin:0; color:#00d2ff;">Ficha Personal</h3>
            </div>

            <form id="form-trabajador">
                <input type="hidden" id="t-id">
                <input type="hidden" id="t-estado" value="ACTIVO">

                <div class="form-section">
                    <div class="form-title"><i class="fas fa-id-card"></i> Datos Personales</div>
                    <div style="text-align:center; margin-bottom:15px;">
                        <img id="preview-foto" src="https://via.placeholder.com/150" class="foto-perfil">
                        <br><button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:5px;">Cambiar Foto</button>
                        <input type="file" id="t-foto" hidden accept="image/*">
                    </div>
                    <div class="form-grid">
                        <input id="t-cedula" placeholder="Cédula" required>
                        <input id="t-nombre" placeholder="Apellidos y Nombres" required>
                        <div><label style="font-size:0.8em; color:#aaa;">Fecha Nacimiento</label><input type="date" id="t-nacimiento"></div>
                        <input id="t-lugar" placeholder="Lugar de Nacimiento">
                        <select id="t-sexo"><option>Hombre</option><option>Mujer</option></select>
                        <select id="t-civil"><option>Soltero(a)</option><option>Casado(a)</option><option>Unión Libre</option><option>Divorciado(a)</option><option>Viudo(a)</option></select>
                        <select id="t-sangre"><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>AB+</option></select>
                        <input id="t-discapacidad" placeholder="Discapacidad (SI/NO - %)">
                        <input id="t-religion" placeholder="Religión">
                        <input id="t-celular" placeholder="Celular">
                        <input id="t-correo" type="email" placeholder="Correo Electrónico">
                        <input id="t-licencia" placeholder="Tipo Licencia (A, B, C...)">
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-title"><i class="fas fa-briefcase"></i> Información Laboral</div>
                    <div class="form-grid">
                        <select id="t-cargo" required><option>Cargando...</option></select>
                        <input id="t-profesion" placeholder="Profesión / Título">
                        <input id="t-sueldo" placeholder="Sueldo Mensual">
                        <div><label style="font-size:0.8em; color:#aaa;">Fecha Afiliación IESS</label><input type="date" id="t-afiliacion"></div>
                        <input id="t-banco" placeholder="Banco (Pichincha, Guayaquil...)">
                        <input id="t-cuenta" placeholder="Número de Cuenta">
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-title"><i class="fas fa-home"></i> Vivienda y Ubicación</div>
                    <div class="form-grid">
                        <input id="t-direccion" placeholder="Dirección Domiciliaria" style="grid-column:1/-1">
                        <select id="t-vivienda"><option>Propia</option><option>Arrendada</option><option>Familiar</option></select>
                        <input id="t-material" placeholder="Material Paredes (Cemento...)">
                        <input id="t-cubierta" placeholder="Material Techo (Zinc, Losa...)">
                        <input id="t-habitaciones" placeholder="Nº Habitaciones">
                        <input id="t-seguridad" placeholder="Seguridad del Sector (Buena/Mala)">
                    </div>
                    <div class="multi-select-box" style="margin-top:10px;">
                        <label>Servicios Básicos:</label>
                        <label><input type="checkbox" name="serv" value="Luz"> Luz</label>
                        <label><input type="checkbox" name="serv" value="Agua"> Agua</label>
                        <label><input type="checkbox" name="serv" value="Internet"> Internet</label>
                        <label><input type="checkbox" name="serv" value="Alcantarillado"> Alcantarillado</label>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-title"><i class="fas fa-tshirt"></i> Tallas</div>
                    <div class="form-grid" style="grid-template-columns: repeat(3, 1fr);">
                        <input id="t-camisa" placeholder="Camisa">
                        <input id="t-pantalon" placeholder="Pantalón">
                        <input id="t-zapatos" placeholder="Zapatos">
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-title"><i class="fas fa-ambulance"></i> En Caso de Emergencia</div>
                    <div class="form-grid">
                        <input id="t-emer-nom" placeholder="Nombre Contacto 1">
                        <input id="t-emer-par" placeholder="Parentesco">
                        <input id="t-emer-tel" placeholder="Teléfono">
                    </div>
                    <hr style="border-color:#444; margin:10px 0;">
                    <div class="form-grid">
                        <input id="t-emer2-nom" placeholder="Nombre Contacto 2">
                        <input id="t-emer2-par" placeholder="Parentesco">
                        <input id="t-emer2-tel" placeholder="Teléfono">
                    </div>
                </div>

                <div class="form-section" style="text-align:center;">
                    <div class="form-title">Firma del Trabajador</div>
                    <img id="preview-firma" src="" style="height:60px; display:none; margin:0 auto 10px; background:white; padding:5px; border-radius:5px;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444;">Subir Firma</button>
                    <input type="file" id="t-firma" hidden accept="image/*">
                    <p style="font-size:0.7em; color:#888;">Firma clara en fondo blanco</p>
                </div>

                <div style="margin-bottom:60px; display:flex; gap:10px;">
                    <button type="submit" id="btn-guardar">GUARDAR CAMBIOS</button>
                    <button type="button" onclick="cambiarVista('activos')" style="background:#555;">CANCELAR</button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA ---
    
    // Toggle Dropdown (Ahora agrega clase al contenedor padre para el CSS)
    window.toggleDrop = () => {
        const drop = document.getElementById("drop-content");
        const container = document.getElementById("dropdown-trabajador");
        drop.classList.toggle("show");
        if(drop.classList.contains("show")) container.classList.add("show"); // Para el fondo oscuro en móvil
        else container.classList.remove("show");
    };
    window.cerrarDrop = () => {
        document.getElementById("drop-content").classList.remove("show");
        document.getElementById("dropdown-trabajador").classList.remove("show");
    };

    // Previsualizar Imagen
    const setupPreview = (inputId, imgId) => {
        document.getElementById(inputId).onchange = (e) => {
            if(e.target.files[0]){
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = document.getElementById(imgId);
                    img.src = ev.target.result;
                    img.style.display = 'block';
                }
                reader.readAsDataURL(e.target.files[0]);
            }
        }
    }
    setupPreview('t-foto', 'preview-foto');
    setupPreview('t-firma', 'preview-firma');

    // Navegación
    window.cambiarVista = (v) => {
        ['vista-activos','vista-pasivos','vista-formulario'].forEach(id=>document.getElementById(id).style.display='none');
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        
        if(v==='activos') {
            document.getElementById('vista-activos').style.display='block';
            document.getElementById('tab-activos').classList.add('active');
        }
        if(v==='pasivos') {
            document.getElementById('vista-pasivos').style.display='block';
            document.getElementById('tab-pasivos').classList.add('active');
        }
        if(v!=='formulario') document.getElementById('dropdown-trabajador').style.display='none';
    };

    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value='';
        document.getElementById('preview-foto').src='https://via.placeholder.com/150';
        document.getElementById('preview-firma').style.display='none';
        
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    };

    // Cargar Listas
    async function listar(estado, gridId) {
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');
        const grid = document.getElementById(gridId); grid.innerHTML='';
        if(estado==='ACTIVO') document.getElementById('count-activos').innerText = data?.length||0;
        
        data?.forEach(t=>{
            const d = document.createElement('div'); d.className='worker-card';
            d.innerHTML=`
                <div class="w-avatar"><img src="${t.foto_url || 'https://via.placeholder.com/50'}" style="width:100%; height:100%; object-fit:cover;"></div>
                <div><h4 style="margin:0">${t.nombre}</h4><small style="color:#aaa">${t.cargo}</small></div>
            `;
            d.onclick=()=>abrir(t);
            grid.appendChild(d);
        });
    }

    function abrir(t) {
        // Mapeo de campos simple
        const fields = ['cedula','nombre','nacimiento','lugar','sexo','civil','sangre','discapacidad','religion','celular','correo','licencia','cargo','profesion','sueldo','afiliacion','banco','cuenta','direccion','vivienda','material','cubierta','habitaciones','seguridad','camisa','pantalon','zapatos'];
        fields.forEach(f => {
            const el = document.getElementById('t-'+f);
            if(el) el.value = t[f.replace('-','_')] || (t['tipo_'+f] || '');
        });

        // Mapeo campos especiales
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-emer-nom').value = t.emergencia_nombre;
        document.getElementById('t-emer-par').value = t.emergencia_parentesco;
        document.getElementById('t-emer-tel').value = t.emergencia_telefono;
        document.getElementById('t-emer2-nom').value = t.emergencia2_nombre;
        document.getElementById('t-emer2-par').value = t.emergencia2_parentesco;
        document.getElementById('t-emer2-tel').value = t.emergencia2_telefono;

        // Checkboxes
        document.querySelectorAll('input[name="serv"]').forEach(c => c.checked = false);
        if(t.servicios_basicos) t.servicios_basicos.split(',').forEach(s => {
            const chk = document.querySelector(`input[name="serv"][value="${s}"]`);
            if(chk) chk.checked = true;
        });

        // Fotos
        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150';
        if(t.firma_url) {
            document.getElementById('preview-firma').src = t.firma_url;
            document.getElementById('preview-firma').style.display='block';
        }

        // Mostrar Dropdown y Formulario
        document.getElementById('lbl-nombre-trab').innerText = t.nombre.split(' ')[0];
        document.getElementById('dropdown-trabajador').style.display='inline-block';
        
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    }

    // GUARDAR (Submit)
    document.getElementById('form-trabajador').onsubmit = async(e)=>{
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const servicios = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c=>c.value).join(',');
        
        // Objeto de datos (Expandido)
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

        const fFoto = document.getElementById('t-foto').files[0];
        if(fFoto) datos.foto_url = await subir(fFoto);
        const fFirma = document.getElementById('t-firma').files[0];
        if(fFirma) datos.firma_url = await subir(fFirma);

        if(id) await supabase.from('trabajadores').update(datos).eq('id',id);
        else await supabase.from('trabajadores').insert([datos]);
        
        alert("Guardado");
        listar('ACTIVO','grid-activos');
        cambiarVista('activos');
    };

    async function subir(file) {
        const name = Date.now()+'_'+file.name.replace(/\W/g,'');
        await supabase.storage.from('fichas_personal').upload(name, file);
        return supabase.storage.from('fichas_personal').getPublicUrl(name).data.publicUrl;
    }

    // IMPRIMIR PDF (Actualizado con nuevos campos)
    window.imprimirDoc = async (tipo) => {
        if(tipo !== 'ficha') return alert("En construcción");
        const id = document.getElementById('t-id').value;
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id',id).single();
        
        const logo = await base64(empresa.logo_url);
        const foto = await base64(t.foto_url);
        const firma = await base64(t.firma_url);

        const doc = {
            pageSize: 'A4',
            pageMargins: [30, 30, 30, 30],
            content: [
                {
                    columns: [
                        { image: logo||'pixel', width:50 },
                        { text: 'FICHA SOCIOECONÓMICA\n'+empresa.nombre, alignment:'center', bold:true, fontSize:14 }
                    ]
                },
                { text: '\n' },
                {
                    table: {
                        widths: [90, '*', 90, '*'],
                        body: [
                            [{image: foto||'pixel', width:80, rowSpan:6, alignment:'center'}, {text:'Cédula:', bold:true}, {text:t.cedula||'', colSpan:2}, {}],
                            ['', {text:'Nombre:', bold:true}, {text:t.nombre||'', colSpan:2}, {}],
                            ['', {text:'F. Nacimiento:', bold:true}, t.fecha_nacimiento||'', {text:'Edad: 25'}], // Calcular edad real si quieres
                            ['', {text:'Celular:', bold:true}, t.celular||'', {text:'Civil:', bold:true}],
                            ['', {text:'Cargo:', bold:true}, {text:t.cargo||'', colSpan:2}, {}],
                            ['', {text:'Dirección:', bold:true}, {text:t.direccion||'', colSpan:2}, {}]
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
                            ['Vivienda', t.tipo_vivienda||'-', 'Material', t.material_vivienda||'-']
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: 'EMERGENCIAS', style:'header', margin:[0,10,0,5] },
                {
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [{text:'Nombre', bold:true}, {text:'Parentesco', bold:true}, {text:'Teléfono', bold:true}],
                            [t.emergencia_nombre||'-', t.emergencia_parentesco||'-', t.emergencia_telefono||'-'],
                            [t.emergencia2_nombre||'-', t.emergencia2_parentesco||'-', t.emergencia2_telefono||'-']
                        ]
                    }
                },
                { text: '\n\n' },
                { image: firma||'pixel', width:100, alignment:'center' },
                { text: 'FIRMA TRABAJADOR', alignment:'center', fontSize:9 }
            ],
            images: { pixel: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
            styles: { header: { fontSize:11, bold:true, color:'#00d2ff', margin:[0,5,0,5] } }
        };
        pdfMake.createPdf(doc).download(`Ficha_${t.nombre}.pdf`);
    };

    async function base64(url) {
        if(!url) return null;
        try { const r = await fetch(url); const b = await r.blob(); return new Promise(res=>{const f=new FileReader(); f.onload=()=>res(f.result); f.readAsDataURL(b)}); } catch{ return null; }
    }
    
    // Carga inicial
    cargarCargos(supabase);
    listar('ACTIVO','grid-activos');
    listar('PASIVO','grid-pasivos');
    document.getElementById('buscador-activos').onkeyup=(e)=>{
        const txt = e.target.value.toLowerCase();
        document.querySelectorAll('#grid-activos .worker-card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(txt)?'flex':'none');
    };
    
    async function cargarCargos(sb) {
        const { data } = await sb.from('cargos').select('*').order('nombre');
        const s = document.getElementById('t-cargo'); s.innerHTML='<option>Seleccione...</option>';
        data?.forEach(c=>s.innerHTML+=`<option>${c.nombre}</option>`);
    }
}
