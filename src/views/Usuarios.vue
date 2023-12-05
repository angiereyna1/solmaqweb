<!-- /////////////////////////////////// TO DO //////////////////////////////////// -->
<!-- Agregar que se puede buscar también por apellidos -->
<!-- Agregar botón de desactivar -->
<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { rolesStore } from "../stores/roles";
import { clientesStore } from "../stores/clientes";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerUsuarios, obtenerIdPorUser, setIdUsuario, cambiarEstatus } = usuariosStore();
const { obtenerRoles } = rolesStore();
const { obtenerClientes } = clientesStore();


const Usuario = getUser();
const usuariosIds = ref({});
const usuarios = ref([]);
const usuariosArray = ref([]);
const usuariosDesplegados = ref([]);
const roles = ref([]); // Variable reactiva para almacenar los roles
const clientes = ref([]); // Variable reactiva para almacenar los clientes
const visibleGestionar = ref("");

const idUsuarioCambiarEstatus = ref();
const estadoCambiarEstatus = ref(null);


const usuarioExistente = ref(false);

let modalConfirmacion;
let nombre;

onMounted(async () => {
    try {
        await filtrarUsuarios(1);
        consultarUsuarios();
        consultarRoles();
        consultarClientes();

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
        permisos.includes("Gestionar Usuarios") ? visibleGestionar.value = true : visibleGestionar.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarRoles = async () => {
    // Aquí obtengo los roles para poder sacar el nombre del Rol        
    const response = await obtenerRoles();
    roles.value = response.data.body; // Almacena la lista de roles del cuerpo de la respuesta
};

const getNombreRol = (idRol) => {
    // Encuentra el objeto de rol correspondiente al idRol
    const rol = roles.value.find(rol => rol.idRol === idRol);
    // Retorna el nombre del rol si se encuentra, o una cadena vacía si no
    return rol ? rol.Rol : '';
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

const consultarUsuarios = async (activo) => {
    usuariosArray.value = [];
    usuariosIds.value = [];
    try {
        usuarios.value = await obtenerUsuarios(activo);
        const body = usuarios.value.data.body;
        console.log(usuarios.value);
        for (var j in body) {
            if (body[j].Activo == activo) {
                usuariosArray.value.push(body[j]);
            }
            usuariosIds.value.push(body[j].idUsuario)
        }
        usuariosDesplegados.value = usuariosArray.value;
    } catch (error) {
        console.log(error);
    }
};

const filtrarUsuarios = (activo) => {
    consultarUsuarios(activo);
}

const botonesClases = computed(() => {
    return {
        activos: usuariosDesplegados.value.some(usuario => usuario.Activo === 1),
        inactivos: usuariosDesplegados.value.some(usuario => usuario.Activo === 0)
    };
});

// Función principal para cambiar el estado de usuarios
async function cambiarEstatusUsuarios(idUsuario, estado) {
    try {
        await cambiarEstatus(idUsuario, !estado);
        await filtrarUsuarios(estado);

    } catch (error) {
        console.error(error);
    }
}


const confirmar = (idUsuario, estado) => {
    // Guarda el idUsuario y el estado en las referencias adecuadas
    idUsuarioCambiarEstatus.value = idUsuario;
    estadoCambiarEstatus.value = estado;
    // Muestra el modal de confirmación
    modalConfirmacion.show();
};

const modificarUsuario = async (idUsuario) => {
    try {
        setIdUsuario(idUsuario);
        router.push({ name: 'modificarUsuario', params: { idUsuario: idUsuario } });
    } catch (error) {
        console.log(error);
    }
};

function actualizarTabla(nombre) {
    if (nombre.trim() === "") {
        usuarioExistente.value = usuariosArray.value;
        usuariosDesplegados.value = usuariosArray.value; // Restablece la tabla cuando el campo de búsqueda está vacío
    } else {
        usuariosDesplegados.value = usuariosArray.value.filter(usr =>
            usr.Nombre.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="usuarios"></cabecera>
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
                    <router-link to="usuarios/agregarUsuario" style="text-decoration: none;">
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
                <h1 class="titulo"><b>Usuarios </b></h1>
                <div class="botones">
                    <button @click="filtrarUsuarios(1)"
                        :class="{ 'btn btn-verde': botonesClases.activos, 'btn btn-gris': !botonesClases.activos }">Activos</button>
                    <button @click="filtrarUsuarios(0)"
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
                        <th scope="col">Usuario</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Rol</th>
                        <th scope="col">Telefono</th>
                        <th scope="col">Correo</th>
                        <th scope="col">Razón Social</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="usuario in usuariosDesplegados">
                        <td> {{ usuario.Usuario }} </td>
                        <td> {{ usuario.Nombre }} {{ usuario.ApellidoP }} {{ usuario.ApellidoM }} </td>
                        <td> {{ getNombreRol(usuario.idRol) }} </td>
                        <td> {{ usuario.Telefono }} </td>
                        <td> {{ usuario.Correo }} </td>
                        <td>{{ getRazonSocial(usuario.idCliente) || 'No aplica' }}</td>
                        <th scope="row" style="width: 15vw;">
                            <div class="align-items-center" v-show="visibleGestionar">
                                <button class="btn btn-primary mx-1 btn-spacer" type="submit"
                                    style="background-color: hsl(0, 0%, 96%); border-color: #f4f4f4; height: 37px;"
                                    @click="modificarUsuario(usuario.idUsuario)">
                                    <i class="fa-solid fa-pen-to-square text-gray"></i>
                                </button>
                                
                                <button v-if="usuario.Activo === 1 && visibleGestionar" class="btn btn-primary mx-1 btn-delete" type="submit"
                                    style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                    @click="confirmar(usuario.idUsuario, usuario.Activo)">
                                    <i class="fas fa-times text-gray"></i>
                                </button>
                                <button v-else-if="usuario.Activo === 0 && visibleGestionar" class="btn btn-primary mx-1 btn-delete" type="submit"
                                    style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                    @click="confirmar(usuario.idUsuario, usuario.Activo)">
                                    <i class="fas fa-check text-gray"></i>
                                </button>
                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>

        </div>
    </div>

    <!-- Acivar e inactivar -->
    <div class="modal fade" id="modalConfirmacion" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Estatus del Usuario</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <span v-if="estadoCambiarEstatus === 1">¿Está seguro de que quiere inactivar este usuario?</span>
                    <span v-else>¿Está seguro de que quiere activar este usuario?</span>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal"
                        @click="cambiarEstatusUsuarios(idUsuarioCambiarEstatus, estadoCambiarEstatus)">
                        Confirmar
                    </button>
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
