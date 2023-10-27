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
const { obtenerIdPorUser, obtenerUsuarios } = usuariosStore();
const { obtenerClientes, cambiarEstatus, eliminarCliente, setCliente } = clientesStore();

const visibleGestionar = ref("");
const Usuario = getUser();
const clientesIds = ref({});
const clientes = ref([]);
const clientesArray = ref([]);
const clientesDesplegados = ref([]);
const buscador = ref({});
const idClienteCambiarEstatus = ref();
const estadoCambiarEstatus = ref(null);
const nuevoCliente = ref(""); // variable para almacenar el nuevo cliente
const campoVacio = ref(false);
const clienteExistente = ref(false);

const usuariosIds = ref({});
const usuarios = ref([]);
const usuariosArray = ref([]);
const usuariosDesplegados = ref([]);

let modalConfirmacion;
let nombre;

onMounted(async () => {
    try {
        // Carga clientes activos por defecto al entrar en la página
        await filtrarClientes(1);
        consultarClientes();

        // modal confirmar eliminar
        modalConfirmacion = new bootstrap.Modal(document.getElementById("modalConfirmacion"), {
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
    clientesArray.value = [];
    clientesIds.value = [];
    try {
        clientes.value = await obtenerClientes(activo);
        const body = clientes.value.data.body;
        console.log(clientes.value);
        for (var j in body) {
            if (body[j].Activo == activo) {
                clientesArray.value.push(body[j]);
            }
            clientesIds.value.push(body[j].idCliente)
        }
        clientesDesplegados.value = clientesArray.value;
    } catch (error) {
        console.log(error);
    }
};

const filtrarClientes = (activo) => {
    consultarClientes(activo);
};

const botonesClases = computed(() => {
    return {
        activos: clientesDesplegados.value.some(cliente => cliente.Activo === 1),
        inactivos: clientesDesplegados.value.some(cliente => cliente.Activo === 0)
    };
});

const confirmar = (idCliente, estado) => {
    // Guarda el idCliente y el estado en las referencias adecuadas
    idClienteCambiarEstatus.value = idCliente;
    estadoCambiarEstatus.value = estado;
    // Muestra el modal de confirmación
    modalConfirmacion.show();
};

const consultarUsuarios = async (idCliente) => {
    usuariosArray.value = [];
    usuariosIds.value = [];
    try {
        usuarios.value = await obtenerUsuarios(idCliente);
        const body = usuarios.value.data.body;
        console.log(usuarios.value);
        for (var j in body) {
            if (body[j].idCliente == idCliente) {
                usuariosArray.value.push(body[j]);
            }
            usuariosIds.value.push(body[j].idUsuario)
        }
        usuariosDesplegados.value = usuariosArray.value;
        console.log(usuariosDesplegados.value)
    } catch (error) {
        console.log(error);
    }
};

// Función para verificar si hay un usuario con un idCliente específico
const existeUsuarioConCliente = async (idCliente) => {
    await consultarUsuarios(idCliente);
    const usuariosObtenidos = usuariosArray.value;
    console.log(idCliente)
    console.log(usuariosObtenidos)
    return usuariosObtenidos.length > 0;
};

// Función principal para cambiar el estado de clientes
async function cambiarEstatusClientes(idCliente, estado) {
    try {
        if (estado === 0) {
            if (await existeUsuarioConCliente(idCliente)) {
                // Cambiar el estado sin eliminar el cliente
                await cambiarEstatus(idCliente, estado);
            } else {
                console.log('No hay usuarios usando el cliente');
                console.log(idCliente)
                await eliminarCliente(idCliente);
            }
        } else {
            await cambiarEstatus(idCliente, estado);
        }
        // Filtrar clientes independientemente del estado
        await filtrarClientes(!estado);

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
        <div class="navbar">
            <div style="justify-content: left;display: flex;width: 50%; margin-bottom: 8px;">
                <div class="container-fluid custom-container">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control form-control-sm rounded-pill"
                            style="height: 40px; padding-right: 30px; padding-left: 30px; position: relative;"
                            placeholder="Buscar" v-model="nombre" @input="actualizarTabla(nombre)" />
                        <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%);">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div style="justify-content: right; display: flex; width: 50%; margin-bottom: 8px;">
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
                        <td> {{ cliente.Calle }} {{ cliente.Numero }} {{ cliente.Colonia }} {{ cliente.CP }} </td>
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

        <!-- Acivar e inactivar -->
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

.navbar {
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

.align-self-stretch {
    align-self: stretch;
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
    width: 90px;
    border: none;
}

.btn-rojo {
    background-color: #FFE1E1;
    color: red;
    font-weight: bold;
    /* Agrega esta línea para cambiar la letra a negrita */
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
