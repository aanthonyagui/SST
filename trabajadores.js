// trabajadores.js - MÓDULO FINAL V6

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina</h2>
            <div id="tab-container" style="display:flex; gap:5px; margin-top:10px; align-items:center;">
                <button class="tab-btn active" onclick="cambiarVista('activos')">
                    <i class="fas fa-user-check"></i> <span class="desktop-text">Activos</span>
                    <span id="count-activos" class="badge">0</span>
                </button>
                <button class="tab-btn" onclick="cambiarVista('pasivos')">
                    <i class="fas fa-user-times"></i> <span class="desktop-text">Pasivos</span>
                </button>
                <button class="tab-btn" onclick="nuevaFicha()">
                    <i class="fas fa-plus"></i> <span class="desktop-text">Nuevo</span>
                </button>
                
                <div class="dropdown" id="dropdown-trabajador" style="display:none;">
                    <button class="tab-btn active" style="border-color:#f1c40f; color:#f1c40f;" onclick="toggleDrop()">
                        <i class="fas fa-user-cog"></i> <span id="lbl-nombre">NOMBRE</span>
                    </button>
                    <div id="drop-content" class="dropdown-content">
                        <a onclick="imprimirDoc('ficha')">Descargar Ficha PDF</a>
                        <a onclick="alert('ATS en construcción')">Generar ATS</a>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid #444; margin:10px 0;">

        <div id="vista-activos">
            <input type="text" id="bus-act" placeholder="Buscar..." style="width:100%;">
            <div id="grid-activos" class="worker-grid" style="margin-top:10px;">Cargando...</div>
        </div>
        
        <div id="vista-pasivos" style="display:none;">
            <div id="grid-pasivos" class="worker-grid" style="margin-top:10px;"></div>
        </div>

        <div id="vista-formulario" style="display:none;">
            <form id="form-trabajador">
                <input type="hidden" id="t-id"><input type="hidden" id="t-estado" value="ACTIVO">
                
                <div class="seccion-form">
                    <div style="text-align:center;">
                        <img id="preview-foto" src="" class="w-avatar" style="width:100px; height:100px; margin:0 auto;">
                        <br><button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small" style="margin-top:5px;">Foto</button>
                        <input type="file" id="t-foto" hidden>
                    </div>
                    <div class="form-grid" style="margin-top:10px;">
                        <input type="text" id="t-cedula" placeholder="Cédula" required>
                        <input type="text" id="t-nombre" placeholder="Nombre Completo" required>
                        <input type="date" id="t-nac" required>
                        <input type="text" id="t-cargo" placeholder="Cargo">
                    </div>
                </div>

                <details class="seccion-form"><summary>Datos Personales</summary>
                    <div class="form-grid">
                        <input type="text" id="t-celular" placeholder="Celular">
                        <input type="text" id="t-direccion" placeholder="Dirección">
                        <select id="t-sangre"><option>O+</option><option>A+</option></select>
                    </div>
                </details>
                
                <div class="seccion-form" style="text-align:center;">
                    <h4>Firma</h4>
                    <img id="preview-firma" src="" style="height:50px; display:none; margin:0 auto;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="margin:5px auto;">Subir Firma</button>
                    <input type="file" id="t-firma" hidden>
                </div>

                <div style="display:flex; gap:10px; margin-bottom:50px;">
                    <button type="submit">Guardar</button>
                    <button type="button" onclick="cambiarVista('activos')" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // --- LOGICA ---
    window.toggleDrop = () => document.getElementById('drop-content').classList.toggle('show');
    window.cambiarVista = (v) => {
        ['vista-activos','vista-pasivos','vista-formulario'].forEach(id=>document.getElementById(id).style.display='none');
        if(v==='activos') document.getElementById('vista-activos').style.display='block';
        if(v==='pasivos') document.getElementById('vista-pasivos').style.display='block';
        if(v!=='form') document.getElementById('dropdown-trabajador').style.display='none';
    };

    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value='';
        document.getElementById('preview-foto').src='';
        document.getElementById('preview-firma').style.display='none';
        cambiarVista('xxx'); // Ocultar otros
        document.getElementById('vista-formulario').style.display='block';
    };

    async function listar(estado, gridId) {
        const { data } = await supabase.from('trabajadores').select('*').eq('empresa_id', empresa.id).eq('estado', estado);
        const grid = document.getElementById(gridId); grid.innerHTML='';
        if(estado==='ACTIVO') document.getElementById('count-activos').innerText = data?.length||0;
        
        data?.forEach(t=>{
            const d = document.createElement('div'); d.className='worker-card';
            d.innerHTML=`<div class="w-avatar">${t.nombre[0]}</div><div><b>${t.nombre}</b><br><small>${t.cargo}</small></div>`;
            d.onclick = ()=>abrir(t);
            grid.appendChild(d);
        });
    }

    function abrir(t) {
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-cedula').value = t.cedula;
        document.getElementById('t-nombre').value = t.nombre;
        document.getElementById('t-nac').value = t.fecha_nacimiento;
        document.getElementById('t-cargo').value = t.cargo;
        document.getElementById('t-celular').value = t.celular;
        document.getElementById('t-direccion').value = t.direccion;
        
        document.getElementById('preview-foto').src = t.foto_url || '';
        if(t.firma_url) {
             document.getElementById('preview-firma').src = t.firma_url;
             document.getElementById('preview-firma').style.display='block';
        }

        document.getElementById('lbl-nombre').innerText = t.nombre.split(' ')[0];
        document.getElementById('dropdown-trabajador').style.display='block';
        
        cambiarVista('xxx');
        document.getElementById('vista-formulario').style.display='block';
    }

    // GUARDAR
    document.getElementById('form-trabajador').onsubmit = async(e)=>{
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: document.getElementById('t-nombre').value,
            fecha_nacimiento: document.getElementById('t-nac').value,
            cargo: document.getElementById('t-cargo').value,
            celular: document.getElementById('t-celular').value,
            direccion: document.getElementById('t-direccion').value
        };
        
        // Subida de archivos (Simplificada)
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
        const { data } = supabase.storage.from('fichas_personal').getPublicUrl(name);
        return data.publicUrl;
    }

    // IMPRIMIR PDF (Versión Segura)
    window.imprimirDoc = async (tipo) => {
        const id = document.getElementById('t-id').value;
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id',id).single();
        
        // Carga segura de imagenes
        const logo = await safeImg(empresa.logo_url);
        const foto = await safeImg(t.foto_url);
        const firma = await safeImg(t.firma_url);

        const doc = {
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
                        widths: [100, '*'],
                        body: [
                            [{image: foto||'pixel', width:80, rowSpan:3}, {text: 'Nombre: '+t.nombre}],
                            ['', {text: 'Cédula: '+t.cedula}],
                            ['', {text: 'Cargo: '+t.cargo}],
                            [{text:'Celular: '+(t.celular||''), colSpan:2}, {}],
                            [{text:'Dirección: '+(t.direccion||''), colSpan:2}, {}]
                        ]
                    }
                },
                { text: '\n\n' },
                { image: firma||'pixel', width:100, alignment:'center' },
                { text: 'FIRMA DEL TRABAJADOR', alignment:'center', fontSize:10 }
            ],
            images: { pixel: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }
        };
        pdfMake.createPdf(doc).download('Ficha.pdf');
    };

    async function safeImg(url) {
        if(!url) return null;
        try {
            const r = await fetch(url);
            const b = await r.blob();
            return new Promise(r=> {const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(b)});
        } catch { return null; }
    }

    listar('ACTIVO','grid-activos');
}
