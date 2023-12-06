<script setup>
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ref, computed, onMounted } from "vue";
import cabecera from "../components/Menu.vue";
import { pedidosStore } from "../stores/pedidos"

const { consultarPorFecha, consultarEstatus } = pedidosStore();

const tipoSeleccionado = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");

const pedidosArray = ref([]);

let contadorPDF = 1;

const limpiarCampos = () => {
    tipoSeleccionado.value = "Seleccionar tipo de reporte";
    fechaInicio.value = "";
    fechaFin.value = "";
};

const generarReporte = async () => {

    console.log("Seleccionado", tipoSeleccionado.value);
    if (tipoSeleccionado.value === 'Reporte Estatus') {
        console.log('estatus');
        await porEstatus();
        generarPDFEstatus(fechaInicio.value, fechaFin.value);
    } else {
        if (tipoSeleccionado.value === 'Reporte Pedidos') {
            console.log('estatus');
            await porFechas();
            generarPDF(fechaInicio.value, fechaFin.value);
        }
    }
};

const porFechas = async () => {
    try {
        console.log(fechaInicio.value)
        console.log(fechaFin.value)
        pedidosArray.value = await consultarPorFecha(fechaInicio.value, fechaFin.value);
        console.log(pedidosArray.value);
    } catch (error) {
        console.log(error);
    }
};

const porEstatus = async () => {
    try {
        console.log(fechaInicio.value)
        console.log(fechaFin.value)
        pedidosArray.value = await consultarEstatus(fechaInicio.value, fechaFin.value);
        console.log(pedidosArray.value);
    } catch (error) {
        console.log(error);
    }
};

const generarPDF = (fechaInicioSeleccionada, fechaFinSeleccionada) => {
    // Obtener la fecha actual
    const fechaActual = new Date();
    const fechaFormato = fechaActual.toISOString().slice(0, 10); // Formato AAAA-MM-DD

    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 15; // Posición inicial en el eje Y

    // Añadir imagen como logo
    import('@/assets/LogoSOLMAQ.png')
        .then((logo) => {
            pdf.addImage(logo.default, 'PNG', 85, 10, 40, 30); // Añadir el logo sin redimensionar                        
            y += 35; // Incrementar la posición Y después de colocar el título

            // Acceder al arreglo de datos dentro de pedidosArray.value.body
            const pedidosData = pedidosArray.value.body;

            // Verificar si pedidosData es un array antes de procesarlo
            if (Array.isArray(pedidosData) && pedidosData.length > 0) {
                const tableData = [];
                const headers = ['Fecha', 'N° Pedido', 'Cliente', 'Monto'];
                tableData.push(headers);

                let total = 0; // Inicializar el total

                pedidosData.forEach((pedido, index) => {
                    const rowData = [
                        formatFecha(pedido.FechaPedido),
                        pedido.NoPedido,
                        pedido.NombreCliente,
                        pedido.Total
                    ];
                    tableData.push(rowData);

                    // Sumar los montos para calcular el total
                    total += parseFloat(pedido.Total);
                });

                const styles = {
                    theme: 'striped',
                    styles: {
                        lineColor: [0, 0, 0], // Color de los bordes
                        lineWidth: 0.1, // Grosor de los bordes
                    },
                    headStyles: { fillColor: [91, 155, 213], cellWidth: 'auto', halign: 'center' }, // Estilos de fondo para el encabezado (opcional)
                };

                pdf.autoTable({
                    startY: y,
                    head: [
                        [{ content: 'REPORTE PEDIDOS', colSpan: 4, styles: { halign: 'center' } }],
                    ],
                    body: [
                        [{ content: 'Periodo', colSpan: 4, styles: { halign: 'center' } }],
                        [{ content: 'Fecha Inicio', styles: { halign: 'center' } }, { content: formatFecha(fechaInicioSeleccionada), styles: { halign: 'center' } }, { content: 'Fecha Fin', styles: { halign: 'center' } }, { content: formatFecha(fechaFinSeleccionada), styles: { halign: 'center' } }],
                        [{ content: 'Total', styles: { halign: 'center' } }, { content: total.toFixed(2), colSpan: 4, styles: { halign: 'center' } }]
                    ],
                    styles: {
                        head: {
                            halign: 'center', // Centrar el contenido del encabezado
                        }
                    },
                    ...styles,
                });

                // Dejar un espacio entre las tablas
                y = pdf.autoTable.previous.finalY + 10;

                const columnStyles = {
                    0: { cellWidth: 'auto', halign: 'center' },
                    1: { cellWidth: 'auto', halign: 'center' },
                    2: { cellWidth: 'auto', halign: 'center' },
                    3: { cellWidth: 'auto', halign: 'center' }
                };

                // Generar la primera tabla debajo de la segunda
                pdf.autoTable({
                    startY: y,
                    head: [tableData[0]],
                    body: tableData.slice(1),
                    styles: {
                        body: {
                            halign: 'center', // Centrar el contenido del encabezado
                        }
                    },
                    columnStyles: columnStyles, // Aplicar estilos de justificación a las columnas específicas                    
                    ...styles,
                });

                // Guardar el documento PDF con el nombre adecuado
                const nombreArchivo = `reporte_pedidos_${fechaFormato}_${pad(contadorPDF, 4)}.pdf`;
                pdf.save(nombreArchivo);

                // Incrementar el contador para el próximo PDF
                contadorPDF++;
            } else {
                // Si no hay datos en pedidosData, muestra un mensaje o realiza alguna acción adecuada.
                pdf.text("No hay datos para mostrar", 105, y);
                alert("No hay datos para mostrar");
            }
        })
        .catch((error) => {
            console.error('Error al cargar la imagen:', error);
        });

};

