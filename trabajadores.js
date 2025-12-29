// trabajadores.js - VERSIÓN CORREGIDA (V11)

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
                        <div style="padding:10px; color:#aaa; font-size:0.8em;">DOCUMENTOS</div>
                        <a onclick="imprimirDoc('ficha')"><i class="fas fa-file-pdf" style="color:var(--danger)"></i> Ficha PDF</a>
                        <a onclick="imprimirDoc('ats')"><i class="fas fa-hard-hat" style="color:var(--primary)"></i> Generar ATS</a>
                        <a onclick="imprimirDoc('kardex')"><i class="fas fa-clipboard-list" style="color:var(--success)"></i> Kardex EPP</a>
                        <a onclick="imprimirDoc('induccion')"><i class="fas fa-chalkboard-teacher"></i> Inducción</a>
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

                <div style="background:rgba(255,255,255,0.05); border:1px solid #444; border-radius:15px; padding:15px; display:flex; gap:15px; align-items:center; margin-bottom:20px;">
                    <div style="text-align:center;">
                        <img id="preview-foto" src="" style="width:100px; height:120px; object-fit:cover; border-radius:10px; background:#000;">
                        <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:5px; font-size:0.8em; width:100%;">Foto</button>
                        <input type="file" id="t-foto" hidden accept="image/*">
                    </div>
                    <div style="flex:1;">
                        <input id="t-cedula" placeholder="Cédula" style="margin-bottom:5px;">
                        <input id="t-nombre" placeholder="Nombre Completo" style="margin-bottom:5px;">
                        <div style="display:flex; gap:5px;">
                            <input type="date" id="t-nacimiento">
                            <input id="t-edad" placeholder="Edad" readonly style="width:60px; text-align:center; background:#222;">
                        </div>
                        <select id="t-cargo" style="margin-top:5px;"><option>Cargando cargos...</option></select>
                    </div>
                </div>

                <details open class="seccion-form">
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Datos Personales</summary>
                    <div class="form-grid">
                        <select id="t-sexo"><option>Hombre</option><option>Mujer</option></select>
                        <select id="t-civil"><option>Soltero</option><option>Casado</option><option>Unión Libre</option></select>
                        <select id="t-sangre"><option>O+</option><option>A+</option><option>B+</option><option>AB+</option></select>
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
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Laboral y Banco</summary>
                    <div class="form-grid">
                        <input id="t-profesion" placeholder="Profesión">
                        <input id="t-sueldo" placeholder="Sueldo $">
                        <div><label style="font-size:0.7em">Afiliación IESS</label><input type="date" id="t-afiliacion"></div>
                        <input id="t-banco" placeholder="Banco">
                        <input id="t-cuenta" placeholder="Nº Cuenta">
                    </div>
                </details>

                <details class="seccion-form">
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Vivienda</summary>
                    <div class="form-grid">
                        <input id="t-direccion" placeholder="Dirección" style="grid-column:1/-1">
                        <select id="t-vivienda"><option>Propia</option><option>Arrendada</option><option>Familiar</option></select>
                        <input id="t-material" placeholder="Paredes">
                        <input id="t-cubierta" placeholder="Techo">
                        <input id="t-habitaciones" placeholder="Habitaciones">
                        <input id="t-seguridad" placeholder="Seguridad">
                    </div>
                    <div class="multi-select-box" style="margin-top:10px;">
                        <label>Servicios:</label><br>
                        <label><input type="checkbox" name="serv" value="Luz"> Luz</label>
                        <label><input type="checkbox" name="serv" value="Agua"> Agua</label>
                        <label><input type="checkbox" name="serv" value="Internet"> Internet</label>
                    </div>
                </details>

                <details class="seccion-form">
                    <summary style="font-weight:bold; color:#ccc; margin-bottom:10px;">Emergencia y Tallas</summary>
                    <div class="form-grid">
                        <input id="t-emer-nom" placeholder="Nombre Contacto 1">
                        <input id="t-emer-tel" placeholder="Teléfono">
                        <input id="t-emer2-nom" placeholder="Nombre Contacto 2">
                        <input id="t-emer2-tel" placeholder="Teléfono">
                    </div>
                    <div class="form-grid" style="margin-top:10px;">
                        <input id="t-camisa" placeholder="Camisa">
                        <input id="t-pantalon" placeholder="Pantalón">
                        <input id="t-zapatos" placeholder="Zapatos">
                    </div>
                </details>

                <div class="seccion-form" style="text-align:center;">
                    <h4>Firma</h4>
                    <img id="preview-firma" src="" style="height:60px; display:none; margin:0 auto; background:white; padding:5px;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="background:#444; margin-top:5px;">Subir Firma</button>
                    <input type="file" id="t-firma" hidden accept="image/*">
                </div>

                <div style="margin-top:20px; padding-bottom:80px;">
                    <button type="submit" id="btn-guardar" style="width:100%; margin-bottom:10px;">GUARDAR CAMBIOS</button>
                    
                    <button type="button" id="btn-dar-baja" style="width:100%; background:var(--danger); display:none;" onclick="cambiarEstado('PASIVO')">
                        DAR DE BAJA
                    </button>
                    <button type="button" id="btn-reactivar" style="width:100%; background:var(--success); color:black; display:none;" onclick="cambiarEstado('ACTIVO')">
                        REACTIVAR
                    </button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA ---

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

    window.nuevaFicha = () => {
        // CORRECCION: Reset completo del formulario y limpieza manual de fotos
        const form = document.getElementById('form-trabajador');
        form.reset();
        
        document.getElementById('t-id').value = '';
        document.getElementById('t-estado').value = 'ACTIVO';
        
        // Limpiar imágenes
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150';
        document.getElementById('preview-firma').src = '';
        document.getElementById('preview-firma').style.display = 'none';
        
        // Limpiar inputs de archivo (por si acaso el reset no lo hizo)
        document.getElementById('t-foto').value = '';
        document.getElementById('t-firma').value = '';

        document.getElementById('btn-dar-baja').style.display = 'none';
        document.getElementById('btn-reactivar').style.display = 'none';
        document.getElementById('titulo-ficha').innerText = "Nuevo Ingreso";
        document.getElementById('cont-nombre').style.display = 'none';

        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display = 'block';
    };

    async function listar(estado, gridId, countId) {
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado).order('nombre');
        
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
        // Campos de texto simples
        const fields = ['cedula','nombre','lugar','sexo','civil','sangre','discapacidad','religion','celular','correo','licencia','cargo','profesion','sueldo','afiliacion','banco','cuenta','direccion','vivienda','material','cubierta','habitaciones','seguridad','camisa','pantalon','zapatos'];
        fields.forEach(f => {
            const el = document.getElementById('t-'+f);
            if(el) el.value = t[f.replace('-','_')] || t[f] || '';
        });
        
        // CORRECCION: Carga explicita de la fecha de nacimiento
        // Supabase devuelve 'fecha_nacimiento', el input es 't-nacimiento'
        if(t.fecha_nacimiento) {
            document.getElementById('t-nacimiento').value = t.fecha_nacimiento;
            
            // Calculo de edad
            const h = new Date();
            const n = new Date(t.fecha_nacimiento + 'T00:00:00'); // T00:00:00 para evitar error de zona horaria
            let e = h.getFullYear() - n.getFullYear(); 
            if(h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
            document.getElementById('t-edad').value = e + ' años';
        } else {
            document.getElementById('t-nacimiento').value = '';
            document.getElementById('t-edad').value = '';
        }

        document.getElementById('t-id').value = t.id;
        document.getElementById('t-emer-nom').value = t.emergencia_nombre;
        document.getElementById('t-emer-tel').value = t.emergencia_telefono;
        document.getElementById('t-emer2-nom').value = t.emergencia2_nombre;
        document.getElementById('t-emer2-tel').value = t.emergencia2_telefono;

        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150';
        
        // CORRECCION: Mostrar firma si existe, ocultar si no
        if(t.firma_url) { 
            document.getElementById('preview-firma').src = t.firma_url; 
            document.getElementById('preview-firma').style.display = 'block'; 
        } else {
            document.getElementById('preview-firma').style.display = 'none';
        }

        if(t.estado === 'ACTIVO') {
            document.getElementById('btn-dar-baja').style.display = 'block';
            document.getElementById('btn-reactivar').style.display = 'none';
        } else {
            document.getElementById('btn-dar-baja').style.display = 'none';
            document.getElementById('btn-reactivar').style.display = 'block';
        }

        const primerNombre = t.nombre.split(' ')[0];
        document.getElementById('lbl-nombre-trab').innerText = primerNombre;
        document.getElementById('cont-nombre').style.display = 'inline-flex';
        document.getElementById('titulo-ficha').innerText = `Ficha: ${t.nombre}`;

        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    }

    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const serv = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c=>c.value).join(',');
        
        const fFoto = document.getElementById('t-foto').files[0];
        let fotoUrl = null; if(fFoto) fotoUrl = await subirArchivo(supabase, fFoto, 'fichas_personal');
        
        const fFirma = document.getElementById('t-firma').files[0];
        let firmaUrl = null; if(fFirma) firmaUrl = await subirArchivo(supabase, fFirma, 'fichas_personal');

        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: document.getElementById('t-nombre').value.toUpperCase(),
            fecha_nacimiento: document.getElementById('t-nacimiento').value, // Esto ahora toma correctamente el valor
            cargo: document.getElementById('t-cargo').value,
            celular: document.getElementById('t-celular').value,
            servicios_basicos: serv,
            emergencia_nombre: document.getElementById('t-emer-nom').value,
            emergencia_telefono: document.getElementById('t-emer-tel').value,
            emergencia2_nombre: document.getElementById('t-emer2-nom').value,
            emergencia2_telefono: document.getElementById('t-emer2-tel').value,
            profesion: document.getElementById('t-profesion').value,
            sueldo: document.getElementById('t-sueldo').value,
            direccion: document.getElementById('t-direccion').value,
            lugar_nacimiento: document.getElementById('t-lugar').value,
            sexo: document.getElementById('t-sexo').value,
            estado_civil: document.getElementById('t-civil').value,
            tipo_sangre: document.getElementById('t-sangre').value
        };
        
        // Solo actualizar si hay nueva foto/firma o si es nuevo registro
        if(fotoUrl) datos.foto_url = fotoUrl;
        if(firmaUrl) datos.firma_url = firmaUrl;

        if(id) await supabase.from('trabajadores').update(datos).eq('id',id);
        else await supabase.from('trabajadores').insert([datos]);
        
        alert("Guardado exitosamente");
        recargarListas();
        cambiarVista('activos');
    };

    window.cambiarEstado = async (nuevo) => {
        if(!confirm(`¿Cambiar estado a ${nuevo}?`)) return;
        const id = document.getElementById('t-id').value;
        await supabase.from('trabajadores').update({ estado: nuevo }).eq('id', id);
        recargarListas();
        cambiarVista(nuevo==='ACTIVO'?'activos':'pasivos');
    };

    function recargarListas() {
        listar('ACTIVO', 'grid-activos', 'count-activos');
        listar('PASIVO', 'grid-pasivos', 'count-pasivos');
    }

    const { data: cargos } = await supabase.from('cargos').select('*');
    const sel = document.getElementById('t-cargo');
    cargos?.forEach(c => sel.innerHTML += `<option>${c.nombre}</option>`);

    recargarListas();
    
    const setupPreview = (inputId, imgId) => {
        document.getElementById(inputId).onchange = (e) => {
            if(e.target.files[0]){
                const r = new FileReader();
                r.onload = (ev) => {
                    const img = document.getElementById(imgId);
                    img.src = ev.target.result;
                    img.style.display = 'block'; // Asegurar que se vea al subir
                };
                r.readAsDataURL(e.target.files[0]);
            }
        }
    }
    setupPreview('t-foto', 'preview-foto');
    setupPreview('t-firma', 'preview-firma');
    
    window.imprimirDoc = async (tipo) => {
        if(tipo !== 'ficha') return alert("En construcción");
        const id = document.getElementById('t-id').value;
        const { data: tr } = await supabase.from('trabajadores').select('*').eq('id', id).single();
        const logo = await safeImageLoad(empresa.logo_url);
        const foto = await safeImageLoad(tr.foto_url);

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
                            [{image: foto||'pixel', width:80, rowSpan:6, alignment:'center'}, {text:'Cédula:', bold:true}, tr.cedula||'', {}],
                            ['', {text:'Nombre:', bold:true}, {text:tr.nombre||'', colSpan:2}, {}],
                            ['', {text:'Nacimiento:', bold:true}, tr.fecha_nacimiento||'', {text:'Edad: '+ document.getElementById('t-edad').value}],
                            ['', {text:'Cargo:', bold:true}, {text:tr.cargo||'', colSpan:2}, {}],
                            ['', {text:'Celular:', bold:true}, tr.celular||'', {text:'Sangre: '+(tr.tipo_sangre||'')}]
                        ]
                    }
                }
            ],
            images: { pixel: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }
        };
        pdfMake.createPdf(doc).download(`Ficha_${tr.nombre}.pdf`);
    };
    
    async function safeImageLoad(url) { if (!url) return null; try { const r = await fetch(url); const b = await r.blob(); return new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); }); } catch { return null; } }
    async function subirArchivo(sb, file, bucket) { const n = Date.now()+'_'+file.name.replace(/\W/g,''); const {error}=await sb.storage.from(bucket).upload(n,file); if(error)return null; return sb.storage.from(bucket).getPublicUrl(n).data.publicUrl; }
    
    document.getElementById('bus-act').onkeyup = (e) => filtrarGrid('grid-activos', e.target.value);
    document.getElementById('bus-pas').onkeyup = (e) => filtrarGrid('grid-pasivos', e.target.value);
    
    function filtrarGrid(gridId, texto) {
        const t = texto.toLowerCase();
        document.querySelectorAll(`#${gridId} .worker-card`).forEach(c => c.style.display = c.innerText.toLowerCase().includes(t) ? 'flex' : 'none');
    }
}
