<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { clientesStore } from "../stores/clientes";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerUsuarios, inactivar } = usuariosStore();
const { obtenerClientes, cambiarEstatus, eliminarCliente, setCliente } = clientesStore();

const visibleGestionar = ref("");
const Usuario = getUser();

const clientesArray = ref([]);
const clientesDesplegados = ref([]);

const idClienteCambiarEstatus = ref();
const estadoCambiarEstatus = ref(null);

const clienteExistente = ref(false);

const usuariosArray = ref([]);
const usuariosDesplegados = ref([]);
const usuariosObtenidos = ref([]);

let modalConfirmacion;
let nombre;

onMounted(async () => {
    try {
        // Carga clientes activos por defecto al entrar en la página
        filtrarClientes(1);

        // modal confirmar eliminar
        modalConfirmacion = new bootstrap.Modal(document.getElementById("modalConfirmacion"), {
            backdrop: "static", // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });

        // Permisos
        const idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);
        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Gestionar Clientes") ? visibleGestionar.value = true : visibleGestionar.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarClientes = async (activo) => {
    try {
        const response = await obtenerClientes(activo);
        const clientes = response.data.body.filter(cliente => cliente.Activo === activo);

        clientesArray.value = clientes;
        clientesDesplegados.value = clientesArray.value
    } catch (error) {
        console.error(error);
    }
};

const filtrarClientes = (activo) => {
    console.log(activo)
    consultarClientes(activo);
};

const botonesClases = computed(() => {
    return {
        activos: clientesDesplegados.value.some(cliente => cliente.Activo === 1),
        inactivos: clientesDesplegados.value.some(cliente => cliente.Activo === 0)
    };
});

// Función para actualizar la tabla al hacer una consulta
function actualizarTabla(nombre) {
    if (nombre.trim() === "") {
        clienteExistente.value = clientesArray.value;
        clientesDesplegados.value = clientesArray.value; // Restablece la tabla cuando el campo de búsqueda está vacío
    } else {
        clientesDesplegados.value = clientesArray.value.filter(cliente =>
            cliente.RazonSocial.toLowerCase().includes(nombre.toLowerCase()) || cliente.RFC.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}

const confirmar = (idCliente, estado) => {
    idClienteCambiarEstatus.value = idCliente;
    estadoCambiarEstatus.value = estado;
    // Muestra el modal de confirmación
    modalConfirmacion.show();
};

const consultarUsuarios = async (idCliente) => {
    try {
        const response = await obtenerUsuarios(idCliente);
        const usuarios = response.data.body.filter(user => user.idCliente === idCliente);

        usuariosArray.value = usuarios;
        usuariosDesplegados.value = usuariosArray.value
    } catch (error) {
        console.error(error);
    }
};

// Función para verificar si hay un usuario con un idCliente específico
const existeUsuarioConCliente = async (idCliente) => {
    await consultarUsuarios(idCliente);
    usuariosObtenidos.value = usuariosArray.value;
    console.log(idCliente)
    return usuariosObtenidos.value.length > 0;
};

async function cambiarEstatusClientes(idCliente, estado) {
    try {
        let usuariosConCliente = await existeUsuarioConCliente(idCliente);

        if (estado === 0) {
            if (usuariosConCliente) {
                // Guarda los usuarios obtenidos anteriormente
                const usuariosAnteriores = usuariosObtenidos.value;
                // Cambiar el estado sin eliminar el cliente
                await cambiarEstatus(idCliente, estado);
                // Filtrar clientes independientemente del estado
                filtrarClientes(estado);
                // Itera sobre los usuarios obtenidos antes del cambio de estado
                for (let i = 0; i < usuariosAnteriores.length; i++) {
                    const idUsuario = usuariosAnteriores[i].idUsuario;
                    await inactivar(idUsuario, estado);
                }
                alert("Cliente modificado a inactivos exitosamente.")

            } else {
                console.log('No hay usuarios usando el cliente');
                await eliminarCliente(idCliente);
                alert("Cliente eliminado permanentemente.")
                // Filtrar clientes independientemente del estado
                filtrarClientes(estado);
            }
        } else {
            // Guarda los usuarios obtenidos anteriormente
            const usuariosAnteriores = usuariosObtenidos.value;
            await cambiarEstatus(idCliente, estado);
            // Filtrar clientes independientemente del estado
            filtrarClientes(estado);
            // Itera sobre los usuarios obtenidos antes del cambio de estado
            for (let i = 0; i < usuariosAnteriores.length; i++) {
                const idUsuario = usuariosAnteriores[i].idUsuario;
                await inactivar(idUsuario, estado);
            }
            alert("Cliente modificado a activos exitosamente.")
        }
    } catch (error) {
        console.error(error);
    }
}

const modificarCliente = async (idCliente) => {
    try {
        setCliente(idCliente);
        router.push({ name: 'modificarCliente', params: { idCliente: idCliente } });
    } catch (error) {
        console.log(error);
    }
};
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="clientes"></cabecera>
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
                    <router-link to="clientes/agregarCliente" style="text-decoration: none;">
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
                <h1 class="titulo"><b>Clientes </b></h1>
                <div class="botones">
                    <button @click="filtrarClientes(1)"
                        :class="{ 'btn btn-verde': botonesClases.activos, 'btn btn-gris': !botonesClases.activos }">Activos</button>
                    <button @click="filtrarClientes(0)"
                        :class="{ 'btn btn-rojo': botonesClases.inactivos, 'btn btn-gris': !botonesClases.inactivos }">Inactivos</button>
                </div>
            </div>
        </div>
        <!-- tabla de roles -->
        <div class="table-wrapper-scroll-y my-custom-scrollbar mx-auto"
            style="width: 90%; border: 1px solid gray; background-color:#f4f4f4;">
            <table class="table table-bordered mb-0 table-light">
                <thead class="thead-light" style="position: sticky; top: 0;">
                    <tr class="table-gray-border" st>
                        <th scope="col">Razon Social</th>
                        <th scope="col">RFC</th>
                        <th scope="col">Dirección</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="cliente in clientesDesplegados">
                        <td> {{ cliente.RazonSocial }} </td>
                        <td> {{ cliente.RFC }} </td>
                        <td> {{ cliente.Calle }} #{{ cliente.Numero }}, {{ cliente.Colonia }}, {{ cliente.CP }} </td>
                        <th scope="row" style="width: 15vw;">
                            <div class="align-items-center" v-show="visibleGestionar">
                                <button class="btn btn-primary mx-1 btn-spacer" type="submit"
                                    style="background-color: hwb(0 96% 4%); border-color: #f4f4f4; height: 37px;"
                                    @click="modificarCliente(cliente.idCliente)">
                                    <i class="fa-solid fa-pen-to-square text-gray"></i>
                                </button>
                                <button v-if="cliente.Activo === 1 && visibleGestionar"
                                    class="btn btn-primary mx-1 btn-delete" type="submit"
                                    style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                    @click="confirmar(cliente.idCliente, 0)">
                                    <i class="fas fa-times text-gray"></i>
                                </button>
                                <button v-else-if="cliente.Activo === 0 && visibleGestionar"
                                    class="btn btn-primary mx-1 btn-restore" type="submit"
                                    style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                    @click="confirmar(cliente.idCliente, 1)">
                                    <i class="fas fa-check text-gray"></i>
                                </button>
                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
        <!---------------------------------------------- Acivar e inactivar ----------------------------------------------->
        <div class="modal fade" id="modalConfirmacion" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Estatus del Cliente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <span v-if="estadoCambiarEstatus === 0">¿Está seguro de que quiere eliminar este cliente?</span>
                        <span v-else>¿Está seguro de que quiere activar este cliente?</span>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal"
                            @click="cambiarEstatusClientes(idClienteCambiarEstatus, estadoCambiarEstatus)">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
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
    /* Establece el tipo de letra como Barlow */
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;    
    margin-left: 30px;
}

.botones button {
    margin-right: 10px;    
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

.btn-custom {
    background-color: #FFCA0A;
    color: white;
    border-color: #FFCA0A;
    height: 40px;
    width: 120px;    
    border-radius: 25px;
    font-family: 'Barlow', sans-serif;
}

.no-margin-top {
    margin-top: 0 !important;
}

.custom-container {
    height: 40px !important;    
}

.custom-container .input-group {
    height: 100%;    
}

.custom-container .form-control {
    height: 100%;    
}

.fa-plus-icon {
    font-weight: bold;
    transform: scale(1.2);    
}

.text-gray {
    color: gray;
}

.btn-verde {
    background-color: #E5FFE1;
    color: green;
    font-weight: bold;    
    width: 90px;
    border: none;
}

.btn-rojo {
    background-color: #FFE1E1;
    color: red;
    font-weight: bold;    
    width: 90px;
    border: none;
}

.btn-gris {
    background-color: #f4f4f4;
    color: black;
    width: 90px;
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
    /* Elimina el contorno y la sombra al hacer clic */
    outline: none;
    box-shadow: none;
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
