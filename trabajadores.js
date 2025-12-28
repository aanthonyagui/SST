// trabajadores.js - MÓDULO DE FICHA SOCIOECONÓMICA COMPLETA

export async function cargarModuloTrabajadores(contenedor, supabase, empresa) {
    // 1. ESTRUCTURA HTML CON PESTAÑAS Y FORMULARIO COMPLETO
    contenedor.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="margin:0;"><i class="fas fa-users"></i> Nómina: ${empresa.nombre}</h2>
            <button id="btn-nuevo-t" style="background:#2ecc71; padding:10px 20px;">
                <i class="fas fa-user-plus"></i> Nueva Ficha
            </button>
        </div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin-bottom:20px;">

        <div id="vista-lista-t">
            <input type="text" id="buscador-t" placeholder="Buscar por nombre o cédula..." style="margin-bottom:15px;">
            <div id="grid-trabajadores" class="worker-grid">Cargando personal...</div>
        </div>

        <div id="vista-form-t" style="display:none; background:rgba(0,0,0,0.4); padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.1); max-height:80vh; overflow-y:auto;">
            <h3 style="color:#00d2ff; text-align:center; margin-top:0;">FICHA SOCIOECONÓMICA</h3>
            
            <form id="form-trabajador">
                
                <div style="display:flex; gap:20px; align-items:flex-start; margin-bottom:20px;">
                    <div style="text-align:center; width:120px;">
                        <img id="preview-foto" src="https://via.placeholder.com/100?text=FOTO" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border:2px solid #555;">
                        <button type="button" onclick="document.getElementById('t-foto').click()" style="font-size:0.8em; margin-top:5px; background:#444;">Subir Foto</button>
                        <input type="file" id="t-foto" accept="image/*" style="display:none;">
                    </div>
                    <div style="flex:1;">
                        <div class="form-grid">
                            <input type="text" id="t-cedula" placeholder="Cédula (Única)" required>
                            <input type="text" id="t-nombre" placeholder="Nombres y Apellidos" required>
                            <input type="date" id="t-nacimiento" title="Fecha Nacimiento">
                            <input type="text" id="t-nacionalidad" placeholder="Nacionalidad (ej: Ecuatoriana)">
                        </div>
                        <div class="form-grid" style="margin-top:10px;">
                            <select id="t-sexo"><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option></select>
                            <select id="t-civil"><option value="Soltero">Soltero(a)</option><option value="Casado">Casado(a)</option><option value="Unión Libre">Unión Libre</option></select>
                            <input type="text" id="t-sangre" placeholder="Tipo Sangre (ej: A+)">
                            <input type="number" id="t-edad" placeholder="Edad">
                        </div>
                    </div>
                </div>

                <h4 style="border-bottom:1px solid #555; padding-bottom:5px; margin-top:20px;">DATOS LABORALES Y CONTACTO</h4>
                <div class="form-grid">
                    <input type="text" id="t-cargo" placeholder="Cargo (ej: Asistente SST)" required>
                    <input type="text" id="t-profesion" placeholder="Profesión / Título">
                    <input type="text" id="t-celular" placeholder="Celular">
                    <input type="email" id="t-correo" placeholder="Correo Electrónico">
                    <input type="text" id="t-direccion" placeholder="Dirección Domiciliaria" style="grid-column: span 2;">
                </div>

                <h4 style="border-bottom:1px solid #555; padding-bottom:5px; margin-top:20px;">VIVIENDA Y TALLAS</h4>
                <div class="form-grid">
                    <select id="t-vivienda">
                        <option value="">Tipo Vivienda</option>
                        <option value="Propia">Propia</option>
                        <option value="Arrendada">Arrendada</option>
                        <option value="Familiar">Familiar</option>
                    </select>
                    <input type="text" id="t-servicios" placeholder="Servicios (ej: Luz, Agua, Internet)">
                    <input type="text" id="t-camisa" placeholder="Talla Camisa (S, M, L)">
                    <input type="text" id="t-pantalon" placeholder="Talla Pantalón (ej: 32)">
                    <input type="text" id="t-zapatos" placeholder="Talla Zapatos (ej: 40)">
                </div>

                <h4 style="border-bottom:1px solid #555; padding-bottom:5px; margin-top:20px;">EN CASO DE EMERGENCIA</h4>
                <div class="form-grid">
                    <input type="text" id="t-emer-nombre" placeholder="Nombre Contacto">
                    <input type="text" id="t-emer-paren" placeholder="Parentesco (ej: Madre)">
                    <input type="text" id="t-emer-tel" placeholder="Teléfono Emergencia">
                </div>

                <h4 style="border-bottom:1px solid #555; padding-bottom:5px; margin-top:20px;">FIRMA DEL TRABAJADOR</h4>
                <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:10px; text-align:center;">
                    <p style="font-size:0.8em; color:#ccc;">Suba una foto clara de la firma</p>
                    <img id="preview-firma" src="" style="max-height:80px; display:none; margin:0 auto 10px auto; border:1px dashed #555;">
                    <button type="button" onclick="document.getElementById('t-firma').click()" style="background:#555;">
                        <i class="fas fa-signature"></i> Cargar Firma
                    </button>
                    <input type="file" id="t-firma" accept="image/*" style="display:none;">
                </div>

                <div style="margin-top:30px; display:flex; gap:10px; position:sticky; bottom:0; background:#1e1e1e; padding:10px; border-top:1px solid #333;">
                    <button type="submit" id="btn-guardar-ficha" style="background:#00d2ff; color:black; font-weight:bold;">
                        <i class="fas fa-save"></i> Guardar Ficha
                    </button>
                    <button type="button" id="btn-cancelar-t" style="background:#555;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    // 2. PREVISUALIZACIÓN DE IMÁGENES
    const setupPreview = (inputId, imgId) => {
        document.getElementById(inputId).onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = document.getElementById(imgId);
                    img.src = ev.target.result;
                    img.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };
    };
    setupPreview('t-foto', 'preview-foto');
    setupPreview('t-firma', 'preview-firma');

    // 3. LOGICA DE NAVEGACIÓN
    const btnNuevo = document.getElementById('btn-nuevo-t');
    const vistaLista = document.getElementById('vista-lista-t');
    const vistaForm = document.getElementById('vista-form-t');

    btnNuevo.onclick = () => {
        vistaLista.style.display = 'none';
        vistaForm.style.display = 'block';
        btnNuevo.style.display = 'none';
        document.getElementById('form-trabajador').reset();
        document.getElementById('preview-foto').src = 'https://via.placeholder.com/100?text=FOTO';
        document.getElementById('preview-firma').style.display = 'none';
    };

    document.getElementById('btn-cancelar-t').onclick = () => {
        vistaForm.style.display = 'none';
        vistaLista.style.display = 'block';
        btnNuevo.style.display = 'block';
    };

    // 4. GUARDAR DATOS (SUBMIT)
    document.getElementById('form-trabajador').onsubmit = async (e) => {
        e.preventDefault();
        const btnGuardar = document.getElementById('btn-guardar-ficha');
        const cedula = document.getElementById('t-cedula').value.trim();
        
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        // A. VALIDACIÓN DE DUPLICADOS
        const { data: existe } = await supabase
            .from('trabajadores')
            .select('id')
            .eq('cedula', cedula)
            .eq('empresa_id', empresa.id); // Busca en la misma empresa

        if (existe && existe.length > 0) {
            alert(`⚠️ ALERTA: La cédula ${cedula} ya está registrada en esta empresa.`);
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Ficha';
            return;
        }

        try {
            // B. SUBIDA DE IMÁGENES
            let fotoUrl = null;
            let firmaUrl = null;

            const fotoFile = document.getElementById('t-foto').files[0];
            const firmaFile = document.getElementById('t-firma').files[0];

            if (fotoFile) fotoUrl = await subirArchivo(supabase, fotoFile, 'fichas_personal');
            if (firmaFile) firmaUrl = await subirArchivo(supabase, firmaFile, 'fichas_personal');

            // C. OBJETO DE DATOS (Mapeo completo)
            const datos = {
                empresa_id: empresa.id,
                cedula: cedula,
                nombre: document.getElementById('t-nombre').value.toUpperCase(),
                fecha_nacimiento: document.getElementById('t-nacimiento').value || null,
                nacionalidad: document.getElementById('t-nacionalidad').value,
                estado_civil: document.getElementById('t-civil').value,
                tipo_sangre: document.getElementById('t-sangre').value,
                edad: document.getElementById('t-edad').value,
                
                cargo: document.getElementById('t-cargo').value.toUpperCase(),
                profesion: document.getElementById('t-profesion').value.toUpperCase(),
                celular: document.getElementById('t-celular').value,
                correo: document.getElementById('t-correo').value.toLowerCase(),
                direccion: document.getElementById('t-direccion').value.toUpperCase(),
                
                tipo_vivienda: document.getElementById('t-vivienda').value,
                servicios_basicos: document.getElementById('t-servicios').value,
                talla_camisa: document.getElementById('t-camisa').value,
                talla_pantalon: document.getElementById('t-pantalon').value,
                talla_zapatos: document.getElementById('t-zapatos').value,
                
                emergencia_nombre: document.getElementById('t-emer-nombre').value.toUpperCase(),
                emergencia_parentesco: document.getElementById('t-emer-paren').value.toUpperCase(),
                emergencia_telefono: document.getElementById('t-emer-tel').value,
                
                foto_url: fotoUrl,
                firma_url: firmaUrl
            };

            // D. INSERTAR EN BD
            const { error } = await supabase.from('trabajadores').insert([datos]);

            if (error) throw error;

            alert("✅ Ficha Socioeconómica guardada correctamente.");
            document.getElementById('btn-cancelar-t').click();
            cargarLista(supabase, empresa.id);

        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Ficha';
        }
    };

    // 5. BUSCADOR EN TIEMPO REAL
    document.getElementById('buscador-t').onkeyup = (e) => {
        const termino = e.target.value.toLowerCase();
        const tarjetas = document.querySelectorAll('.worker-card');
        tarjetas.forEach(card => {
            const texto = card.innerText.toLowerCase();
            card.style.display = texto.includes(termino) ? 'flex' : 'none';
        });
    };

    cargarLista(supabase, empresa.id);
}

