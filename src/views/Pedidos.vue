<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { clientesStore } from "../stores/clientes";
import { pedidosStore } from "../stores/pedidos";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerClientes } = clientesStore();
const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerUsuarios, obtenerIdUsuarioPorUser } = usuariosStore();
const { obtenerPedidos, setPedido } = pedidosStore();

const visibleGestionar = ref("");
const Usuario = getUser();

const pedidos = ref([]);
const pedidosArray = ref([]);
const pedidosDesplegados = ref([]);
const pedidoExistente = ref(false);

const clientes = ref([]); // Variable reactiva para almacenar los clientes
const usuarios = ref([]);

let nombre;
let idRol = '';
let idUsuario = '';

onMounted(async () => {
    try {        
        await consultarClientes();
        await consultarUsuarios();        

        idUsuario = await obtenerIdUsuarioPorUser(Usuario);
        console.log(idUsuario);

        // Obtener el idRol y esperar a que esté lleno antes de filtrar los RFQs
        idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);

        // Verificar si idRol está lleno antes de filtrar los RFQs
        if (idRol !== '') {
            // Filtrar los RFQs solo si idRol está lleno
            await filtrarPedidos(0);
        }          

        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Gestionar Pedidos") ? visibleGestionar.value = true : visibleGestionar.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarPedidos = async (activo) => {
    pedidosArray.value = [];    
    try {
        pedidos.value = await obtenerPedidos(activo);
        const body = pedidos.value.data.body;
        console.log(pedidos.value);
        console.log(idRol);
        for (let j in body) {
            if ((idRol === 41 && body[j].idUsuario === idUsuario) || idRol !== 41) {
                // Si el idRol es 41 y el idUsuario coincide, o si el idRol no es 41, muestra los RFQ
                if (body[j].Estado === activo) {
                    pedidosArray.value.push(body[j]);
                }                
            }
        }
        pedidosDesplegados.value = pedidosArray.value;
        console.log(pedidosDesplegados.value)
    } catch (error) {
        console.log(error);
    }
};

const botonesClases = computed(() => {
    return {
        espera: pedidosDesplegados.value.some(pedido => pedido.Estado === 0),
        aprobados: pedidosDesplegados.value.some(pedido => pedido.Estado === 1),
        rechazados: pedidosDesplegados.value.some(pedido => pedido.Estado === 2)
    };
});

const filtrarPedidos = (activo) => {
    consultarPedidos(activo);
};

const consultarClientes = async () => {
    // Aquí obtengo los clientes para poder sacar la RazonSocial        
    const response = await obtenerClientes();
    clientes.value = response.data.body; // Almacena la lista de clientes del cuerpo de la respuesta
};

const getRazonSocial = (idCliente) => {
    // Encuentra el objeto de cliente correspondiente al idCliente
    const cliente = clientes.value.find(cliente => cliente.idCliente === idCliente);
    // Retorna la razonSocial si se encuentra, o una cadena vacía si no
    return cliente ? cliente.RazonSocial : '';
};

const consultarUsuarios = async () => {
    // Aquí obtengo los usuarios para poder sacar la RazonSocial        
    const response = await obtenerUsuarios();
    usuarios.value = response.data.body; // Almacena la lista de usuarios del cuerpo de la respuesta
};

const getUsuario = (idUsuario) => {
    // Encuentra el objeto de usuario correspondiente al idUsuario
    const usuario = usuarios.value.find(usuario => usuario.idUsuario === idUsuario);
    console.log(usuario ? usuario.idCliente : '');
    const razonSocial = getRazonSocial(usuario ? usuario.idCliente : '')
    console.log(razonSocial)
    // Retorna la razonSocial si se encuentra, o una cadena vacía si no
    return razonSocial;
};

const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString(); // Format the date to a string
};

const detallesPedido = async (idPedido) => {
    try {
        setPedido(idPedido);
        router.push({ name: 'detallesPedido', params: { id: idPedido } });
    } catch (error) {
        console.log(error);
    }
};

