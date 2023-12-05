<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { clientesStore } from "../stores/clientes";
import { rfqStore } from "../stores/rfq";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerClientes } = clientesStore();
const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerUsuarios, obtenerIdUsuarioPorUser } = usuariosStore();
const { obtenerRFQ, setRFQ } = rfqStore();

const visibleGestionar = ref("");
const Usuario = getUser();

const rfqs = ref([]);
const rfqsArray = ref([]);
const rfqsDesplegados = ref([]);

const campoVacio = ref(false);
const rfqExistente = ref(false);
const rfqsWithRazonSocial = ref([]);
const rfqsFiltrados = ref([]);

const clientes = ref([]); // Variable reactiva para almacenar los clientes
const usuarios = ref([]);

let modalConfirmacion;
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
            await filtrarRfqs(1);
        }

        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Gestionar RFQ") ? visibleGestionar.value = true : visibleGestionar.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarRfqs = async (activo) => {
    rfqsArray.value = [];    
    try {
        rfqs.value = await obtenerRFQ(activo);
        const body = rfqs.value.data.body;
        console.log(rfqs.value);
        console.log(idRol);
        for (var j in body) {
            if ((idRol === 41 && body[j].idUsuario === idUsuario) || idRol !== 41) {
                // Si el idRol es 41 y el idUsuario coincide, o si el idRol no es 41, muestra los RFQ
                if (body[j].Estatus === activo) {
                    rfqsArray.value.push(body[j]);
                }                
            }
        }
        rfqsDesplegados.value = rfqsArray.value;
        console.log(rfqsDesplegados.value)
    } catch (error) {
        console.log(error);
    }
};


const botonesClases = computed(() => {
    return {
        activos: rfqsDesplegados.value.some(rfq => rfq.Estatus === 1),
        inactivos: rfqsDesplegados.value.some(rfq => rfq.Estatus === 0)
    };
});

const filtrarRfqs = (activo) => {
    consultarRfqs(activo);
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

const detallesRFQ = async (idRFQ) => {
    try {
        setRFQ(idRFQ);
        router.push({ name: 'detallesRFQ', params: { id: idRFQ } });
    } catch (error) {
        console.log(error);
    }
};

function actualizarTabla(nombre) {
    if (nombre.trim() === "") {
        rfqExistente.value = rfqsArray.value;
        rfqsDesplegados.value = rfqsArray.value; // Restablece la tabla cuando el campo de búsqueda está vacío
    } else {
        rfqsDesplegados.value = rfqsArray.value.filter(rfq =>
            rfq.NoRFQ.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="rfq"></cabecera>
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
            <div style="justify-content: right; display: flex; width: 50%; margin-bottom: 15px;">
                <div>
                    <router-link to="rfq/agregarRFQ" style="text-decoration: none;">
                        <button v-show="visibleGestionar" class="btn btn-custom btn-sm mt-2 no-margin-top" type="submit">
                            <b>Agregar &nbsp;</b><i class="fas fa-plus fa-plus-icon"></i>
                        </button>
                    </router-link>
                </div>
            </div>
        </div>
        <!-- Segunda parte del contenido: Tabla de consulta -->
        <div>
            <div class="table-container">
                <h1 class="titulo"><b>RFQ </b></h1>
                <div class="botones">
                    <button @click="filtrarRfqs(1)"
                        :class="{ 'btn btn-verde': botonesClases.activos, 'btn btn-gris': !botonesClases.activos }">Contestados</button>
                    <button @click="filtrarRfqs(0)"
                        :class="{ 'btn btn-rojo': botonesClases.inactivos, 'btn btn-gris': !botonesClases.inactivos }">En
                        espera</button>
                </div>
            </div>
        </div>
        <!-- tabla de rfqs -->
        <div class="table-wrapper-scroll-y my-custom-scrollbar mx-auto"
            style="width: 90%; border: 1px solid gray; background-color:#f4f4f4;">
            <table class="table table-bordered mb-0 table-light">
                <thead class="thead-light" style="position: sticky; top: 0;">
                    <tr class="table-gray-border" st>
                        <th scope="col">N° RFQ</th>
                        <th scope="col">Razón Social</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Costo Total</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="rfq in rfqsDesplegados">
                        <td> {{ rfq.NoRFQ }} </td>
                        <td><span>{{ getUsuario(rfq.idUsuario) }}</span></td>
                        <td><span>{{ formatFecha(rfq.FechaRFQ) }}</span></td>
                        <td> ${{ rfq.CostoTotal }} </td>
                        <th scope="row" style="width: 8vw;">
                            <div class="align-items-center">
                                <button class="btn btn-primary mx-1 btn-spacer" type="submit"
                                    style="background-color: hwb(0 96% 4%); border-color: #f4f4f4; height: 37px;"
                                    @click="detallesRFQ(rfq.idRFQ)">
                                    <i class="fas fa-eye text-gray"></i>
                                    <!-- <i class="fas fa-info-circle text-gray"></i> -->
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
.table-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2%;
}

.titulo {
    font-family: 'Barlow', sans-serif;
    /* Establece el tipo de letra como Barlow */
    font-size: 30px;
    margin-right: 20px;
    /* Espacio entre el título y los botones */
    margin-left: 30px;
    /* Espacio entre el título y los botones */
}

.botones button {
    margin-right: 10px;
    /* Espacio entre los botones */
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
    /* Centra el div horizontalmente */
    justify-content: space-between;
    border-bottom: 1px solid black;
    margin-bottom: 20px;
}
.btn-custom {
    background-color: #FFCA0A;
    color: white;
    border-color: #FFCA0A;
    height: 40px;
    width: 120px;
    /* Iguala la altura del botón con el input de búsqueda */
    border-radius: 25px;
    font-family: 'Barlow', sans-serif;
}

.no-margin-top {
    margin-top: 0 !important;
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

.fa-plus-icon {
    font-weight: bold;
    transform: scale(1.2);
    /* Ajusta este valor para hacer el ícono más grueso */
}

.text-gray {
    color: gray;
}

.btn-verde {
    background-color: #E5FFE1;
    color: green;
    font-weight: bold;
    /* Agrega esta línea para cambiar la letra a negrita */
    width: auto;
    border: none;
}

.btn-rojo {
    background-color: #FFE1E1;
    color: red;
    font-weight: bold;
    /* Agrega esta línea para cambiar la letra a negrita */
    width: auto;
    border: none;
}

.btn-gris {
    background-color: #f4f4f4;
    color: black;
    width: auto;
    border: none;
}

.btn-amarillo {
    background-color: #FFCA0A;
    color: black;
    width: 90px;
    border: none;
}

.btn-verde:focus,
.btn-rojo:focus,
.btn-amarillo:focus,
.btn-gris:focus {
    outline: none;
    box-shadow: none;
    /* Elimina el contorno y la sombra al hacer clic */
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