// FUNCIONES AUXILIARES

async function subirArchivo(supabase, file, bucket) {
    const nombreArchivo = `${Date.now()}_${file.name.replace(/\s/g, '')}`;
    const { error } = await supabase.storage.from(bucket).upload(nombreArchivo, file);
    if (error) throw error;
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(nombreArchivo);
    return data.publicUrl;
}

async function cargarLista(supabase, idEmpresa) {
    const grid = document.getElementById('grid-trabajadores');
    const { data } = await supabase
        .from('trabajadores')
        .select('id, nombre, cargo, cedula, foto_url, tipo_sangre')
        .eq('empresa_id', idEmpresa)
        .order('nombre', { ascending: true });
    
    grid.innerHTML = '';
    if (!data || data.length === 0) {
        grid.innerHTML = '<p style="text-align:center; opacity:0.6;">No hay registros. Crea la primera ficha.</p>';
        return;
    }

    data.forEach(t => {
        const card = document.createElement('div');
        card.className = 'worker-card';
        // Usamos la foto subida o una por defecto
        const avatarImg = t.foto_url 
            ? `<img src="${t.foto_url}" style="width:100%; height:100%; object-fit:cover;">` 
            : t.nombre.charAt(0);

        card.innerHTML = `
            <div class="w-avatar" style="overflow:hidden; background:${t.foto_url ? 'transparent' : 'var(--primary)'}">
                ${avatarImg}
            </div>
            <div style="flex:1;">
                <h4 style="margin:0; color:white;">${t.nombre}</h4>
                <small style="color:#ccc; display:block;">${t.cargo}</small>
                <small style="color:#00d2ff; font-size:0.8em;">CC: ${t.cedula} | ${t.tipo_sangre || '-'}</small>
            </div>
        `;
        // Al hacer clic podrías programar abrir la ficha para editar (futura mejora)
        grid.appendChild(card);
    });
}
