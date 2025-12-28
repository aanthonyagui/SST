// trabajadores.js - VERSIÓN PRO V2

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // 1. ESTRUCTURA HTML (Sistema de Pestañas)
    contenedor.innerHTML = `
        <div class="header-tools">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            <div id="tab-container" style="display:flex; gap:5px; margin-top:10px;">
                <button class="tab-btn active" onclick="cambiarTab('lista')"><i class="fas fa-list"></i> Lista</button>
                <button class="tab-btn" id="btn-nueva-ficha" onclick="nuevaFicha()"><i class="fas fa-plus"></i> Nueva Ficha</button>
                <div id="tab-trabajador-activo" style="display:none;"></div>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin:15px 0;">

        <div id="vista-lista" class="vista-activa">
            <input type="text" id="buscador-t" placeholder="Buscar por nombre o cédula..." style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:none;">
            <div id="grid-trabajadores" class="worker-grid">Cargando...</div>
        </div>

        <div id="vista-formulario" style="display:none;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <h3 style="color:#00d2ff; margin:0;" id="titulo-formulario">Nueva Ficha Socioeconómica</h3>
                <button id="btn-imprimir" style="background:#e74c3c; display:none;"><i class="fas fa-file-pdf"></i> Imprimir Ficha</button>
            </div>

            <form id="form-trabajador" class="form-scroll">
                <input type="hidden" id="t-id"> <div class="seccion-form">
                    <h4><i class="fas fa-id-card"></i> Información Básica</h4>
                    <div style="display:flex; gap:20px;">
                        <div style="text-align:center;">
                            <img id="preview-foto" src="https://via.placeholder.com/150?text=FOTO" class="foto-perfil">
                            <input type="file" id="t-foto" accept="image/*" style="display:none;">
                            <button type="button" onclick="document.getElementById('t-foto').click()" class="btn-small">Subir Foto</button>
                        </div>
                        <div class="form-grid">
                            <input type="text" id="t-cedula" placeholder="Cédula" required maxlength="10">
                            <input type="text" id="t-nombre" placeholder="Nombres Completos" required>
                            <div>
                                <label style="font-size:0.8em;">Fecha Nacimiento</label>
                                <input type="date" id="t-nacimiento" required>
                            </div>
                            <input type="text" id="t-edad" placeholder="Edad" readonly style="background:rgba(0,0,0,0.5); cursor:not-allowed;">
                            
                            <select id="t-sexo">
                                <option value="">Sexo</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                            </select>
                            
                            <select id="t-civil">
                                <option value="">Estado Civil</option>
                                <option value="Soltero">Soltero(a)</option>
                                <option value="Casado">Casado(a)</option>
                                <option value="Union Libre">Unión Libre</option>
                                <option value="Viudo">Viudo(a)</option>
                                <option value="Divorciado">Divorciado(a)</option>
                            </select>

                            <select id="t-sangre">
                                <option value="">Tipo Sangre</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            </select>

                            <input type="text" id="t-nacionalidad" placeholder="Nacionalidad" value="ECUATORIANA">
                        </div>
                    </div>
                </div>

                <div class="seccion-form">
                    <h4><i class="fas fa-briefcase"></i> Datos Laborales</h4>
                    <div class="form-grid">
                        <select id="t-cargo" required>
                            <option value="">Cargando cargos...</option>
                        </select>
                        <input type="text" id="t-profesion" placeholder="Profesión / Título">
                        <input type="email" id="t-correo" placeholder="Correo Electrónico">
                        <input type="text" id="t-celular" placeholder="Celular">
                        <input type="text" id="t-direccion" placeholder="Dirección Domiciliaria" style="grid-column: span 2;">
                    </div>
                </div>

                <div class="seccion-form">
                    <h4><i class="fas fa-home"></i> Vivienda y Servicios</h4>
                    <div class="form-grid">
                        <select id="t-vivienda">
                            <option value="">Tenencia Vivienda</option>
                            <option value="Propia">Propia</option>
                            <option value="Arrendada">Arrendada</option>
                            <option value="Familiar">Familiar</option>
                        </select>
                        
                        <div class="multi-select-box">
                            <label>Servicios Básicos:</label><br>
                            <label><input type="checkbox" name="serv" value="Luz"> Luz</label>
                            <label><input type="checkbox" name="serv" value="Agua"> Agua</label>
                            <label><input type="checkbox" name="serv" value="Internet"> Internet</label>
                            <label><input type="checkbox" name="serv" value="Teléfono"> Teléfono</label>
                            <label><input type="checkbox" name="serv" value="TV Cable"> TV Cable</label>
                            <label><input type="checkbox" name="serv" value="Alcantarillado"> Alcantarillado</label>
                        </div>
                    </div>
                </div>

                 <div class="seccion-form">
                    <h4><i class="fas fa-tshirt"></i> Tallas</h4>
                    <div class="form-grid" style="grid-template-columns: repeat(3, 1fr);">
                        <input type="text" id="t-camisa" placeholder="Camisa (S,M,L)">
                        <input type="text" id="t-pantalon" placeholder="Pantalón (ej: 32)">
                        <input type="text" id="t-zapatos" placeholder="Zapatos (ej: 40)">
                    </div>
                </div>

                <div class="seccion-form">
                    <h4><i class="fas fa-ambulance"></i> En Caso de Emergencia</h4>
                    <p style="font-size:0.9em; color:#aaa;">Contacto 1</p>
                    <div class="form-grid">
                        <input type="text" id="t-emer-nom" placeholder="Nombre Contacto 1">
                        <input type="text" id="t-emer-par" placeholder="Parentesco">
                        <input type="text" id="t-emer-tel" placeholder="Teléfono">
                    </div>
                    <hr style="border-color:#444;">
                    <p style="font-size:0.9em; color:#aaa;">Contacto 2 (Opcional)</p>
                    <div class="form-grid">
                        <input type="text" id="t-emer2-nom" placeholder="Nombre Contacto 2">
                        <input type="text" id="t-emer2-par" placeholder="Parentesco">
                        <input type="text" id="t-emer2-tel" placeholder="Teléfono">
                    </div>
                </div>

                <div class="seccion-form" style="text-align:center;">
                    <h4>Firma del Trabajador</h4>
                    <img id="preview-firma" src="" style="display:none; height:80px; margin:0 auto; border:1px dashed #666;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" class="btn-small" style="margin-top:10px;">Cargar Firma</button>
                    <input type="file" id="t-firma" accept="image/*" style="display:none;">
                </div>

                <div style="position:sticky; bottom:0; background:#222; padding:15px; border-top:1px solid #444; display:flex; gap:10px;">
                    <button type="submit" id="btn-guardar" style="background:#00d2ff; color:black;">Guardar Ficha</button>
                    <button type="button" onclick="cambiarTab('lista')" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA DE NEGOCIO ---

    // 1. Cargar lista de Cargos desde BD
    async function cargarCargos() {
        const { data } = await supabase.from('cargos').select('*').order('nombre');
        const select = document.getElementById('t-cargo');
        select.innerHTML = '<option value="">Seleccione Cargo...</option>';
        data?.forEach(c => {
            select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });
    }
    cargarCargos();

    // 2. Cálculo Automático de Edad
    document.getElementById('t-nacimiento').addEventListener('change', function() {
        const fechaNac = new Date(this.value);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        document.getElementById('t-edad').value = isNaN(edad) ? '' : edad + ' años';
    });

    // 3. Previsualización de Imágenes
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

    // 4. Gestión de Pestañas
    window.cambiarTab = (tab) => {
        document.getElementById('vista-lista').style.display = 'none';
        document.getElementById('vista-formulario').style.display = 'none';
        
        if(tab === 'lista') document.getElementById('vista-lista').style.display = 'block';
        if(tab === 'formulario') document.getElementById('vista-formulario').style.display = 'block';
    };

    window.nuevaFicha = () => {
        document.getElementById('form-trabajador').reset();
        document.getElementById('t-id').value = ''; // Limpiar ID
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/150?text=FOTO';
        document.getElementById('preview-firma').style.display = 'none';
        document.getElementById('titulo-formulario').innerText = "Nueva Ficha Socioeconómica";
        document.getElementById('btn-imprimir').style.display = 'none';
        
        // Limpiar checkboxes
        document.querySelectorAll('input[name="serv"]').forEach(c => c.checked = false);
        
        cambiarTab('formulario');
    };

    // 5. Cargar Lista de Trabajadores
    async function listarTrabajadores() {
        const grid = document.getElementById('grid-trabajadores');
        const { data } = await supabase.from('trabajadores')
            .select('id, nombre, cargo, cedula, foto_url')
            .eq('empresa_id', empresa.id);
        
        grid.innerHTML = '';
        data?.forEach(t => {
            const div = document.createElement('div');
            div.className = 'worker-card';
            div.innerHTML = `
                <div class="w-avatar">
                    ${t.foto_url ? `<img src="${t.foto_url}" style="width:100%; height:100%; object-fit:cover;">` : t.nombre.charAt(0)}
                </div>
                <div style="flex:1;">
                    <h4>${t.nombre}</h4>
                    <small>${t.cargo} | ${t.cedula}</small>
                </div>
            `;
            // AL HACER CLIC: Abrir Pestaña de Edición
            div.onclick = () => abrirFichaTrabajador(t.id);
            grid.appendChild(div);
        });
    }
    listarTrabajadores();

    // 6. ABRIR FICHA EXISTENTE (Lógica de Edición y Pestaña)
    async function abrirFichaTrabajador(id) {
        const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
        if(!t) return;

        // Crear pestaña temporal visual
        const tabActivo = document.getElementById('tab-trabajador-activo');
        tabActivo.innerHTML = `<button class="tab-btn active"><i class="fas fa-user-edit"></i> ${t.nombre.split(' ')[0]}</button>`;
        tabActivo.style.display = 'block';

        // Llenar formulario
        document.getElementById('t-id').value = t.id;
        document.getElementById('t-cedula').value = t.cedula;
        document.getElementById('t-nombre').value = t.nombre;
        document.getElementById('t-nacimiento').value = t.fecha_nacimiento;
        document.getElementById('t-nacimiento').dispatchEvent(new Event('change')); // Calcular edad
        document.getElementById('t-sexo').value = t.sexo || ''; // Asegúrate de tener esta columna en BD si no falla
        document.getElementById('t-civil').value = t.estado_civil;
        document.getElementById('t-sangre').value = t.tipo_sangre;
        document.getElementById('t-cargo').value = t.cargo;
        document.getElementById('t-profesion').value = t.profesion;
        document.getElementById('t-correo').value = t.correo;
        document.getElementById('t-celular').value = t.celular;
        document.getElementById('t-direccion').value = t.direccion;
        document.getElementById('t-vivienda').value = t.tipo_vivienda;
        
        // Checkboxes Servicios (Separados por comas)
        if(t.servicios_basicos) {
            const servs = t.servicios_basicos.split(',');
            document.querySelectorAll('input[name="serv"]').forEach(chk => {
                chk.checked = servs.includes(chk.value);
            });
        }

        // Tallas y Emergencia
        document.getElementById('t-camisa').value = t.talla_camisa;
        document.getElementById('t-pantalon').value = t.talla_pantalon;
        document.getElementById('t-zapatos').value = t.talla_zapatos;
        
        document.getElementById('t-emer-nom').value = t.emergencia_nombre;
        document.getElementById('t-emer-par').value = t.emergencia_parentesco;
        document.getElementById('t-emer-tel').value = t.emergencia_telefono;
        
        document.getElementById('t-emer2-nom').value = t.emergencia2_nombre || '';
        document.getElementById('t-emer2-par').value = t.emergencia2_parentesco || '';
        document.getElementById('t-emer2-tel').value = t.emergencia2_telefono || '';

        // Fotos
        if(t.foto_url) document.getElementById('preview-foto').src = t.foto_url;
        if(t.firma_url) {
            const imgFirma = document.getElementById('preview-firma');
            imgFirma.src = t.firma_url;
            imgFirma.style.display = 'block';
        }

        document.getElementById('titulo-formulario').innerText = "Editando Ficha";
        document.getElementById('btn-imprimir').style.display = 'block';
        
        // Acción del botón imprimir
        document.getElementById('btn-imprimir').onclick = () => {
            alert("Generando PDF para " + t.nombre + " (Próximamente)");
            // Aquí llamaremos a la función de generación de PDF
        };

        cambiarTab('formulario');
    }

    // 7. GUARDAR (INSERT O UPDATE)
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const servicios = Array.from(document.querySelectorAll('input[name="serv"]:checked')).map(cb => cb.value).join(',');

        let fotoUrl = null;
        let firmaUrl = null;

        // Subir Archivos si existen nuevos
        const fotoFile = document.getElementById('t-foto').files[0];
        if(fotoFile) fotoUrl = await subirArchivo(supabase, fotoFile, 'fichas_personal');
        
        const firmaFile = document.getElementById('t-firma').files[0];
        if(firmaFile) firmaUrl = await subirArchivo(supabase, firmaFile, 'fichas_personal');

        const datos = {
            empresa_id: empresa.id,
            cedula: document.getElementById('t-cedula').value,
            nombre: document.getElementById('t-nombre').value.toUpperCase(),
            fecha_nacimiento: document.getElementById('t-nacimiento').value,
            estado_civil: document.getElementById('t-civil').value,
            tipo_sangre: document.getElementById('t-sangre').value,
            cargo: document.getElementById('t-cargo').value,
            profesion: document.getElementById('t-profesion').value.toUpperCase(),
            celular: document.getElementById('t-celular').value,
            correo: document.getElementById('t-correo').value,
            direccion: document.getElementById('t-direccion').value.toUpperCase(),
            tipo_vivienda: document.getElementById('t-vivienda').value,
            servicios_basicos: servicios,
            talla_camisa: document.getElementById('t-camisa').value,
            talla_pantalon: document.getElementById('t-pantalon').value,
            talla_zapatos: document.getElementById('t-zapatos').value,
            emergencia_nombre: document.getElementById('t-emer-nom').value.toUpperCase(),
            emergencia_parentesco: document.getElementById('t-emer-par').value.toUpperCase(),
            emergencia_telefono: document.getElementById('t-emer-tel').value,
            emergencia2_nombre: document.getElementById('t-emer2-nom').value.toUpperCase(),
            emergencia2_parentesco: document.getElementById('t-emer2-par').value.toUpperCase(),
            emergencia2_telefono: document.getElementById('t-emer2-tel').value,
        };

        if(fotoUrl) datos.foto_url = fotoUrl;
        if(firmaUrl) datos.firma_url = firmaUrl;

        let error;
        if(id) {
            // UPDATE
            const res = await supabase.from('trabajadores').update(datos).eq('id', id);
            error = res.error;
        } else {
            // INSERT (Validar duplicado)
            const { data: existe } = await supabase.from('trabajadores').select('id').eq('cedula', datos.cedula).eq('empresa_id', empresa.id);
            if(existe && existe.length > 0) return alert("Cédula ya registrada.");
            
            const res = await supabase.from('trabajadores').insert([datos]);
            error = res.error;
        }

        if(error) alert("Error: " + error.message);
        else {
            alert("Guardado correctamente");
            listarTrabajadores();
            cambiarTab('lista');
        }
    };
}

// Función Auxiliar Subida
async function subirArchivo(supabase, file, bucket) {
    const name = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const { error } = await supabase.storage.from(bucket).upload(name, file);
    if(error) { console.error(error); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(name);
    return data.publicUrl;
}
