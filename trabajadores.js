// trabajadores.js - VERSIÓN FINAL CON ESTILO NEÓN Y DATOS COMPLETOS

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            
            <div id="tab-container">
                <button class="tab-btn active" id="tab-activos" onclick="cambiarVista('activos')">
                    <i class="fas fa-user-check"></i> <span class="desktop-text">Activos</span>
                    <span id="count-activos" class="badge" style="background:var(--success);">0</span>
                </button>
                
                <button class="tab-btn" id="tab-pasivos" onclick="cambiarVista('pasivos')">
                    <i class="fas fa-user-times"></i> <span class="desktop-text">Retirados</span>
                </button>
                
                <button class="tab-btn" onclick="nuevaFicha()">
                    <i class="fas fa-plus"></i> <span class="desktop-text">Nuevo</span>
                </button>

                <div class="dropdown" id="dropdown-trabajador" style="display:none;">
                    <button class="tab-btn active" style="border-color:var(--warning); color:var(--warning); box-shadow:none;" onclick="toggleDrop()">
                        <i class="fas fa-user-cog"></i> <span id="lbl-nombre-trab">OPCIONES</span> <i class="fas fa-caret-down"></i>
                    </button>
                    
                    <div id="drop-content" class="dropdown-content">
                        <div style="text-align:center; padding:10px; color:#888; font-size:0.8em; border-bottom:1px solid rgba(255,255,255,0.1);">GENERAR DOCUMENTOS</div>
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf" style="color:var(--danger);"></i> Ficha Socioeconómica</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-hard-hat" style="color:var(--warning);"></i> Generar ATS</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list" style="color:var(--success);"></i> Kardex EPP</a>
                        <a onclick="imprimirDoc('induccion')"><i class="fas fa-chalkboard-teacher"></i> Inducción</a>
                        <a onclick="toggleDrop()" style="color:#aaa; justify-content:center; border-top:1px solid rgba(255,255,255,0.1);"><i class="fas fa-times"></i> Cerrar Menú</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:20px 0;">

        <div id="vista-activos">
            <input type="text" id="buscador-activos" placeholder="Buscar trabajador activo..." style="width:100%; border-radius:30px; margin-bottom:15px;">
            <div id="grid-activos" class="worker-grid">Cargando...</div>
        </div>
        <div id="vista-pasivos" style="display:none;">
            <input type="text" id="buscador-pasivos" placeholder="Buscar trabajador retirado..." style="width:100%; border-radius:30px; border-color:var(--danger); margin-bottom:15px;">
            <div id="grid-pasivos" class="worker-grid"></div>
        </div>

        <div id="vista-formulario" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:var(--primary); text-transform:uppercase; letter-spacing:1px;">Ficha Personal</h3>
                
                <div style="display:flex; gap:10px;">
                    <button id="btn-baja" class="btn-small" style="background:var(--danger); display:none; color:white;"><i class="fas fa-user-slash"></i> <span class="desktop-text">Dar Baja</span></button>
                    <button id="btn-alta" class="btn-small" style="background:var(--success); color:black; display:none;"><i class="fas fa-user-check"></i> <span class="desktop-text">Reactivar</span></button>
                    <button class="btn-small" style="background:#444;" onclick="cambiarVista('activos')"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <form id="form-trabajador" class="form-scroll">
                <input type="hidden" id="t-id">
                <input type="hidden" id="t-estado" value="ACTIVO">

                <div class="seccion-form">
                    <h4><i class="fas fa-id-card"></i> Datos Personales</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:20px;">
                        <div style="text-align:center; flex:0 0 120px; margin:0 auto;">
                            <img id="preview-foto" src="https://via.placeholder.com/150" class="foto-perfil">
                            <input type="file" id="t-foto" hidden accept="image/*">
                            <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:10px; width:100%; background:rgba(255,255,255,0.1); border:1px solid #555;">Subir Foto</button>
                        </div>
                        <div class="form-grid" style="flex:1;">
                            <input id="t-cedula" placeholder="Cédula" required maxlength="10">
                            <input id="t-nombre" placeholder="Apellidos y Nombres Completos" required>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                                <div><label style="font-size:0.7em; color:#aaa; margin-left:5px;">Fecha Nacimiento</label><input type="date" id="t-nacimiento"></div>
                                <input id="t-lugar" placeholder="Lugar de Nacimiento" style="margin-top:19px;">
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                                <select id="t-sexo"><option>Hombre</option><option>Mujer</option></select>
                                <select id="t-civil"><option>Soltero(a)</option><option>Casado(a)</option><option>Unión Libre</option><option>Divorciado(a)</option><option>Viudo(a)</option></select>
                            </div>
                            <select id="t-sangre"><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>AB+</option></select>
                            <input id="t-discapacidad" placeholder="Discapacidad (NO / %)">
                            <input id="t-religion" placeholder="Religión">
                            <input id="t-celular" placeholder="Celular">
                            <input id="t-correo" type="email" placeholder="Correo Electrónico">
                            <input id="t-licencia" placeholder="Tipo Licencia (A, B, C...)">
                        </div>
                    </div>
                </div>

                <div class="seccion-form">
                    <h4><i class="fas fa-briefcase"></i> Información Laboral y Bancaria</h4>
                    <div class="form-grid">
                        <select id="t-cargo" required><option>Cargando cargos...</option></select>
                        <input id="t-profesion" placeholder="Profesión / Título">
                        <input id="t-sueldo" placeholder="Sueldo Mensual ($)">
                        <div><label style="font-size:0.7em; color:#aaa; margin-left:5px;">Fecha Afiliación IESS</label><input type="date" id="t-afiliacion"></div>
                        <input id="t-banco" placeholder="Banco (Pichincha, Guayaquil...)">
                        <input id="t-cuenta" placeholder="Nº Cuenta Ahorros">
                    </div>
                </div>

                <div class="seccion-form">
                    <h4><i class="fas fa-home"></i> Vivienda y Ubicación</h4>
                    <div class="form-grid">
                        <input id="t-direccion" placeholder="Dirección Domiciliaria Completa" style="grid-column:1/-1">
                        <select id="t-vivienda"><option>Propia</option><option>Arrendada</option><option>Familiar</option></select>
                        <input id="t-material" placeholder="Material Paredes (Cemento...)">
                        <input id="t-cubierta" placeholder="Material Techo (Zinc, Losa...)">
                        <input id="t-habitaciones" placeholder="Nº Habitaciones">
                        <input id="t-seguridad" placeholder="Seguridad Sector (Buena/Mala)">
                    </div>
                    <div class="multi-select-box" style="margin-top:15px;">
                        <label style="display:block; margin-bottom:5px; color:#aaa;">Servicios Básicos:</label>
                        <div style="display:flex; flex-wrap:wrap; gap:15px;">
                            <label><input type="checkbox" name="serv" value="Luz"> Luz</label>
                            <label><input type="checkbox" name="serv" value="Agua"> Agua</label>
                            <label><input type="checkbox" name="serv" value="Internet"> Internet</label>
                            <label><input type="checkbox" name="serv" value="Alcantarillado"> Alcantarillado</label>
                        </div>
                    </div>
                </div>

                <div class="seccion-form">
                    <h4><i class="fas fa-ambulance"></i> En Caso de Emergencia</h4>
                    <div class="form-grid">
                        <input id="t-emer-nom" placeholder="Nombre Contacto 1">
                        <input id="t-emer-par" placeholder="Parentesco">
                        <input id="t-emer-tel" placeholder="Teléfono">
                    </div>
                    <hr style="border-color:rgba(255,255,255,0.1); margin:15px 0;">
                    <div class="form-grid">
                        <input id="t-emer2-nom" placeholder="Nombre Contacto 2">
                        <input id="t-emer2-par" placeholder="Parentesco">
                        <input id="t-emer2-tel" placeholder="Teléfono">
                    </div>
                </div>

                <div class="seccion-form">
                    <h4>Tallas y Firma</h4>
                    <div class="form-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:20px;">
                        <input id="t-camisa" placeholder="Camisa">
                        <input id="t-pantalon" placeholder="Pantalón">
                        <input id="t-zapatos" placeholder="Zapatos">
                    </div>
                    <div style="text-align:center; border:1px dashed #555; padding:20px; border-radius:15px; background:rgba(0,0,0,0.2);">
                        <img id="preview-firma" src="" style="height:70px; display:none; margin:0 auto 10px; background:white; padding:5px; border-radius:5px;">
                        <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin:0 auto;">Cargar Firma</button>
                        <input type="file" id="t-firma" hidden accept="image/*">
                        <p style="font-size:0.8em; color:#888; margin-top:5px;">Firma clara en fondo blanco</p>
                    </div>
                </div>

                <div style="display:flex; gap:15px; padding-bottom:80px; margin-top:20px;">
                    <button type="submit" id="btn-guardar" style="background:var(--primary); color:black; flex:2;">GUARDAR CAMBIOS</button>
                    <button type="button" onclick="cambiarVista('activos')" style="background:#333; flex:1;">CANCELAR</button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA JAVASCRIPT ---
    
    // Toggle Menú Flotante
    window.toggleDrop = () => {
        const d = document.getElementById("drop-content");
        const p = document.getElementById("dropdown-trabajador");
        d.classList.toggle("show");
        if(d.classList.contains("show")) p.classList.add("show"); // Activa fondo oscuro en móvil
        else p.classList.remove("show");
    };

    // Previews de Fotos
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

    // Navegación Vistas
    window.cambiarVista = (v) => {
        document.querySelectorAll('.vista-seccion').forEach(e=>e.style.display='none');
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
        document.getElementById('t-estado').value='ACTIVO';
        document.getElementById('preview-foto').src='https://via.placeholder.com/150';
        document.getElementById('preview-firma').style.display='none';
        
        document.getElementById('btn-baja').style.display='none';
        document.getElementById('btn-alta').style.display='none';
        
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    };

    // Listar Trabajadores
    async function listar(estado, gridId) {
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');
        const grid = document.getElementById(gridId); grid.innerHTML='';
        if(estado==='ACTIVO') document.getElementById('count-activos').innerText = data?.length||0;
        
        data?.forEach(t=>{
            const d = document.createElement('div'); d.className='worker-card';
            const imgUrl = t.foto_url || 'https://via.placeholder.com/50';
            d.innerHTML=`
                <div class="w-avatar"><img src="${imgUrl}" onerror="this.src='https://via.placeholder.com/50'"></div>
                <div><h4 style="margin:0; font-size:1em;">${t.nombre}</h4><small style="color:#aaa; font-size:0.8em;">${t.cargo}</small></div>
            `;
            d.onclick=()=>abrir(t);
            grid.appendChild(d);
        });
    }

    // Abrir Ficha (Editar)
    function abrir(t) {
        const fields = ['cedula','nombre','nacimiento','lugar','sexo','civil','sangre','discapacidad','religion','celular','correo','licencia','cargo','profesion','sueldo','afiliacion','banco','cuenta','direccion','vivienda','material','cubierta','habitaciones','seguridad','camisa','pantalon','zapatos'];
        fields.forEach(f => {
            const el = document.getElementById('t-'+f);
            if(el) el.value = t[f.replace('-','_')] || (t['tipo_'+f] || '');
        });
        
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-estado').value = t.estado;
        
        // Botones Estado (Dar Baja)
        const btnBaja = document.getElementById('btn-baja');
        const btnAlta = document.getElementById('btn-alta');
        if(t.estado === 'ACTIVO') {
            btnBaja.style.display = 'flex'; btnAlta.style.display = 'none';
            btnBaja.onclick = () => cambiarEstado(t.id, 'PASIVO');
        } else {
            btnBaja.style.display = 'none'; btnAlta.style.display = 'flex';
            btnAlta.onclick = () => cambiarEstado(t.id, 'ACTIVO');
        }

        // Emergencias
        document.getElementById('t-emer-nom').value = t.emergencia_nombre;
        document.getElementById('t-emer-par').value = t.emergencia_parentesco;
        document.getElementById('t-emer-tel').value = t.emergencia_telefono;
        document.getElementById('t-emer2-nom').value = t.emergencia2_nombre;
        document.getElementById('t-emer2-par').value = t.emergencia2_parentesco;
        document.getElementById('t-emer2-tel').value = t.emergencia2_telefono;

        document.querySelectorAll('input[name="serv"]').forEach(c=>c.checked=false);
        if(t.servicios_basicos) t.servicios_basicos.split(',').forEach(s=>{
            const k = document.querySelector(`input[name="serv"][value="${s}"]`);
            if(k) k.checked=true;
        });

        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150';
        if(t.firma_url) { document.getElementById('preview-firma').src=t.firma_url; document.getElementById('preview-firma').style.display='block'; }

        // Mostrar Botón con Nombre
        document.getElementById('lbl-nombre-trab').innerText = t.nombre.split(' ')[0];
        document.getElementById('dropdown-trabajador').style.display='inline-block';
        
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    }

    async function cambiarEstado(id, nuevoEstado) {
        if(!confirm(`¿Seguro deseas cambiar a ${nuevoEstado}?`)) return;
        await supabase.from('trabajadores').update({ estado: nuevoEstado }).eq('id', id);
        document.getElementById('tab-activos').click(); 
    }

    // GUARDAR (Submit)
    document.getElementById('form-trabajador').onsubmit = async(e)=>{
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const serv = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c=>c.value).join(',');
        
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
            servicios_basicos: serv,
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
        alert("Guardado Correctamente");
        listar('ACTIVO','grid-activos');
        cambiarVista('activos');
    };

    async function subir(f){
        const n = Date.now()+'_'+f.name.replace(/\W/g,'');
        await supabase.storage.from('fichas_personal').upload(n,f);
        return supabase.storage.from('fichas_personal').getPublicUrl(n).data.publicUrl;
    }

    // IMPRIMIR PDF (Con los datos completos)
    window.imprimirDoc = async(t)=>{
        if(t!=='ficha') return alert("Próximamente");
        const id = document.getElementById('t-id').value;
        const { data: tr } = await supabase.from('trabajadores').select('*').eq('id',id).single();
        const logo = await base64(empresa.logo_url);
        const foto = await base64(tr.foto_url);
        const firma = await base64(tr.firma_url);

        const doc = {
            pageSize: 'A4',
            pageMargins: [30,30,30,30],
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
                            [{image:foto||'pixel', width:80, rowSpan:6, alignment:'center'}, {text:'Cédula:', bold:true}, tr.cedula||'', {}],
                            ['', {text:'Nombre:', bold:true}, {text:tr.nombre||'', colSpan:2}, {}],
                            ['', {text:'Nacimiento:', bold:true}, tr.fecha_nacimiento||'', {text:'Edad: '+calcEdad(tr.fecha_nacimiento)}],
                            ['', {text:'Celular:', bold:true}, tr.celular||'', {text:'Sangre: '+(tr.tipo_sangre||'')}],
                            ['', {text:'Cargo:', bold:true}, {text:tr.cargo||'', colSpan:2}, {}],
                            ['', {text:'Dirección:', bold:true}, {text:tr.direccion||'', colSpan:2}, {}]
                        ]
                    }
                },
                { text: 'DETALLES ADICIONALES', style:'h', margin:[0,10,0,5] },
                {
                    table: {
                        widths: ['*','*','*','*'],
                        body: [
                            ['Banco', tr.tipo_banco||'-', 'Cuenta', tr.numero_cuenta||'-'],
                            ['Licencia', tr.tipo_licencia||'-', 'Religión', tr.religion||'-'],
                            ['Sueldo', '$'+(tr.sueldo||'0'), 'Afiliación', tr.fecha_afiliacion||'-']
                        ]
                    }, layout:'lightHorizontalLines'
                },
                { text: 'VIVIENDA', style:'h', margin:[0,10,0,5] },
                {
                    table: {
                        widths: ['*','*','*','*'],
                        body: [
                            ['Tenencia', tr.tipo_vivienda||'-', 'Material', tr.material_vivienda||'-'],
                            ['Cubierta', tr.tipo_cubierta||'-', 'Habitaciones', tr.num_habitaciones||'-'],
                            ['Seguridad', tr.seguridad_sector||'-', 'Servicios', {text:tr.servicios_basicos||'-', fontSize:8}]
                        ]
                    }, layout:'lightHorizontalLines'
                },
                { text: '\n\n' },
                { image: firma||'pixel', width:100, alignment:'center' },
                { text: 'FIRMA TRABAJADOR', alignment:'center', fontSize:9 }
            ],
            images: { pixel: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
            styles: { h: { fontSize:11, bold:true, color:'#00d2ff', fillColor:'#111' } }
        };
        pdfMake.createPdf(doc).download(`Ficha_${tr.nombre}.pdf`);
    };

    async function base64(u){ if(!u)return null; try{const r=await fetch(u);const b=await r.blob();return new Promise(res=>{const f=new FileReader();f.onload=()=>res(f.result);f.readAsDataURL(b)})}catch{return null}}
    function calcEdad(f){ if(!f) return '-'; const h=new Date(); const n=new Date(f); let e=h.getFullYear()-n.getFullYear(); if(h.getMonth()<n.getMonth()) e--; return e+' años'; }

    cargarCargos(supabase);
    listar('ACTIVO','grid-activos');
    listar('PASIVO','grid-pasivos');
    async function cargarCargos(sb){ const { data } = await sb.from('cargos').select('*').order('nombre'); const s=document.getElementById('t-cargo'); s.innerHTML='<option>Seleccione...</option>'; data?.forEach(c=>s.innerHTML+=`<option>${c.nombre}</option>`); }
    document.getElementById('buscador-activos').onkeyup=(e)=>{ const t=e.target.value.toLowerCase(); document.querySelectorAll('#grid-activos .worker-card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(t)?'flex':'none'); }
}
