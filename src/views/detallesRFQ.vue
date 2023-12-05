<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { useRoute } from 'vue-router';
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { clientesStore } from "../stores/clientes";
import { rfqStore } from "../stores/rfq";
import { piezasrfqStore } from "../stores/piezasrfq"
import { materialesStore } from "../stores/materiales"
import { loginStore } from "../stores/login";
import { pedidosStore } from "../stores/pedidos";
import { detallePedidoStore } from "../stores/detallesPedido";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerUnUser, obtenerIdUsuarioPorUser } = usuariosStore();
const { obtenerRFQ, obtenerRFQPorId, setRFQ, cambiarPedido } = rfqStore();
const { obtenerPorRFQ } = piezasrfqStore();
const { obtenerClientePorId } = clientesStore();
const { obtenerMateriales } = materialesStore();
const { agregarPedido, obtenerPedidos } = pedidosStore();
const { agregarDetalles } = detallePedidoStore();

const route = useRoute();

const fechaEntrega = ref(""); // Nueva referencia reactiva para la fecha de entrega

const visibleGestionar = ref("");
const visiblePedir = ref("");
const Usuario = getUser();

const rfqsArray = ref([]);
const rfqsDesplegados = ref([]);
const piezas = ref([]);
const pedidos = ref([]);

const idRFQ = route.params.id;

//variables reactivas
const noRFQ = ref("");
const razonSocial = ref("");
const fecha = ref("");
const costoTotal = ref("");
const estatus = ref("");
const estatusPedido = ref("");

const contadorPedido = ref(1);

const materiales = ref([]); // Variable reactiva para almacenar los materiales

const rfqSeleccionado = ref(null); // Variable para almacenar el rfq seleccionado
const costoSeleccionado = ref(null); // Variable para almacenar el rfq seleccionado

const nuevoPedido = ref('');

// Declaración del modal
let modal;
let modalPedir;
let idUsuario = '';

