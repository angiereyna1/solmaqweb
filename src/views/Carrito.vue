<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { carritoStore } from '../stores/carrito'; // Importa el store del carrito
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { pedidosStore } from "../stores/pedidos";
import { detallePedidoStore } from "../stores/detallesPedido";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerIdUsuarioPorUser } = usuariosStore();
const { obtenerCarrito, vaciarCarrito } = carritoStore();
const { agregarPedido, obtenerPedidos } = pedidosStore();
const { agregarDetalles } = detallePedidoStore();

const carritoItems = ref([]); // Referencia reactiva para almacenar los elementos del carrito
const fechaEntrega = ref(""); // Nueva referencia reactiva para la fecha de entrega
const pedidos = ref([]);
const visibleGestionar = ref("");
const Usuario = getUser();
const nuevoPedido = ref('');
const contadorPedido = ref(1);

// Declaración del modal
let modal;
let idUsuario = '';

onMounted(async () => {
    try {
        // Obteniendo el contador
        const today = new Date();
        const fecha = localStorage.getItem('fechaPedido');
        const count = localStorage.getItem('contadorPedido');
        // Si el contador esta vacio o es otro día reiniciar el contador a 1
        if (!count || fecha !== today.toDateString()) {
            contadorPedido.value = 1;
        } else {
            // Si no obtener el contador
            contadorPedido.value = parseInt(count);
        }

        idUsuario = await obtenerIdUsuarioPorUser(Usuario);
        console.log(idUsuario);

        // Llama a la función para obtener los elementos del carrito
        obtenerCart();

        nuevoPedido.value = generarNumeroPedido();
        console.log(nuevoPedido.value)

        // Permisos
        const idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);
        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Gestionar Catalogo") ? visibleGestionar.value = true : visibleGestionar.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarPedidos = async () => {
    try {
        pedidos.value = await obtenerPedidos();
        pedidos.value = pedidos.value.data.body;
        console.log(pedidos.value);
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

const obtenerCart = async () => {
    try {
        const response = await obtenerCarrito(idUsuario);
        console.log(response)
        carritoItems.value = response;
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
    }
};

// Calcular el total de carrito
const total = computed(() => {
    let sum = 0;
    carritoItems.value.forEach(item => {
        sum += item.cantidad * item.precio;
    });
    return sum;
});

// Eliminar pieza de carrito
const eliminarItem = (index) => {
    carritoItems.value.splice(index, 1);
};

// Generar un nuevo número de pedido con el formato (Fecha-0001)
const generarNumeroPedido = () => {
    const today = new Date();
    const formattedCount = contadorPedido.value.toString().padStart(4, '0');
    const pedidoNumber = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${formattedCount}`;

    return pedidoNumber;
};

const obtenerFechaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const fechaActual = `${year}-${month}-${day}`;
    return fechaActual;
};


const realizarInserciones = async () => {
    try {
        // Obtener el nuevo RFQ y fecha (reemplaza esto con tu lógica real)
        const noPedido = nuevoPedido.value;
        const fecha = obtenerFechaActual(); // Lógica para obtener la fecha actual                
        console.log(fechaEntrega.value)

        console.log(noPedido);
        console.log(fecha);
        console.log(idUsuario);
        console.log(total.value)

        // Agregar el pedido
        await agregarPedido(noPedido, idUsuario, fecha, fechaEntrega.value, total.value);

        await consultarPedidos();

        // Obtener el ID del Pedido recién insertado
        const idPedido = await obtenerIdPedido(noPedido);
        console.log(idPedido);

        if (Array.isArray(carritoItems.value)) {
            // Recorrer cada pieza guardada para insertarlas en la base de datos
            for (const pieza of carritoItems.value) {
                console.log("Agregando")
                console.log(pieza.id);
                console.log(pieza.cantidad);
                console.log(pieza.precio)

                const pedidoNuevo = {
                    idDetalle: 0,
                    idPedido: idPedido,
                    idPiezaCatalogo: pieza.id,
                    Cantidad: pieza.cantidad,
                    costoUnitario: pieza.precio
                };
                // Agregar el pedido
                await agregarDetalles(pedidoNuevo);
            }
        } else {
            console.error('piezasGuardadas no es un array');
        }
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
    }
};

const guardarCarro = async () => {
    try {
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });
        // Al ser todo exitoso, mostramos el modal notificando el exito
        modal.show();
        // Realiza las inserciones o actualizaciones en la base de datos
        await realizarInserciones();

        // Incrementa el contador después de guardar los cambios
        contadorPedido.value++;
        console.log(contadorPedido.value)
        localStorage.setItem('contadorPedido', contadorPedido.value.toString());

        const hoy = new Date();
        localStorage.setItem('fechaPedido', hoy.toDateString());
        console.log(contadorPedido.value)
        vaciarCarrito(idUsuario);
    } catch (error) {
        console.error(error);
    }
};

// Función que redirigue a la pantalla pedidos
function verPedidos() {
    modal.hide();
    router.push({ name: "pedidos" });
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto position-relative">
        <router-link to="/rfq">
            <button class="btn btn-redondo position-absolute top-0 start-0 m-4">
                <i class="fas fa-arrow-left icono-blanco"></i>
            </button>
        </router-link>
        <div>
            <h2><b>Carrito</b></h2>
        </div>
        <!-- Iterate over carritoItems and display each item -->
        <div class="card-body p-0">
            <div class="row g-0">
                <div class="col-lg-8" style="width: 100%;">
                    <div class="p-5" style="width: 100%; padding-top: 35px!important; padding-bottom: 30px!important;">
                        <div v-if="carritoItems.length > 0">
                            <!-- Display cart items as a horizontal list -->
                            <ul class="list-group">
                                <li class="list-group-item flex-container" v-for="(item, index) in carritoItems"
                                    :key="index">
                                    <button @click="eliminarItem(index)" class="btn btn-quitar">
                                        <i class="fas fa-times text-gray"></i>
                                    </button>
                                    <img class="pic-1" :src="`http://localhost:4000/images/${item.foto}`"
                                        alt="Imagen de la pieza">
                                    <div class="item-details">
                                        <h5 class="mb-1">{{ item.codigo }}</h5>
                                        <div class="item-quantity">
                                            <label :for="'cantidad_' + index">Cantidad:</label>
                                            <input :id="'cantidad_' + index" class="form-control form-color"
                                                style="padding-right: 5px;" type="number" v-model="item.cantidad" min="1" />
                                        </div>
                                    </div>
                                    &nbsp;
                                    <div class="item-precio">
                                        <span :id="'precio_' + index" style="margin: 0px;"> x {{ item.precio }}</span>
                                        <hr style="background-color: #7d7d7d; height: 1.5px; border: none; margin: 0px;">
                                        <span :id="'precioCantidad_' + index" style="margin: 0px;"> = {{ item.cantidad *
                                            item.precio }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div v-else class="vacio">
                            <h3> <i class="fas fa-shopping-cart text-gray"></i> &nbsp;Tu carrito está vacío.</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex">
            <div class="left">
                <p>Fecha de Entrega: &nbsp;<input type="date" v-model="fechaEntrega" :min="obtenerFechaActual()"
                        class="form-control form-color" /></p>
            </div>
            <div class="right">
                <p><b>Total: &nbsp;</b> <span class="cuadro">${{ total }}</span></p>
                <div class="botones">
                    <router-link to="/catalogo">
                        <button>Seguir pidiendo</button>
                    </router-link>
                </div>
                <div class="btn-amarillo">
                    <button :disabled="carritoItems.length === 0 || !fechaEntrega"
                        :class="{ 'btn-pedir-disabled': carritoItems.length === 0 || !fechaEntrega }" @click="guardarCarro">
                        Pedir
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!------------------------------------------------------ Modal ------------------------------------------------------------------->
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
.btn-yellow {
    background-color: #FFCA0A;
    color: black;
    width: 90px;
    border: none;
}

.btn-pedir-disabled {
    background-color: black;
    background-color: #FFD700;
    /* Cambiar el cursor para indicar que el botón no está activo */
    cursor: not-allowed;
    opacity: 0.6;
}

.vacio {
    border: 1px solid lightgray;
    border-radius: 6px;
    padding: 50px;
}

.botones button {
    margin-top: 20px !important;
    font-family: 'Barlow', sans-serif;
    font-size: 16px;
    margin-top: 10px;
    background-color: #f4f4f4;
    padding: 8px;
    ;
    width: 193.2px;
    border: 1px solid lightgray;
    border-radius: 6px;
}

.btn-amarillo button {
    margin-top: 15px !important;
    font-family: 'Barlow', sans-serif;
    font-size: 16px;
    margin-top: 10px;
    background-color: #FFCA0A;
    width: 193.2px;
    padding: 8px;
    border: none;
    border-radius: 6px;
}

.cuadro {
    width: 130px;
    display: inline-block;
    background-color: #f4f4f4;
    font-size: 16px;
    text-align: center;
    color: rgb(60, 60, 60);
    padding: 5px;
    border: 1px rgb(159, 159, 159) solid;
    border-radius: 6px;
}

.form-color {
    width: 200px !important;
    height: auto !important;
    background-color: #f4f4f4;
    border-color: #afafaf;
    display: inline-block;
}

p {
    font-family: 'Barlow', sans-serif;
    font-size: 18px;
    margin-bottom: 0px;
}

.left {
    width: 50%;
    padding-left: 50px;
    padding-bottom: 20px;
}

.right {
    width: 50%;
    padding-right: 50px;
    padding-bottom: 20px;
    text-align: right;
}


.flex {
    display: flex;
    justify-content: space-between;
}


.form-color {
    background-color: #f4f4f4;
    width: 65px;
    height: 28px;
    border-color: #afafaf;
}


.item-quantity {
    display: flex;
    align-items: center;
}

.item-precio {
    text-align: right;
    width: 120px;
}

.item-details {
    flex: 1;
    margin-left: auto;
    padding-right: 15px;
}

.item-quantity label {
    margin-bottom: 0px !important;
    margin-right: 10px;
}

.list-group-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-left: none;
    border-right: none;
    border-color: gray;
    border-radius: 0;
}

.flex-container {
    list-style: none;
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pic-1 {
    width: 80px;
    height: 80px;
    margin-right: 10px;
}

.icono-blanco {
    color: white;
}

h2 {
    font-family: 'Barlow', sans-serif;
    font-size: 33px;
    text-align: left;
    margin-left: 100px;
    margin-top: 30px !important;
}

.btn-redondo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 24px;
    background-color: #FFCA0A;
}

.contenido {
    margin-top: 1%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: justify;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    height: auto;
    width: 95%;
}

.btn-quitar {
    background-color: transparent;
    border: none;
    cursor: pointer;
}
</style>