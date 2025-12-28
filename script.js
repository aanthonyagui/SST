// ... (Mantén el inicio del script, Supabase y Partículas igual) ...

// Abrir el modal de nueva empresa
document.getElementById('admin-add-company').onclick = () => {
    document.getElementById('modal-empresa').style.display = 'flex';
};

function cerrarModalEmpresa() {
    document.getElementById('modal-empresa').style.display = 'none';
}

// Función principal para guardar
async function guardarEmpresaCompleta() {
    const nombre = document.getElementById('nombre-empresa').value;
    const urlDirecta = document.getElementById('url-logo-link').value;
    const fileInput = document.getElementById('file-logo');
    const btnGuardar = document.getElementById('btn-guardar-emp');

    if (!nombre) return alert("Escriba el nombre de la empresa");
    
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Procesando...";

    let finalLogoUrl = urlDirecta || "https://via.placeholder.com/150";

    // Si el usuario seleccionó un archivo del PC
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileName = `${Date.now()}_${file.name}`;
        
        const { data, error } = await _supabase.storage
            .from('logos')
            .upload(fileName, file);

        if (error) {
            alert("Error al subir imagen: " + error.message);
            btnGuardar.disabled = false;
            return;
        }

        const { data: publicData } = _supabase.storage
            .from('logos')
            .getPublicUrl(fileName);
        
        finalLogoUrl = publicData.publicUrl;
    }

    // Guardar en la tabla de empresas
    const { error: dbError } = await _supabase
        .from('empresas')
        .insert([{ nombre: nombre, logo_url: finalLogoUrl }]);

    if (dbError) {
        alert("Error en base de datos: " + dbError.message);
    } else {
        location.reload(); // Recargar para ver los cambios
    }
}
