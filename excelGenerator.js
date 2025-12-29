// excelGenerator.js - LÓGICA PARA EXPORTAR A EXCEL

export async function generarExcel(estado, supabase, empresa) {
    // Verificar si la librería SheetJS (XLSX) está cargada
    if (typeof XLSX === 'undefined') return alert("ERROR: LIBRERÍA XLSX NO CARGADA.");

    const mensaje = estado === 'ACTIVO' ? 'DESCARGANDO ACTIVOS...' : 'DESCARGANDO PASIVOS...';
    alert(mensaje);

    // Consulta a Supabase
    const { data, error } = await supabase
        .from('trabajadores')
        .select('*')
        .eq('empresa_id', empresa.id)
        .eq('estado', estado);

    if (error) return alert("ERROR AL DESCARGAR: " + error.message);
    if (!data || data.length === 0) return alert("NO HAY TRABAJADORES " + estado + "S PARA DESCARGAR.");

    // Columnas que NO queremos en el Excel
    const columnasExcluidas = [
        'id', 'empresa_id', 'foto_url', 'firma_url', 
        'tipo_vivienda', 'vivienda', 'servicios_basicos', 'motivo_salida', 
        'religion', 'discapacidad', 'carnet_conadis', 'banco', 'cuenta', 
        'sueldo', 'licencia', 'material_paredes', 'material_cubierta', 
        'habitaciones', 'seguridad_sector', 'conyuge', 'datos_hijos'
    ];

    // Filtramos los datos
    const dataFiltrada = data.map(trabajador => {
        const copia = { ...trabajador };
        columnasExcluidas.forEach(col => delete copia[col]);
        return copia;
    });

    // Generamos el libro de Excel
    const ws = XLSX.utils.json_to_sheet(dataFiltrada);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TRABAJADORES");

    // Descargar archivo
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `NOMINA_${estado}_${empresa.nombre}_${date}.xlsx`);
}
