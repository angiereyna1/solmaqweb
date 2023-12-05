<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { useRoute } from 'vue-router';
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { clientesStore } from "../stores/clientes";
import { pedidosStore } from "../stores/pedidos";
import { detallePedidoStore } from "../stores/detallesPedido"
import { catalogoStore } from "../stores/catalogo"
import { rfqStore } from "../stores/rfq"
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerUnUser } = usuariosStore();
const { obtenerPedidoPorId, cambiarEstatus } = pedidosStore();
const { obtenerPorPedido } = detallePedidoStore();
const { obtenerClientePorId } = clientesStore();
const { obtenerRFQ } = rfqStore();
const { obtenerPiezas } = catalogoStore();

const route = useRoute();

const visibleGestionar = ref("");
const visiblePedir = ref("");
const Usuario = getUser();

const rfqs = ref([]); // Variable reactiva para almacenar los rfq
const piezas = ref([]);

const idPedido = route.params.id;

//variables reactivas
const noPedido = ref("");
const razonSocial = ref("");
const fecha = ref("");
const total = ref("");
const estatus = ref("");

const estatusSeleccionado = ref("");


const piezasCatalogo = ref([]);

// Declaración del modal
let modal;
let modalCambiar;

onMounted(async () => {
    try {
        await consultarPiezas();
        await consultarRFQ();
        await consultarCatalogo();

        const pedido = await obtenerPedidoPorId(idPedido);


        // // llenar variables reactivas
        noPedido.value = pedido.NoPedido || "";
        fecha.value = pedido.FechaEntrega || "";
        estatus.value = pedido.Estado;
        console.log(pedido.idUsuario);
        razonSocial.value = await obtenerRazonSocial(pedido.idUsuario)
        total.value = pedido.Total || "";

        // Inicialización del modalPedir
        modalCambiar = new bootstrap.Modal(document.getElementById('modalCambiar'), {
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

const consultarPiezas = async () => {
    try {
        const response = await obtenerPorPedido(idPedido);
        piezas.value = response.data.body;
    } catch (error) {
        console.error(error);
    }
};

const consultarRFQ = async () => {
    try {
        const response = await obtenerRFQ();
        rfqs.value = response.data.body;
    } catch (error) {
        console.error(error);
    }

};

const consultarCatalogo = async () => {
    try {
        const response = await obtenerPiezas();
        piezasCatalogo.value = response.data.body;
    } catch (error) {
        console.error(error);
    }
};

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

const abrirModalCambiar = async () => {
    // Abre el modal
    modalCambiar.show();

};

const guardarEstatus = async () => {
    try {
        console.log("idPedido:", idPedido)
        console.log("Seleccionado", estatusSeleccionado.value);
        if (estatusSeleccionado.value === 'Aprobar Pedido') {            
            await cambiarEstatus(idPedido, 1);
            modalCambiar.hide();
        } else {            
            await cambiarEstatus(idPedido, 2);
            modalCambiar.hide();
        }
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });
        // Al ser todo exitoso, mostramos el modal notificando el exito
        modal.show(); 
    } catch (error) {
        console.error(error);
    }
};

// Función que redirigue a la pantalla pedidos
function cerrar() {
    modal.hide();
    router.push({ name: "pedidos" });
    estatusSeleccionado.value = "";
}

///////////////////////////////////////////////////////// FORMATO /////////////////////////////////////////////////////////////////////

// Da formato a la fecha
const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString(); // Format the date to a string
};

// Da formato a estado
const estadoText = computed(() => {
    return estatus.value === 0 ? 'En espera' : (estatus.value === 1 ? 'Aprobado' : (estatus.value === 2 ? 'Rechazado' : ''));
});

const obtenerNoRFQ = (idRFQ) => {
    // Encuentra el objeto de material correspondiente al idMaterial
    const rfq = rfqs.value.find(rfq => rfq.idRFQ === idRFQ);
    // Retorna el nombre del rol si se encuentra, o una cadena vacía si no
    return rfq ? "RFQ: " + rfq.NoRFQ : '';
};

const obtenerNoPieza = (idPiezaCatalogo) => {
    // Encuentra el objeto de material correspondiente al idMaterial
    const pieza = piezasCatalogo.value.find(pieza => pieza.idPieza === idPiezaCatalogo);
    // Retorna el nombre del rol si se encuentra, o una cadena vacía si no
    return pieza ? pieza.NoPieza : '';
};
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="pedidos"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto position-relative">
        <router-link to="/pedidos">
            <button class="btn btn-redondo position-absolute top-0 start-0 m-4">
                <i class="fas fa-arrow-left icono-blanco"></i>
            </button>
        </router-link>
        <div class="flex">
            <div class="left">
                <h2><b>N° Pedido: </b><span class="small-light">{{ noPedido }}</span></h2>
                <h3 style="text-align: left!important; margin-left: 26px;"><b>Razón Social: &nbsp;</b> <span class="rs">{{
                    razonSocial
                }}</span></h3>
            </div>
            <div class="right">
                <h3><b>Fecha de Entrega: &nbsp;</b> <span class="cuadro">{{ formatFecha(fecha) }}</span></h3>
                <h3><b>Estado: &nbsp;</b> <span class="cuadro">{{ estadoText }}</span></h3>
            </div>
        </div>
        <!-- tabla de piezas -->
        <div class="table-wrapper-scroll-y my-custom-scrollbar mx-auto"
            style="width: 90%; border: 1px solid gray; background-color:#f4f4f4;">
            <table class="table table-bordered mb-0 table-light">
                <thead class="thead-light " style="position: sticky; top: 0; text-align: center;">
                    <tr class="table-gray-border" st>
                        <th scope="col">N°</th>
                        <th scope="col">Concepto</th>
                        <th scope="col">Cantidad</th>
                        <th scope="col">Costo Unitario</th>
                        <th scope="col">Importe</th>
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr v-for="pieza in piezas">
                        <td> 1 </td>
                        <td> {{ obtenerNoPieza(pieza.idPiezaCatalogo) || obtenerNoRFQ(pieza.idRFQ) }}</td>
                        <td> {{ pieza.Cantidad }} </td>
                        <td> ${{ pieza.costoUnitario }} </td>
                        <td> ${{ pieza.Cantidad * pieza.costoUnitario }} </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex botones">
            <div class="left">
                <button v-if="estatus === 0 && visibleGestionar" class="btn" @click="abrirModalCambiar()"><i
                        class="fa-solid fa-pen-to-square text-gray"></i> &nbsp;Cambiar Estatus </button>
            </div>
            <div class="right">
                <h3><b>Total: &nbsp;</b> <span class="cuadro">${{ total }}</span></h3>
            </div>
        </div>
    </div>
    <!----------------------------------------------- Modal para cambiar --------------------------------------------->
    <div class="modal fade" id="modalCambiar" tabindex="-1" aria-labelledby="modalCambiarLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalCambiarLabel">Cambiar Estatus</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3 text-start">
                        <label for="estatus" class="form-label">Estatus Pedido</label>
                        <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                            v-model="estatusSeleccionado" required id="estatus">
                            <option>Aprobar Pedido</option>
                            <option>Rechazar Pedido</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary btn-yellow" @click="guardarEstatus"
                        :disabled="!estatusSeleccionado">Guardar</button>
                </div>
            </div>
        </div>
    </div>
    <!------------------------------------------------------------ Modal ------------------------------------------------------>
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">¡Estatus Cambiado!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">El estatus del pedido "{{ noPedido }}" fue cambiado
                    exitosamente.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-yellow" data-bs-dismiss="modal" @click="cerrar()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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

.principal {
    width: 80%;
    height: 400px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);    
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