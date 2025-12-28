// trabajadores.js - Versión Final Corregida

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
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

            <form id="form-trabajador">
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
                         <select id="t-civil"><option value="Soltero">Soltero</option><option value="Casado">Casado</option><option value="Union Libre">Unión Libre</option></select>
                         <select id="t-sangre"><option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="A-">A-</option></select>
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
                    <p style="font-size:0.7em; color:#888; margin-top:5px;">Foto clara en fondo blanco</p>
                </div>

                <div style="margin-top:20px; padding-bottom:60px; display:flex; gap:10px;">
                    <button type="submit" id="btn-guardar" style="background:#00d2ff; color:black;">Guardar Cambios</button>
                    <button type="button" onclick="cambiarVista('activos')" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA ---
    window.toggleDropdown = () => { document.getElementById("dropdown-print").classList.toggle("show"); };
    window.onclick = function(e) {
        if (!e.target.matches('#btn-nombre-trabajador') && !e.target.matches('#btn-nombre-trabajador *')) {
            var drops = document.getElementsByClassName("dropdown-content");
            for (var i = 0; i < drops.length; i++) if (drops[i].classList.contains('show')) drops[i].classList.remove('show');
        }
    }

    window.imprimirDoc = (tipo) => {
        const nombre = document.getElementById('t-nombre').value;
        alert(`Generando ${tipo.toUpperCase()} para: ${nombre}\n(Próximamente PDF)`);
    };

    cargarCargos(supabase);
    listarTrabajadores('ACTIVO');
    listarTrabajadores('PASIVO');

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
        document.querySelectorAll('.vista-seccion').forEach(v => v.style.display = 'none');
        document.getElementById('vista-formulario').style.display = 'block';
    };

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

        const primerNombre = t.nombre.split(' ')[0];
        document.getElementById('lbl-nombre-trab').innerText = primerNombre;
        document.getElementById('tab-trabajador-activo').style.display = 'inline-block';
        document.getElementById('titulo-formulario').innerText = `Ficha: ${t.nombre}`;

        // Llenar datos (Simplificado)
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-cedula').value = t.cedula;
        document.getElementById('t-nombre').value = t.nombre;
        document.getElementById('t-nacimiento').value = t.fecha_nacimiento;
        document.getElementById('t-cargo').value = t.cargo;
        document.getElementById('t-estado').value = t.estado;
        
        // Edad
        if(t.fecha_nacimiento) {
             const hoy = new Date(); const nac = new Date(t.fecha_nacimiento);
             let edad = hoy.getFullYear() - nac.getFullYear();
             if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
             document.getElementById('t-edad').value = edad + ' años';
        }

        document.getElementById('preview-foto').src = t.foto_url || 'https://via.placeholder.com/150?text=FOTO';
        
        if(t.firma_url) {
            document.getElementById('preview-firma').src = t.firma_url;
            document.getElementById('preview-firma').style.display = 'block';
        } else {
            document.getElementById('preview-firma').style.display = 'none';
        }

        // Checkboxes
        document.querySelectorAll('input[name="serv"]').forEach(c => c.checked = false);
        if(t.servicios_basicos) {
            t.servicios_basicos.split(',').forEach(s => {
                const chk = document.querySelector(`input[name="serv"][value="${s}"]`);
                if(chk) chk.checked = true;
            });
        }

        const btnBaja = document.getElementById('btn-dar-baja');
        const btnReac = document.getElementById('btn-reactivar');
        
        if(t.estado === 'ACTIVO') {
            btnBaja.style.display = 'inline-flex'; btnReac.style.display = 'none';
            btnBaja.onclick = () => cambiarEstadoTrabajador(t.id, 'PASIVO', supabase);
        } else {
            btnBaja.style.display = 'none'; btnReac.style.display = 'inline-flex';
            btnReac.onclick = () => cambiarEstadoTrabajador(t.id, 'ACTIVO', supabase);
        }

        document.querySelectorAll('.vista-seccion').forEach(v => v.style.display = 'none');
        document.getElementById('vista-formulario').style.display = 'block';
    }

    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const servicios = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(c => c.value).join(',');
        
        let fotoUrl = null;
        let firmaUrl = null;

        const fileFoto = document.getElementById('t-foto').files[0];
        if(fileFoto) fotoUrl = await subirArchivo(supabase, fileFoto, 'fichas_personal');
        
        const fileFirma = document.getElementById('t-firma').files[0];
        if(fileFirma) firmaUrl = await subirArchivo(supabase, fileFirma, 'fichas_personal');

        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: document.getElementById('t-nombre').value.toUpperCase(),
            fecha_nacimiento: document.getElementById('t-nacimiento').value,
            cargo: document.getElementById('t-cargo').value,
            servicios_basicos: servicios,
            // Agrega los demás campos aquí...
        };
        if(fotoUrl) datos.foto_url = fotoUrl;
        if(firmaUrl) datos.firma_url = firmaUrl;

        let error;
        if(id) {
            const res = await supabase.from('trabajadores').update(datos).eq('id', id); error = res.error;
        } else {
            const res = await supabase.from('trabajadores').insert([datos]); error = res.error;
        }

        if(error) alert("Error: " + error.message);
        else {
            alert("Guardado");
            listarTrabajadores('ACTIVO');
            cambiarVista('activos');
        }
    };

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

    document.getElementById('buscador-activos').onkeyup = (e) => filtrarGrid('grid-activos', e.target.value);
    document.getElementById('buscador-pasivos').onkeyup = (e) => filtrarGrid('grid-pasivos', e.target.value);
}

function filtrarGrid(gridId, texto) {
    const t = texto.toLowerCase();
    document.querySelectorAll(`#${gridId} .worker-card`).forEach(c => {
        c.style.display = c.innerText.toLowerCase().includes(t) ? 'flex' : 'none';
    });
}

async function cambiarEstadoTrabajador(id, nuevoEstado, supabase) {
    if(!confirm(`¿Cambiar a ${nuevoEstado}?`)) return;
    await supabase.from('trabajadores').update({ estado: nuevoEstado }).eq('id', id);
    document.getElementById('tab-activos').click();
}

async function cargarCargos(supabase) {
    const { data } = await supabase.from('cargos').select('*').order('nombre');
    const sel = document.getElementById('t-cargo');
    sel.innerHTML = '<option value="">Seleccione Cargo...</option>';
    data?.forEach(c => sel.innerHTML += `<option>${c.nombre}</option>`);
}

async function subirArchivo(supabase, file, bucket) {
    const name = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const { data, error } = await supabase.storage.from(bucket).upload(name, file);
    if(error) { console.error(error); return null; }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(name);
    return pub.publicUrl;
}