function actualizarTabla(nombre) {
    if (nombre.trim() === "") {
        pedidoExistente.value = pedidosArray.value;
        pedidosDesplegados.value = pedidosArray.value; // Restablece la tabla cuando el campo de búsqueda está vacío
    } else {
        pedidosDesplegados.value = pedidosArray.value.filter(pedifo =>
            pedifo.NoPedido.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="pedidos"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <!-- Primera parte del contenido: Barra de búsqueda -->
        <div class="buscador">
            <div style="justify-content: left;display: flex;width: 50%; margin-bottom: 15px;">
                <div class="container-fluid custom-container">
                    <div class="input-group mb-3">
                        <input id="buscador" type="text" class="form-control form-control-sm rounded-pill"
                            style="height: 40px; padding-right: 30px; padding-left: 30px; position: relative;"
                            placeholder="Buscar" v-model="nombre" @input="actualizarTabla(nombre)" />
                        <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%);">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Segunda parte del contenido: Tabla de consulta -->
        <div>
            <div class="table-container">
                <h1 class="titulo"><b>Pedidos </b></h1>                
            </div>
            <div style="display: inline; margin: auto;">
                <div class="second-level">
                    <button ref="espera" @click="filtrarPedidos(0)" class="btn" :class="{'btn-active' : botonesClases.espera}">En espera</button>
                    <button ref="aprobados" class="btn" @click="filtrarPedidos(1)" :class="{'btn-active' : botonesClases.aprobados }">Aprobados</button>
                    <button ref="rechazados" class="btn" @click="filtrarPedidos(2)" :class="{'btn-active' : botonesClases.rechazados}">Rechazados</button>
                </div>
            </div>
        </div>
        <!-- tabla de rfqs -->
        <div class="table-wrapper-scroll-y my-custom-scrollbar mx-auto"
            style="width: 90%; border: 1px solid gray; background-color:#f4f4f4;">
            <table class="table table-bordered mb-0 table-light">
                <thead class="thead-light" style="position: sticky; top: 0;">
                    <tr class="table-gray-border" st>
                        <th scope="col">N° Pedido</th>
                        <th scope="col">Razón Social</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Total</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="pedido in pedidosDesplegados">
                        <td> {{ pedido.NoPedido }} </td>
                        <td><span>{{ getUsuario(pedido.idUsuario) }}</span></td>
                        <td><span>{{ formatFecha(pedido.FechaPedido) }}</span></td>
                        <td> ${{ pedido.Total }} </td>
                        <th scope="row" style="width: 8vw;">
                            <div class="align-items-center">
                                <button class="btn btn-primary mx-1 btn-spacer" type="submit"
                                    style="background-color: hwb(0 96% 4%); border-color: #f4f4f4; height: 37px;"
                                    @click="detallesPedido(pedido.idPedido)">
                                    <i class="fas fa-eye text-gray"></i>
                                </button>
                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>    
</template>

<style scoped>
.second-level {
    display: flex;
    margin-left: 5%;
    margin-bottom: 2%;
}

.btn {
    width: 115px;
    height: 35px;
    border: none;
    background-color: white;
    color: rgb(130, 127, 127);
}

.btn-active {
    border-color: white;
    border-bottom: 3px solid #FFCA0A;
    font-weight: bold;
    border-radius: 0%;
    color: #FFCA0A;
}

.table-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.titulo {
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;
    margin-left: 30px;
}

.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: center;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
    height: 450px;
    width: 95%;
}

.buscador {
    display: flex;    
    align-items: center;            
    justify-content: space-between;
    border-bottom: 1px solid black;
    margin-bottom: 20px;
}

.custom-container {
    height: 40px !important;
    /* Otros estilos según sea necesario */
}

.custom-container .input-group {
    height: 100%;
    /* Asegura que la altura del input-group sea del 100% del contenedor */
}

.custom-container .form-control {
    height: 100%;
    /* Asegura que la altura del input sea del 100% del input-group */
}

.text-gray {
    color: gray;
}

.my-custom-scrollbar {
    position: relative;
    height: 205px;
    overflow: auto;
}

.table-wrapper-scroll-y {
    display: block;
}</style>