const generarPDFEstatus = (fechaInicioSeleccionada, fechaFinSeleccionada) => {
    // Obtener la fecha actual
    const fechaActual = new Date();
    const fechaFormato = fechaActual.toISOString().slice(0, 10); // Formato AAAA-MM-DD

    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 15; // Posición inicial en el eje Y

    // Añadir imagen como logo
    import('@/assets/logo.png')
        .then((logo) => {
            pdf.addImage(logo.default, 'PNG', 85, 10, 40, 30); // Añadir el logo sin redimensionar                        
            y += 35; // Incrementar la posición Y después de colocar el título

            // Acceder al arreglo de datos dentro de pedidosArray.value.body
            const pedidosData = pedidosArray.value.body;

            // Verificar si pedidosData es un array antes de procesarlo
            if (Array.isArray(pedidosData) && pedidosData.length > 0) {
                const tableData = [];
                const headers = ['Fecha', 'N° Pedido', 'Cliente', 'Estatus'];
                tableData.push(headers);

                let aceptados = 0;
                let rechazados = 0;

                const getEstado = (estadoNum) => {
                    return estadoNum === 1 ? 'ACEPTADO' : estadoNum === 2 ? 'RECHAZADO' : 'INDEFINIDO';
                };

                pedidosData.forEach((pedido, index) => {
                    const rowData = [
                        formatFecha(pedido.FechaPedido),
                        pedido.NoPedido,
                        pedido.NombreCliente,
                        getEstado(pedido.Estatus) // Obtener el estado correspondiente
                    ];
                    tableData.push(rowData);
                    // Contar los pedidos aceptados y rechazados
                    if (pedido.Estatus === 1) {
                        aceptados++;
                    } else if (pedido.Estatus === 2) {
                        rechazados++;
                    }
                });

                const styles = {
                    theme: 'striped',
                    styles: {
                        lineColor: [0, 0, 0], // Color de los bordes
                        lineWidth: 0.1, // Grosor de los bordes
                    },
                    headStyles: { fillColor: [91, 155, 213], cellWidth: 'auto', halign: 'center' }, // Estilos de fondo para el encabezado (opcional)
                };

                pdf.autoTable({
                    startY: y,
                    head: [
                        [{ content: 'REPORTE ESTATUS', colSpan: 4, styles: { halign: 'center' } }],
                    ],
                    body: [
                        [{ content: 'Periodo', colSpan: 4, styles: { halign: 'center' } }],
                        [{ content: 'Fecha Inicio', styles: { halign: 'center' } }, { content: formatFecha(fechaInicioSeleccionada), styles: { halign: 'center' } }, { content: 'Fecha Fin', styles: { halign: 'center' } }, { content: formatFecha(fechaFinSeleccionada), styles: { halign: 'center' } }],
                        [{ content: 'Total aceptados', colSpan: 2, styles: { halign: 'center' } }, { content: aceptados, colSpan: 2, styles: { halign: 'center' } }],
                        [{ content: 'Total rechazados', colSpan: 2, styles: { halign: 'center' } }, { content: rechazados, colSpan: 2, styles: { halign: 'center' } }],                        
                    ],
                    styles: {
                        head: {
                            halign: 'center', // Centrar el contenido del encabezado
                        }
                    },
                    ...styles,
                });

                // Dejar un espacio entre las tablas
                y = pdf.autoTable.previous.finalY + 10;

                const columnStyles = {
                    0: { cellWidth: 'auto', halign: 'center' },
                    1: { cellWidth: 'auto', halign: 'center' },
                    2: { cellWidth: 'auto', halign: 'center' },
                    3: { cellWidth: 'auto', halign: 'center' }
                };

                // Generar la primera tabla debajo de la segunda
                pdf.autoTable({
                    startY: y,
                    head: [tableData[0]],
                    body: tableData.slice(1),
                    styles: {
                        body: {
                            halign: 'center', // Centrar el contenido del encabezado
                        }
                    },
                    columnStyles: columnStyles, // Aplicar estilos de justificación a las columnas específicas                    
                    ...styles,
                });

                // Guardar el documento PDF con el nombre adecuado
                const nombreArchivo = `reporte_estatuspedido_${fechaFormato}_${pad(contadorPDF, 4)}.pdf`;
                pdf.save(nombreArchivo);

                // Incrementar el contador para el próximo PDF
                contadorPDF++;
            } else {
                // Si no hay datos en pedidosData, muestra un mensaje o realiza alguna acción adecuada.
                pdf.text("No hay datos para mostrar", 105, y);
                alert("No hay datos para mostrar");
            }
        })
        .catch((error) => {
            console.error('Error al cargar la imagen:', error);
        });

};

