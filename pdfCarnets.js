// pdfCarnet.js - GENERADOR DE CARNET (FRENTE Y DORSO)
import { getBase64ImageFromURL } from './pdfUtils.js';

export async function generarPDF_Carnet(id, supabase, empresa) {
    alert("GENERANDO CARNET...");

    // 1. Obtener datos
    const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
    if (!t) return alert("Error al cargar datos del trabajador.");

    // 2. Cargar Imágenes (Logo y Foto)
    const [logoBase64, fotoBase64] = await Promise.all([
        empresa.logo_url ? getBase64ImageFromURL(empresa.logo_url) : null,
        t.foto_url ? getBase64ImageFromURL(t.foto_url) : null
    ]);

    // 3. Variables de diseño
    const colorPrimario = '#1f4e79'; // Azul corporativo
    const bordeCarnet = [true, true, true, true]; // Bordes activados

    // --- DISEÑO DEL CARNET (ANVERSO / FRENTE) ---
    const tarjetaFrente = {
        style: 'cardContainer',
        table: {
            widths: ['*'],
            heights: [40, 100, 60], // Cabecera, Cuerpo, Pie
            body: [
                // CABECERA FRENTE
                [{
                    fillColor: colorPrimario,
                    columns: [
                        { image: logoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', width: 35, height: 35, fit: [35, 35], margin: [5, 2, 0, 0] },
                        {
                            stack: [
                                { text: empresa.nombre.toUpperCase(), style: 'cardTitle' },
                                { text: 'RUC: 0791755220001', style: 'cardSubTitle' }, // Puedes hacerlo dinámico si tienes el RUC en la DB
                                { text: 'SEGURIDAD Y SALUD', style: 'cardSubTitle', margin: [0, 2, 0, 0] }
                            ],
                            margin: [5, 5, 0, 0]
                        }
                    ]
                }],
                // CUERPO FRENTE (FOTO Y DATOS)
                [{
                    stack: [
                        { text: '\n' },
                        { 
                            image: fotoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 
                            width: 70, height: 80, fit: [70, 80], alignment: 'center' 
                        },
                        { text: '\n' },
                        { text: (t.nombre || '').toUpperCase(), style: 'nameText' },
                        { text: 'C.I.: ' + (t.cedula || ''), style: 'normalText', bold: true },
                        { text: '\n' },
                        { text: (t.cargo || 'TRABAJADOR').toUpperCase(), style: 'roleText' },
                        { text: 'ÁREA OPERATIVA', style: 'normalText', fontSize: 8 }
                    ],
                    alignment: 'center'
                }],
                // PIE FRENTE
                [{
                    text: 'PLANTA DE BENEFICIO\nZARUMA - EL ORO', 
                    style: 'footerText', 
                    fillColor: '#eeeeee',
                    margin: [0, 5, 0, 0]
                }]
            ]
        },
        layout: { hLineWidth: function(i) { return 0; }, vLineWidth: function(i) { return 0; } } // Sin líneas internas, solo el contenedor
    };

    // --- DISEÑO DEL CARNET (REVERSO / ATRÁS) ---
    const tarjetaAtras = {
        style: 'cardContainer',
        table: {
            widths: ['*'],
            heights: [30, 120, 50],
            body: [
                // CABECERA ATRÁS
                [{
                    text: 'INFORMACIÓN MÉDICA Y DE EMERGENCIA', 
                    style: 'cardSubTitle', 
                    fillColor: colorPrimario, 
                    alignment: 'center', 
                    margin: [0, 8, 0, 8]
                }],
                // CUERPO ATRÁS
                [{
                    margin: [10, 10, 10, 0],
                    stack: [
                        { 
                            columns: [
                                { text: 'TIPO DE SANGRE:', width: 'auto', bold: true, fontSize: 9 },
                                { text: (t.tipo_sangre || 'NO REGISTRA'), width: '*', alignment: 'right', fontSize: 9, color: 'red', bold: true }
                            ]
                        },
                        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 180, y2: 5, lineWidth: 0.5, lineColor: '#ccc' }] },
                        { text: '\nALERGIAS:', bold: true, fontSize: 9 },
                        { text: 'NINGUNA', fontSize: 9 }, // Campo estático o agrégalo a tu DB si lo necesitas
                        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 180, y2: 5, lineWidth: 0.5, lineColor: '#ccc' }] },
                        { text: '\nCONTACTO DE EMERGENCIA:', bold: true, fontSize: 9 },
                        { text: (t.emergencia_nombre || '').toUpperCase(), fontSize: 9 },
                        { text: 'TELF: ' + (t.emergencia_telefono || ''), fontSize: 9, bold: true },
                        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 180, y2: 5, lineWidth: 0.5, lineColor: '#ccc' }] },
                        { text: '\nDOMICILIO:', bold: true, fontSize: 9 },
                        { text: (t.direccion || '').toUpperCase(), fontSize: 8 }
                    ]
                }],
                // PIE ATRÁS (DISCLAIMER)
                [{
                    stack: [
                        { text: 'Este documento es de uso interno y personal e intransferible.', fontSize: 7, italics: true, alignment: 'center', margin: [5, 5, 5, 0] },
                        { text: 'En caso de pérdida, favor comunicar al:', fontSize: 7, alignment: 'center' },
                        { text: '0995662735', fontSize: 8, bold: true, alignment: 'center', color: colorPrimario }
                    ],
                    fillColor: '#eeeeee'
                }]
            ]
        },
        layout: { hLineWidth: function(i) { return 0; }, vLineWidth: function(i) { return 0; } }
    };

    // --- DEFINICIÓN DEL PDF ---
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        background: function(currentPage) {
            return null; // Aquí podrías poner una marca de agua si quieres
        },
        content: [
            { text: 'CARNET DE IDENTIFICACIÓN', style: 'pageTitle' },
            { text: 'Imprima esta hoja, recorte los carnets y péguelos reverso con reverso.', style: 'instruction' },
            { text: '\n\n' },
            
            // CONTENEDOR DE TARJETAS (LADO A LADO)
            {
                columns: [
                    // FRENTE (Con borde simulado)
                    {
                        width: 240, // Ancho estándar tarjeta aprox 8.5cm
                        table: {
                            widths: ['*'],
                            body: [[ tarjetaFrente ]]
                        },
                        layout: { defaultBorder: true, paddingLeft: function(){return 0}, paddingRight: function(){return 0}, paddingTop: function(){return 0}, paddingBottom: function(){return 0} }
                    },
                    { width: 20, text: '' }, // Espacio
                    // ATRÁS (Con borde simulado)
                    {
                        width: 240,
                        table: {
                            widths: ['*'],
                            body: [[ tarjetaAtras ]]
                        },
                        layout: { defaultBorder: true, paddingLeft: function(){return 0}, paddingRight: function(){return 0}, paddingTop: function(){return 0}, paddingBottom: function(){return 0} }
                    }
                ]
            }
        ],
        styles: {
            pageTitle: { fontSize: 16, bold: true, color: '#333', alignment: 'center' },
            instruction: { fontSize: 10, color: '#666', alignment: 'center', italics: true },
            cardContainer: { margin: [0, 0, 0, 0] },
            cardTitle: { fontSize: 10, bold: true, color: 'white', alignment: 'left' },
            cardSubTitle: { fontSize: 7, color: '#dddddd', alignment: 'left' },
            nameText: { fontSize: 11, bold: true, color: '#000', margin: [0, 5, 0, 2] },
            normalText: { fontSize: 9, color: '#333' },
            roleText: { fontSize: 10, bold: true, color: colorPrimario, margin: [0, 2, 0, 2] },
            footerText: { fontSize: 8, color: '#555', alignment: 'center', bold: true }
        }
    };

    pdfMake.createPdf(docDefinition).open();
}