onMounted(async () => {
    try {
        // Obteniendo el contador
        const today = new Date();
        const fechaP = localStorage.getItem('fechaPedido');
        const count = localStorage.getItem('contadorPedido');
        // Si el contador esta vacio o es otro día reiniciar el contador a 1
        if (!count || fechaP !== today.toDateString()) {
            contadorPedido.value = 1;
        } else {
            // Si no obtener el contador
            contadorPedido.value = parseInt(count);
        }

        idUsuario = await obtenerIdUsuarioPorUser(Usuario);
        console.log(idUsuario);

        nuevoPedido.value = generarNumeroPedido();
        console.log(nuevoPedido.value)

        await consultarRfqs();
        await consultarPiezas();
        await consultarMateriales();
        console.log(idRFQ)
        const rfq = await obtenerRFQPorId(idRFQ);
        console.log(rfq);

        // llenar variables reactivas
        noRFQ.value = rfq.NoRFQ || "";
        fecha.value = rfq.FechaRFQ || "";
        estatus.value = rfq.Estatus;
        estatusPedido.value = rfq.pedido;
        console.log(rfq.idUsuario);
        razonSocial.value = await obtenerRazonSocial(rfq.idUsuario)
        costoTotal.value = rfq.CostoTotal || "";

        console.log("?????", estatusPedido.value)

        // // Inicialización del modalPedir
        modalPedir = new bootstrap.Modal(document.getElementById('modalPedir'), {
            backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });

        // Permisos
        const idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);
        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Agregar Costos RFQ") ? visibleGestionar.value = true : visibleGestionar.value = false;
        permisos.includes("Realizar Pedidos") ? visiblePedir.value = true : visiblePedir.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarRfqs = async (activo) => {
    try {
        const response = await obtenerRFQ(activo);
        const rfqs = response.data.body.filter(rfq => rfq.Activo === activo);

        rfqsArray.value = rfqs;
        rfqsDesplegados.value = rfqsArray.value
    } catch (error) {
        console.error(error);
    }
};

const consultarPiezas = async () => {
    try {
        const response = await obtenerPorRFQ(idRFQ);
        piezas.value = response.data.body;
    } catch (error) {
        console.error(error);
    }
};

const consultarMateriales = async () => {
    try {
        const response = await obtenerMateriales();
        materiales.value = response.data.body;
    } catch (error) {
        console.log(error);
    }

};

const consultarPedidos = async () => {
    try {
        pedidos.value = await obtenerPedidos();
        pedidos.value = pedidos.value.data.body;
    } catch (error) {
        console.log(error);
    }
};

function obtenerIdPedido(noPedido) {
    let idPedido = null;
    pedidos.value.forEach((element) => {
        console.log(element.NoPedido)
        console.log(noPedido)
        if (element.NoPedido === noPedido) {
            idPedido = element.idPedido;
            return;
        }
    });
    return idPedido;
}

const obtenerRazonSocial = async (idUsuario) => {
    try {
        const usuario = await obtenerUnUser(idUsuario);
        const idCliente = usuario.idCliente;
        const cliente = await obtenerClientePorId(idCliente);
        return cliente.RazonSocial;
    } catch (error) {
        console.error(error);
        return 'Error obteniendo Razón Social';
    }
};

const obtenerFechaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const fechaActual = `${year}-${month}-${day}`;
    return fechaActual;
};

// Generar un nuevo número de pedido con el formato (Fecha-0001)
const generarNumeroPedido = () => {
    const today = new Date();
    const formattedCount = contadorPedido.value.toString().padStart(4, '0');
    const pedidoNumber = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${formattedCount}`;

    return pedidoNumber;
};

const modificarRFQ = async (idRFQ) => {
    try {
        setRFQ(idRFQ);
        router.push({ name: 'modificarCostosRFQ', params: { idRFQ: idRFQ } });
    } catch (error) {
        console.log(error);
    }
};

const abrirModalPedir = async (idRFQ) => {
    try {
        const response = await obtenerRFQ(idRFQ);
        console.log(response)
        const rfqs = response.data.body.filter(rfq => String(rfq.idRFQ) === idRFQ);
        console.log(rfqs)
        const rfqsDesplegados = rfqs;

        rfqSeleccionado.value = rfqsDesplegados.length > 0 ? rfqsDesplegados[0].NoRFQ : '';  // Asigna el valor del primer elemento o cadena vacía si no hay elementos
        costoSeleccionado.value = rfqsDesplegados.length > 0 ? rfqsDesplegados[0].CostoTotal : '';  // Asigna el valor del primer elemento o cadena vacía si no hay elementos

        // Abre el modal
        modalPedir.show();

        console.log(rfqSeleccionado.value); // Aquí deberías obtener el valor asignado correctamente
        console.log(costoSeleccionado.value)
    } catch (error) {
        console.log(error);
    }
};

const realizarInserciones = async () => {
    try {
        const noPedido = nuevoPedido.value;
        const fecha = obtenerFechaActual(); // Lógica para obtener la fecha actual                        

        console.log("NoPedido", noPedido);
        console.log("idUsuario", idUsuario);
        console.log("fecha", fecha);
        console.log("Entrega", fechaEntrega.value)
        console.log("Total", costoTotal.value)
        // // Agregar el pedido
        await agregarPedido(noPedido, idUsuario, fecha, fechaEntrega.value, costoTotal.value);
        await consultarPedidos();

        // Obtener el ID del Pedido recién insertado
        const idPedido = obtenerIdPedido(noPedido);
        console.log(idPedido);
        const pedidoNuevo = {
            idDetalle: 0,
            idPedido: idPedido,
            idRFQ: idRFQ,
            Cantidad: 1,
            costoUnitario: costoTotal.value
        };

        console.log(pedidoNuevo)
        await agregarDetalles(pedidoNuevo);
        await cambiarPedido(idRFQ);

    } catch (error) {
        console.error('Error al guardar los cambios:', error);
    }
};

const guardarCambios = async () => {
    try {
        await realizarInserciones(); // Realiza las inserciones o actualizaciones en la base de datos        
        // Incrementa el contador después de guardar los cambios
        modalPedir.hide();
        contadorPedido.value++;
        console.log(contadorPedido.value)
        localStorage.setItem('contadorPedido', contadorPedido.value.toString());

        const hoy = new Date();
        localStorage.setItem('fechaPedido', hoy.toDateString());
        console.log(contadorPedido.value)


        modal = new bootstrap.Modal(document.getElementById("modal"), {
            backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });
        modal.show(); //al ser todo exitoso, mostramos el modal notificando el exito
    } catch (error) {
        console.error(error);
    }
};

// Función que redirigue a la pantalla pedidos
function verPedidos() {
    modal.hide();
    router.push({ name: "pedidos" });
}

///////////////////////////////////////////////////////// FORMATO /////////////////////////////////////////////////////////////////////

// Da formato a la fecha
const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString(); // Format the date to a string
};

// Da formato a estado
const estadoText = computed(() => {
    return estatus.value === 1 ? 'Contestado' : (estatus.value === 0 ? 'En espera' : '');
});

const obtenerMaterial = (idMaterial) => {
    // Encuentra el objeto de material correspondiente al idMaterial
    const material = materiales.value.find(material => material.idMaterial === idMaterial);
    // Retorna el nombre del rol si se encuentra, o una cadena vacía si no
    return material ? material.Material : '';
};
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="rfq"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto position-relative">
        <router-link to="/rfq">
            <button class="btn btn-redondo position-absolute top-0 start-0 m-4">
                <i class="fas fa-arrow-left icono-blanco"></i>
            </button>
        </router-link>
        <div class="flex">
            <div class="left">
                <h2><b>N° RFQ: </b><span class="small-light">{{ noRFQ }}</span></h2>
                <h3 style="text-align: left!important; margin-left: 26px;"><b>Razón Social: &nbsp;</b> <span class="rs">{{
                    razonSocial
                }}</span></h3>
            </div>
            <div class="right">
                <h3><b>Fecha: &nbsp;</b> <span class="cuadro">{{ formatFecha(fecha) }}</span></h3>
                <h3><b>Estado: &nbsp;</b> <span class="cuadro">{{ estadoText }}</span></h3>
            </div>
        </div>
        <!-- tabla de piezas -->
        <div class="table-wrapper-scroll-y my-custom-scrollbar mx-auto"
            style="width: 90%; border: 1px solid gray; background-color:#f4f4f4;">
            <table class="table table-bordered mb-0 table-light">
                <thead class="thead-light " style="position: sticky; top: 0; text-align: center;">
                    <tr class="table-gray-border" st>
                        <th scope="col">N° Pieza</th>
                        <th scope="col">Material</th>
                        <th scope="col">Altura</th>
                        <th scope="col">Espesor</th>
                        <th scope="col">Largo</th>
                        <th scope="col">Diámetro</th>
                        <th scope="col">Cantidad</th>
                        <th scope="col">Comentarios</th>
                        <th scope="col">Costo Unitario</th>
                        <th scope="col">Importe</th>
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr v-for="pieza in piezas">
                        <td> {{ pieza.NoPiezaRFQ }} </td>
                        <td> {{ obtenerMaterial(pieza.idMaterial) }} </td>
                        <td>{{ pieza.Altura ? pieza.Altura : 'No aplica' }}</td>
                        <td> {{ pieza.Espesor ? pieza.Espesor : 'No aplica' }} </td>
                        <td> {{ pieza.Largo ? pieza.Largo : 'No aplica' }} </td>
                        <td> {{ pieza.Diametro ? pieza.Diametro : 'No aplica' }} </td>
                        <td> {{ pieza.Cantidad }} </td>
                        <td> {{ pieza.Comentarios }} </td>
                        <td> ${{ pieza.CostoUnitario }} </td>
                        <td> ${{ pieza.CostoUnitario ? pieza.Cantidad * pieza.CostoUnitario : "" }} </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex botones">
            <div class="left">
                <button v-if="estatus === 0 && visibleGestionar" class="btn" @click="modificarRFQ(idRFQ)"><i
                        class="fa-solid fa-pen-to-square text-gray"></i> &nbsp;Agregar Costos </button>
                <button v-if="estatus === 1 && estatusPedido === 0 && visiblePedir" class="btn btn-amarillo"
                    @click="abrirModalPedir(idRFQ)"><i class="fas fa-shopping-bag"></i> &nbsp;<b>Pedir</b> </button>
            </div>
            <div class="right">
                <h3><b>Total: &nbsp;</b> <span class="cuadro">${{ costoTotal }}</span></h3>
            </div>
        </div>
    </div>
    <!------------------------------------------------ Modal para pedir -------------------------------------------------->
    <div class="modal fade" id="modalPedir" tabindex="-1" aria-labelledby="modalPedirLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalPedirLabel">Pedido</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <span class="form-label" style="margin-bottom: 15px;">N° RFQ: </span> {{ rfqSeleccionado }}<br>
                    <span class="form-label">Costo Total:</span> {{ costoSeleccionado }}<br>
                    <label for="fechaEntrega" class="form-label">Fecha de Entrega: <input type="date" v-model="fechaEntrega"
                            class="form-control form-color" :min="obtenerFechaActual()" id="fechaEntrega" /></label>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary btn-yellow" :disabled="!fechaEntrega"
                        @click="guardarCambios">Pedir</button>
                </div>
            </div>
        </div>
    </div>
    <!---------------------------------------------- Modal --------------------------------------------------->
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">¡Pedido Realizado!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">El pedido "{{ nuevoPedido }}" fue creado exitosamente.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-yellow" data-bs-dismiss="modal" @click="verPedidos()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.form-color {
    width: 200px !important;
    height: auto !important;
    background-color: white;
    display: inline-block;
}

.btn-yellow {
    background-color: #FFCA0A;
    color: black;
    width: 90px;
    border: none;
}

.botones button {    
    margin-right: 15px;
    margin-left: 30px;
    margin-bottom: 20px;
    margin-top: 5px !important;
    height: 41.19px;    
    background-color: #f4f4f4;
    width: auto !important;
    border: 1px solid lightgray;
}

.icono-blanco {
    color: white;
}

.small-light {
    font-size: 22px;
    font-family: 'Barlow', sans-serif;
}

.cuadro {
    width: 110px;    
    display: inline-block;    
    background-color: #f4f4f4;
    font-size: 16px;
    text-align: center;
    color: rgb(85, 85, 85);
    padding: 10px;
    border: 1px rgb(159, 159, 159) solid;
    border-radius: 15px;
    margin-bottom: 10px;
}

.rs {
    width: auto;    
    display: inline-block;    
    background-color: #f4f4f4;
    font-size: 16px;
    text-align: center;
    color: rgb(85, 85, 85);
    padding-left: 15px !important;
    padding-right: 15px !important;
    padding: 10px;
    border: 1px rgb(159, 159, 159) solid;
    border-radius: 15px;
    margin-bottom: 10px;
}

.text-gray {
    color: gray;
}

.botones button {
    margin-top: 10px;    
    margin-right: 15px;    
    background-color: #f4f4f4;
    width: 120px;
    border: 1px solid lightgray;
}

h2 {
    text-transform: uppercase;
    font-family: 'Barlow', sans-serif;
    text-align: left;
    margin-left: 55px;
    margin-bottom: 22px;
}

h3 {
    font-family: 'Barlow', sans-serif;
    font-size: 18px;
    text-align: right;
    margin-top: 5px;
}

h5 {
    margin-top: 10px;
    font-family: 'Barlow', sans-serif;
    text-align: left;
    font-weight: 500;    
}

.icono-blanco {
    color: white;
}

.btn-redondo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 24px;
    background-color: #FFCA0A;    
}

.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: justify;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    height: auto;
    width: 90%;
}

.left,
.right {
    width: 50%;
    padding: 35px;
    padding-top: 30px !important;
    padding-bottom: 0px !important;
}

.flex {
    display: flex;
    justify-content: space-between;
}

.right {
    padding: 30px 61px 50px 50px;
}

.btn-amarillo {
    background-color: #FFCA0A !important;
    color: white !important;
    width: 90px;
    border: none !important;
}

.my-custom-scrollbar {
    position: relative;
    height: 205px;
    overflow: auto;
}

.table-wrapper-scroll-y {
    display: block;
}
</style>