// Función para rellenar con ceros a la izquierda
function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString(); // Format the date to a string
};

const camposVacios = computed(() => {
    return tipoSeleccionado.value === '' || fechaInicio.value === '' || fechaFin.value === '';
});

</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="reportes"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <h1 class="titulo"><b>Generar reporte </b></h1>
        <div class="row">
            <div class="col">
                <label for="tipoReporte" class="form-label">Tipo de Reporte</label>
                <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                    v-model="tipoSeleccionado" required id="tipoReporte">
                    <option>Reporte Estatus</option>
                    <option>Reporte Pedidos</option>
                </select>
            </div>
        </div>
        <br>
        <div class="row">
            <div class="col">
                <label for="inicio" class="form-label">Fecha Inicio</label>
                <input type="date" v-model="fechaInicio" class="form-control form-color" id="inicio" />
            </div>
            <div class="col">
                <label for="fin" class="form-label">Fecha Fin</label>
                <input type="date" v-model="fechaFin" class="form-control form-color" id="fin" />
            </div>
        </div>
        <div class="botones">
            <button class="btn btn-cancelar" @click="limpiarCampos">Limpiar</button>
            <button class="btn btn-primary btn-amarillo" @click="generarReporte" :disabled="camposVacios">
                Generar Reporte
            </button>
        </div>
    </div>
</template>

<style scoped>
.titulo {
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;
    margin-left: 30px;
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: left;
}

.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: left;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
    padding-bottom: 50px;
    width: 70%;
    height: auto;
}

.row {
    margin-left: 20px;
}

.form-color {
    background-color: #f4f4f4;
    width: 400px;
    border-color: #afafaf;
}

.btn-cancelar {
    border-radius: 10px;
    /* Establece el borde redondo */
    background-color: white;
    color: red;
    border: 2px solid red;

}

.btn-amarillo {
    background-color: #FFCA0A;
    border: 2px solid #FFCA0A;
    color: black;
    width: 150px;
    height: 40px;
    border: none;
}

.botones {
    margin-top: 25px;
    margin-right: 30px;
    text-align: right;
}

.botones button {
    margin-top: 10px;
    margin-left: 10px;
}
</style>