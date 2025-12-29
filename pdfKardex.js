// pdfKardex.js
import { getBase64ImageFromURL } from './pdfUtils.js';

export async function generarPDF_Kardex(id, anio, supabase, empresa) {
    alert(`GENERANDO KARDEX ${anio}...`);
    
    const { data: t } = await supabase.from('trabajadores').select('*').eq('id', id).single();
    if(!t) return alert("Error al cargar datos.");

    // Imágenes (Logo y Foto Trabajador)
    const [logoBase64, fotoBase64] = await Promise.all([
        empresa.logo_url ? getBase64ImageFromURL(empresa.logo_url) : null,
        t.foto_url ? getBase64ImageFromURL(t.foto_url) : null
    ]);

    // 10 Filas vacías
    const filasVacias = [];
    for (let i = 1; i <= 10; i++) {
        filasVacias.push([
            { text: i.toString(), alignment: 'center' }, 
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' } 
        ]);
    }

    const docDefinition = {
        pageSize: 'A4', pageMargins: [30, 30, 30, 30],
        content: [
            // ENCABEZADO
            {
                table: {
                    widths: [60, '*', 70],
                    body: [
                        [
                            { 
                                image: logoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 
                                width: 50, height: 50, fit: [50, 50], 
                                alignment: 'center', margin: [0, 5, 0, 0],
                                rowSpan: 2, border: [false, false, false, false]
                            },
                            { 
                                text: [
                                    { text: empresa.nombre.toUpperCase() + '\n', bold: true, fontSize: 16, color: '#000' },
                                    { text: 'KARDEX DE EPP', bold: true, fontSize: 14, color: '#000' }
                                ], 
                                alignment: 'center', margin: [0, 10, 0, 0],
                                border: [false, false, false, false]
                            },
                            { 
                                text: [
                                    { text: 'AÑO\n', fontSize: 12, bold: true },
                                    { text: anio.toString(), fontSize: 14, bold: true }
                                ], 
                                alignment: 'center', margin: [0, 10, 0, 0],
                                rowSpan: 2, border: [false, false, false, false]
                            }
                        ],
                        [ {}, {}, {} ]
                    ]
                }
            },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 2, lineColor: '#000' }] },
            { text: '\n' },

            // DATOS TRABAJADOR (Foto a la derecha, Tallas en texto)
            {
                columns: [
                    {
                        width: '*',
                        text: [
                            { text: 'APELLIDOS Y NOMBRES: ', bold: true }, t.cedula + ' ' + t.nombre + '\n',
                            { text: 'CARGO: ', bold: true }, t.cargo + '\n',
                            { text: 'TALLAS: ', bold: true }, `CAMISA: ${t.talla_camisa||'-'} | PANTALÓN: ${t.talla_pantalon||'-'} | ZAPATOS: ${t.talla_zapatos||'-'}`
                        ],
                        fontSize: 10, margin: [0, 10, 0, 0]
                    },
                    {
                        width: 80,
                        image: fotoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                        fit: [80, 100], alignment: 'right'
                    }
                ]
            },
            { text: '\n' },

            // TABLA
            {
                table: {
                    headerRows: 1,
                    widths: ['5%', '10%', '35%', '15%', '15%', '20%'],
                    body: [
                        [
                            { text: 'N°', style: 'tableHeader' },
                            { text: 'CANTIDAD', style: 'tableHeader' },
                            { text: 'EQUIPO DE PROTECCIÓN PERSONAL', style: 'tableHeader' },
                            { text: 'FECHA DE RECEPCIÓN', style: 'tableHeader' },
                            { text: 'FIRMA', style: 'tableHeader' },
                            { text: 'OBSERVACIÓN', style: 'tableHeader' }
                        ],
                        ...filasVacias
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) { return 0.5; },
                    vLineWidth: function (i, node) { return 0.5; },
                    paddingTop: function(i) { return 8; },
                    paddingBottom: function(i) { return 8; }
                }
            }
        ],
        styles: {
            tableHeader: { bold: true, fontSize: 8, color: 'black', alignment: 'center', fillColor: '#eeeeee' }
        },
        defaultStyle: { fontSize: 10 }
    };

    pdfMake.createPdf(docDefinition).open();
}
