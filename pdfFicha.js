// pdfFicha.js
import { getBase64ImageFromURL } from './pdfUtils.js';

export async function generarPDF_Ficha(id, supabase, empresa) {
    alert("GENERANDO FICHA...");
    
    const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
    if(!t) return alert("Error al cargar datos.");

    // Imágenes
    const [logoBase64, fotoBase64] = await Promise.all([
        empresa.logo_url ? getBase64ImageFromURL(empresa.logo_url) : null,
        t.foto_url ? getBase64ImageFromURL(t.foto_url) : null
    ]);

    // Hijos
    let hijos = [];
    try { hijos = JSON.parse(t.datos_hijos || '[]'); } catch { }
    const filasHijos = hijos.map(h => [h.nombre, 'HIJO/A', '', h.fecha, '', 'ESTUDIANTE']);
    if (filasHijos.length === 0) filasHijos.push([{ text: 'NO REGISTRA', colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {}]);

    const docDefinition = {
        pageSize: 'A4', pageMargins: [30, 30, 30, 30],
        content: [
            // CABECERA
            {
                columns: [
                    { image: logoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', width: 70, height: 40, fit: [70, 40] },
                    { text: 'FICHA SOCIO-ECONOMICA', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
                    { text: '', width: 70 }
                ]
            },
            { text: '\n' },
            // DATOS PERSONALES
            { text: 'DATOS PERSONALES:', style: 'sectionHeader' },
            {
                style: 'tableExample',
                table: {
                    widths: ['15%', '35%', '15%', '35%'],
                    body: [
                        [{ text: 'Nombres:', bold: true }, t.nombre, { text: 'Empresa:', bold: true }, empresa.nombre],
                        [{ text: 'Cédula:', bold: true }, t.cedula, { text: 'Tipo de Empresa:', bold: true }, 'MINA-PLANTA'],
                        [{ text: 'Sexo:', bold: true }, t.sexo, { text: 'Subarea:', bold: true }, 'OPERACIONES'],
                        [{ text: 'Nacionalidad:', bold: true }, t.nacionalidad, { text: 'Cargo:', bold: true }, t.cargo],
                        [{ text: 'Lugar Nac:', bold: true }, t.lugar_nacimiento, { text: 'Sucursal:', bold: true }, 'PRINCIPAL'],
                        [{ text: 'Fecha Nac:', bold: true }, t.fecha_nacimiento, { text: 'Tipo de Contrato:', bold: true }, 'INDEFINIDO'],
                        [{ text: 'Edad:', bold: true }, document.getElementById('t-edad')?.value || '-', { text: 'Alergia:', bold: true }, 'NINGUNA'],
                        [{ text: 'Código:', bold: true }, t.id, { text: 'Banco:', bold: true }, t.banco || 'N/A'],
                        [{ text: 'Gen Sanguineo:', bold: true }, t.tipo_sangre, { text: 'Cuenta:', bold: true }, t.cuenta || 'N/A'],
                        [{ text: 'Religión:', bold: true }, t.religion, { text: 'Estado:', bold: true }, t.estado],
                        [{ text: 'Profesión:', bold: true }, t.profesion, { text: 'Medio Transporte:', bold: true }, 'VARIOS'],
                        [{ text: 'Sueldo:', bold: true }, '$ ' + t.sueldo, { text: 'Celular:', bold: true }, t.celular],
                        [{ text: 'Afiliado IESS:', bold: true }, t.afiliacion ? 'SI' : 'NO', { text: 'Teléfono:', bold: true }, 'N/A'],
                        [{ text: 'Fecha Afiliación:', bold: true }, t.afiliacion || '', { text: 'Correo:', bold: true }, t.correo],
                        [{ text: 'Estado Civil:', bold: true }, t.estado_civil, { text: 'Discapacidad:', bold: true }, t.discapacidad || 'NO'],
                        [{ text: 'Tiempo Conv:', bold: true }, 'N/A', { text: 'Carnet:', bold: true }, 'NO'],
                        [{ text: 'Cónyuge:', bold: true }, t.conyuge || 'N/A', { text: 'Hijos:', bold: true }, hijos.length > 0 ? 'SI' : 'NO'],
                        [{ text: 'Ciudad Res:', bold: true }, 'SANTA ROSA', { text: 'Número de Hijos:', bold: true }, hijos.length],
                        [{ text: 'Barrio:', bold: true }, 'CENTRO', { text: 'Licencia:', bold: true }, t.licencia],
                        [{ text: 'Dirección:', bold: true }, { text: t.direccion, colSpan: 3 }, {}, {}]
                    ]
                }
            },
            { text: '\n' },
            // NIVEL DE ESTUDIO
            {
                style: 'tableExample',
                table: {
                    widths: ['30%', '40%', '30%'],
                    headerRows: 1,
                    body: [
                        [{ text: 'Nivel de estudio', style: 'tableHeader' }, { text: 'Establecimiento educativo', style: 'tableHeader' }, { text: 'Observación', style: 'tableHeader' }],
                        ['SECUNDARIA / SUPERIOR', 'COLEGIO / UNIVERSIDAD', t.profesion || '']
                    ]
                }
            },
            { text: '\n' },
            // VIVIENDA
            { text: 'VIVIENDA ACTUAL Y SERVICIOS BASICOS:', style: 'sectionHeader' },
            {
                style: 'tableExample',
                table: {
                    widths: ['20%', '30%', '20%', '30%'],
                    body: [
                        [{ text: 'Tendencia:', bold: true }, t.vivienda, { text: 'Servicio Higiénico:', bold: true }, 'POZO SÉPTICO'],
                        [{ text: 'Tipo Vivienda:', bold: true }, t.material_paredes, { text: 'Recolección Basura:', bold: true }, 'SI'],
                        [{ text: 'Cubierta:', bold: true }, t.material_cubierta, { text: 'UPC cercano:', bold: true }, 'NO'],
                        [{ text: 'Nº Habitaciones:', bold: true }, t.habitaciones || '0', { text: 'Seguridad:', bold: true }, 'REGULAR'],
                        [{ text: 'Servicios:', bold: true }, t.servicios_basicos || 'NINGUNO', { text: 'Tipo Familia:', bold: true }, 'NUCLEAR'],
                        [{ text: 'Agua:', bold: true }, 'RED PÚBLICA', { text: 'Problema Familiar:', bold: true }, 'NINGUNO']
                    ]
                }
            },
            { text: '\n' },
            // TALLAS
            {
                style: 'tableExample',
                table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    headerRows: 1,
                    body: [
                        [{ text: 'Talla Ropa', style: 'tableHeader', colSpan: 4 }, {}, {}, {}],
                        ['Camisa', t.talla_camisa || '', 'Pantalon', t.talla_pantalon || ''],
                        ['Zapatos', t.talla_zapatos || '', '', '']
                    ]
                }
            },
            { text: '\n' },
            // EMERGENCIA
            { text: 'EN CASO DE EMERGENCIA:', style: 'sectionHeader' },
            {
                style: 'tableExample',
                table: {
                    widths: ['30%', '20%', '25%', '25%'],
                    headerRows: 1,
                    body: [
                        [{ text: 'Persona', style: 'tableHeader' }, { text: 'Parentesco', style: 'tableHeader' }, { text: 'Teléfono', style: 'tableHeader' }, { text: 'Celular', style: 'tableHeader' }],
                        [t.emergencia_nombre || '', 'FAMILIAR', '', t.emergencia_telefono || ''],
                        [t.emergencia2_nombre || '', 'FAMILIAR', '', t.emergencia2_telefono || '']
                    ]
                }
            },
            { text: '\n' },
            // CARGAS FAMILIARES
            { text: 'CARGAS FAMILIARES:', style: 'sectionHeader' },
            {
                style: 'tableExample',
                table: {
                    widths: ['25%', '10%', '15%', '15%', '10%', '25%'],
                    headerRows: 1,
                    body: [
                        [{ text: 'Persona', style: 'tableHeader' }, { text: 'Sexo', style: 'tableHeader' }, { text: 'Parentesco', style: 'tableHeader' }, { text: 'F. Nacim', style: 'tableHeader' }, { text: 'Edad', style: 'tableHeader' }, { text: 'Ocupación', style: 'tableHeader' }],
                        ...filasHijos
                    ]
                }
            },
            { text: '\n' },
            // EGRESOS
            { text: 'EGRESOS MENSUALES ESTIMADOS:', style: 'sectionHeader' },
            {
                style: 'tableExample',
                table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    headerRows: 1,
                    body: [
                        [{ text: 'Rubro', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }, { text: 'Rubro', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }],
                        ['Alimento', '$ 150', 'Salud', '$ 20'],
                        ['Luz', '$ 20', 'Vestido', '$ 30'],
                        ['Agua', '$ 10', 'Arriendo', '$ 0'],
                        ['Educación', '$ 50', 'Otros', '$ 50']
                    ]
                }
            },
            { text: '\n' },
            // COMUNICACIÓN
            { text: 'COMUNICACIÓN FAMILIAR:', style: 'sectionHeader' },
            {
                style: 'tableExample',
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [{ text: 'Nivel de comunicación:', bold: true }, 'BUENO'],
                        [{ text: 'Designa tareas a sus hijos:', bold: true }, 'SI'],
                        [{ text: 'Causas de conflicto:', bold: true }, 'NINGUNA'],
                        [{ text: 'Formas de recreación:', bold: true }, 'PASEOS']
                    ]
                }
            },
            { text: '\n\n' },
            // FIRMA (SOLO LINEA)
            {
                stack: [
                    { text: '\n\n\n\n' },
                    { text: '_______________________________', alignment: 'center' },
                    { text: 'FIRMA DEL SOLICITANTE', alignment: 'center', bold: true },
                    { text: t.nombre, alignment: 'center' },
                    { text: t.cedula, alignment: 'center' }
                ]
            }
        ],
        styles: {
            header: { fontSize: 14, bold: true, decoration: 'underline' },
            sectionHeader: { fontSize: 10, bold: true, margin: [0, 5, 0, 2] },
            tableExample: { margin: [0, 2, 0, 5], fontSize: 8 },
            tableHeader: { bold: true, fontSize: 9, color: 'black', fillColor: '#cccccc', alignment: 'center' }
        },
        defaultStyle: { fontSize: 8 }
    };

    pdfMake.createPdf(docDefinition).open();
}
