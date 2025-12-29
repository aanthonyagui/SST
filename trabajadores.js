// =========================================================
    // GENERACIÓN DE PDF Y DOCUMENTOS - VERSIÓN FINAL
    // =========================================================

    // 1. Convertidor de Imágenes
    const getBase64ImageFromURL = (url) => {
        return new Promise((resolve) => {
            if (!url) { resolve(null); return; }
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => { resolve(null); }; 
            img.src = url;
        });
    };

    // Imagen placeholder (Gris)
    const placeholderImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    // 2. Función Principal de Impresión / Apertura
    window.imprimirDoc = async (tipo) => {
        toggleMenuNombre(); // Cierra el menú desplegable
        
        const id = document.getElementById('t-id').value;
        if (!id) return alert("Por favor, selecciona un trabajador primero.");

        if (tipo === 'ficha') {
            await generarPDF_Ficha(id);
        } 
        else if (tipo === 'ats') {
            // --- LÓGICA PARA ABRIR EL PDF EXISTENTE ---
            // Asegúrate de que ATS.pdf esté en la carpeta raíz de tu proyecto en GitHub
            const rutaPDF = './ATS.pdf'; 
            window.open(rutaPDF, '_blank');
        } 
        else if (tipo === 'carnet') {
            alert("El módulo de Carnet está en desarrollo.");
        } 
        else {
            alert(`Opción ${tipo.toUpperCase()} no implementada aún.`);
        }
    };

    // 3. Generador de Ficha Socioeconómica (SIN FOTO DE FIRMA)
    async function generarPDF_Ficha(id) {
        const btnTexto = document.getElementById('lbl-nombre-trab');
        const textoOriginal = btnTexto.innerText;
        btnTexto.innerText = "⏳ GENERANDO...";

        try {
            // A. Obtener datos
            const { data: t, error } = await supabase.from('trabajadores').select('*').eq('id', id).single();
            if (error || !t) throw new Error("No se pudieron cargar los datos");

            // B. Preparar Imágenes (YA NO DESCARGAMOS LA FIRMA)
            const logoUrl = empresa.logo_url;
            
            // Solo descargamos Logo y Foto de Perfil
            const [logoBase64, fotoBase64] = await Promise.all([
                getBase64ImageFromURL(logoUrl),
                getBase64ImageFromURL(t.foto_url)
            ]);

            // C. Calcular edad hijos (Lógica auxiliar)
            const calcularEdad = (fecha) => {
                if(!fecha) return '-';
                const diff = Date.now() - new Date(fecha).getTime();
                return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' AÑOS';
            };

            // D. Parsear Hijos
            let hijos = [];
            try { hijos = JSON.parse(t.datos_hijos || '[]'); } catch { }
            
            const bodyHijos = [
                [
                    { text: 'NOMBRES Y APELLIDOS', style: 'tableHeader' },
                    { text: 'FECHA NACIMIENTO', style: 'tableHeader' },
                    { text: 'EDAD', style: 'tableHeader' }
                ]
            ];

            if (hijos.length > 0) {
                hijos.forEach(h => {
                    bodyHijos.push([ 
                        { text: h.nombre, style: 'tableCell' }, 
                        { text: h.fecha, style: 'tableCell', alignment: 'center' }, 
                        { text: calcularEdad(h.fecha), style: 'tableCell', alignment: 'center' } 
                    ]);
                });
            } else {
                bodyHijos.push([{ text: 'NO REGISTRA CARGAS FAMILIARES', colSpan: 3, alignment: 'center', color: '#888', italics: true }, {}, {}]);
            }

            // E. Definición del Documento
            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [30, 30, 30, 30],
                content: [
                    // --- ENCABEZADO ---
                    {
                        table: {
                            widths: [60, '*', 70],
                            body: [
                                [
                                    { image: logoBase64 || placeholderImg, width: 50, height: 50, fit: [50, 50], alignment: 'center', margin: [0, 5, 0, 0], rowSpan: 2 },
                                    { text: empresa.nombre.toUpperCase(), style: 'headerCompany', alignment: 'center', margin: [0, 10, 0, 0] },
                                    { text: [{ text: 'CÓDIGO: ', bold: true }, 'SST-F-001\n', { text: 'VERSIÓN: ', bold: true }, '02\n', { text: 'FECHA: ', bold: true }, new Date().toISOString().split('T')[0]], style: 'headerMeta', rowSpan: 2 }
                                ],
                                [ {}, { text: 'FICHA SOCIOECONÓMICA DEL TRABAJADOR', style: 'headerTitle', alignment: 'center' }, {} ]
                            ]
                        },
                        layout: 'noBorders'
                    },
                    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 2, lineColor: '#004aad' }] },
                    { text: '\n' },

                    // --- DATOS PERSONALES ---
                    { text: '1. INFORMACIÓN PERSONAL', style: 'sectionHeader' },
                    {
                        columns: [
                            {
                                width: '*',
                                table: {
                                    widths: ['30%', '70%'],
                                    body: [
                                        [{ text: 'CÉDULA:', style: 'label' }, { text: t.cedula, style: 'value' }],
                                        [{ text: 'NOMBRES:', style: 'label' }, { text: t.nombre, style: 'value' }],
                                        [{ text: 'FECHA NAC.:', style: 'label' }, { text: `${t.fecha_nacimiento} (Edad: ${document.getElementById('t-edad').value})`, style: 'value' }],
                                        [{ text: 'ESTADO CIVIL:', style: 'label' }, { text: t.estado_civil, style: 'value' }],
                                        [{ text: 'NACIONALIDAD:', style: 'label' }, { text: `${t.nacionalidad} - ${t.lugar_nacimiento}`, style: 'value' }],
                                        [{ text: 'TELÉFONO:', style: 'label' }, { text: t.celular, style: 'value' }],
                                        [{ text: 'CORREO:', style: 'label' }, { text: t.correo || 'NO REGISTRA', style: 'value' }],
                                        [{ text: 'DIRECCIÓN:', style: 'label' }, { text: t.direccion, style: 'value' }]
                                    ]
                                }, layout: 'lightHorizontalLines'
                            },
                            {
                                width: 100, stack: [
                                    { image: fotoBase64 || placeholderImg, width: 90, height: 110, fit: [90, 110], alignment: 'center', background: '#eeeeee' },
                                    { text: 'FOTO ACTUALIZADA', fontSize: 7, alignment: 'center', margin: [0, 2, 0, 0] }
                                ]
                            }
                        ], columnGap: 10
                    },

                    // --- INFORMACIÓN LABORAL ---
                    { text: '2. PERFIL LABORAL Y ACADÉMICO', style: 'sectionHeader', margin: [0, 10, 0, 5] },
                    {
                        table: {
                            widths: ['25%', '25%', '25%', '25%'],
                            body: [
                                [{ text: 'CARGO ACTUAL:', style: 'label' }, { text: t.cargo, style: 'value' }, { text: 'FECHA INGRESO:', style: 'label' }, { text: t.fecha_ingreso, style: 'value' }],
                                [{ text: 'PROFESIÓN:', style: 'label' }, { text: t.profesion || 'N/A', style: 'value' }, { text: 'TIPO SANGRE:', style: 'label' }, { text: t.tipo_sangre || 'N/A', style: 'value' }],
                                [{ text: 'DISCAPACIDAD:', style: 'label' }, { text: t.discapacidad || 'NO', style: 'value' }, { text: 'LICENCIA:', style: 'label' }, { text: t.licencia || 'NO', style: 'value' }],
                                [{ text: 'BANCO:', style: 'label' }, { text: t.banco || 'N/A', style: 'value' }, { text: 'CUENTA:', style: 'label' }, { text: t.cuenta || 'N/A', style: 'value' }]
                            ]
                        }, layout: 'lightHorizontalLines'
                    },

                    // --- VIVIENDA ---
                    { text: '3. SITUACIÓN DE VIVIENDA', style: 'sectionHeader', margin: [0, 10, 0, 5] },
                    {
                        table: {
                            widths: ['15%', '35%', '15%', '35%'],
                            body: [
                                [{ text: 'TIPO:', style: 'label' }, { text: t.vivienda || '-', style: 'value' }, { text: 'HABITACIONES:', style: 'label' }, { text: t.habitaciones || '-', style: 'value' }],
                                [{ text: 'PAREDES:', style: 'label' }, { text: t.material_paredes || '-', style: 'value' }, { text: 'TECHO:', style: 'label' }, { text: t.material_cubierta || '-', style: 'value' }],
                                [{ text: 'SERVICIOS:', style: 'label' }, { text: t.servicios_basicos || 'NO REGISTRA', style: 'value', colSpan: 3 }, {}, {}]
                            ]
                        }, layout: 'lightHorizontalLines'
                    },

                    // --- CARGA FAMILIAR ---
                    { text: '4. CARGA FAMILIAR', style: 'sectionHeader', margin: [0, 10, 0, 5] },
                    {
                        table: { headerRows: 1, widths: ['*', 'auto', 'auto'], body: bodyHijos },
                        layout: { fillColor: function (rowIndex) { return (rowIndex === 0) ? '#eeeeee' : null; }, hLineWidth: function (i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 0.5; } }
                    },

                    // --- DOTACIÓN Y EMERGENCIA ---
                    { text: '5. TALLAS Y CONTACTO DE EMERGENCIA', style: 'sectionHeader', margin: [0, 10, 0, 5] },
                    {
                        table: {
                            widths: ['33%', '33%', '33%'],
                            body: [[
                                { text: `CAMISA: ${t.talla_camisa||'-'}`, alignment: 'center', style: 'value' },
                                { text: `PANTALÓN: ${t.talla_pantalon||'-'}`, alignment: 'center', style: 'value' },
                                { text: `ZAPATOS: ${t.talla_zapatos||'-'}`, alignment: 'center', style: 'value' }
                            ]]
                        }
                    },
                    { text: '\n' },
                    {
                        table: {
                            widths: ['15%', '35%', '15%', '35%'],
                            body: [
                                [{ text: 'EMERGENCIA 1:', style: 'label', fillColor: '#f9f9f9' }, { text: t.emergencia_nombre, style: 'value', fillColor: '#f9f9f9' }, { text: 'TELÉFONO:', style: 'label', fillColor: '#f9f9f9' }, { text: t.emergencia_telefono, style: 'value', fillColor: '#f9f9f9' }],
                                [{ text: 'EMERGENCIA 2:', style: 'label' }, { text: t.emergencia2_nombre || '-', style: 'value' }, { text: 'TELÉFONO:', style: 'label' }, { text: t.emergencia2_telefono || '-', style: 'value' }]
                            ]
                        }, layout: 'noBorders'
                    },

                    // --- 7. DECLARACIÓN Y FIRMAS (MODIFICADO: SIN IMAGEN) ---
                    { text: '\n\n' },
                    { text: 'Declaro que la información proporcionada es verídica y autorizo a la empresa el uso de mis datos para fines laborales y de seguridad social.', style: 'smallText', alignment: 'justify', margin: [0, 0, 0, 20] },
                    {
                        table: {
                            widths: ['50%', '50%'],
                            body: [
                                [
                                    {
                                        stack: [
                                            // AQUI QUITAMOS LA IMAGEN Y PONEMOS ESPACIO EN BLANCO
                                            { text: '\n\n\n\n', fontSize: 10 }, 
                                            { text: '_______________________________', alignment: 'center' },
                                            { text: 'FIRMA DEL TRABAJADOR', style: 'label', alignment: 'center' },
                                            { text: t.cedula, style: 'smallText', alignment: 'center' }
                                        ]
                                    },
                                    {
                                        stack: [
                                            { text: '\n\n\n\n', fontSize: 10 },
                                            { text: '_______________________________', alignment: 'center' },
                                            { text: 'DEPARTAMENTO SST / RRHH', style: 'label', alignment: 'center' },
                                            { text: 'Revisado y Aprobado', style: 'smallText', alignment: 'center' }
                                        ]
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                styles: {
                    headerCompany: { fontSize: 14, bold: true, color: '#1f4e79' },
                    headerTitle: { fontSize: 11, bold: true, color: '#000000' },
                    headerMeta: { fontSize: 8, color: '#555', alignment: 'right' },
                    sectionHeader: { fontSize: 11, bold: true, color: '#ffffff', fillColor: '#004aad', margin: [0, 5, 0, 5], padding: [5, 2, 5, 2] },
                    label: { fontSize: 9, bold: true, color: '#444' },
                    value: { fontSize: 9, color: '#000' },
                    tableHeader: { fontSize: 9, bold: true, color: '#000', fillColor: '#eeeeee', alignment: 'center' },
                    tableCell: { fontSize: 9, color: '#333' },
                    smallText: { fontSize: 8, color: '#666', italics: true }
                }
            };

            pdfMake.createPdf(docDefinition).open();

        } catch (err) {
            console.error(err);
            alert("Error al generar PDF: " + err.message);
        } finally {
            btnTexto.innerText = textoOriginal;
        }
    }
