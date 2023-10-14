<script setup>
import { ref, computed, onMounted } from "vue";
import { permisosRolesStore } from "../stores/permisosRoles";
import { rolesStore } from "../stores/roles";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { getPermisos } = loginStore();

const { obtenerRoles } = rolesStore();
const { reanudarSesion } = loginStore();
const { verificarPermisos } = loginStore();
const { obtenerPermisosDelRol } = permisosRolesStore();
const { eliminarPermisosDelRol } = permisosRolesStore();
const { eliminarRol } = rolesStore();
const { agregarRol } = rolesStore();
const { actualizarRol } = rolesStore();
const { setRol } = rolesStore();

const rolDir = ref({});
const buscador = ref({});
const roles = ref([]);
const rolesArray = ref([]);
const rolesDesplegados = ref([]);
const permisosDeRolArray = ref([]);
const idRolEliminar = ref();
const nuevoRol = ref(""); // Variable para almacenar el nuevo rol
const campoVacio = ref(false);
const rolExistente = ref(false);

const visibleGestionar = ref("");

var modal;
var modalConfirmacion;
var modalAgregarRol;
var nombre;
var modalEditarRol;

const rolSeleccionado = ref({
    id: null,
    nombre: ''
    // Otros campos del rol que deseas editar
});




onMounted(async () => {
    await filtrarRoles(1); // Cargar roles activos por defecto al entrar en la página
    consultarRoles();

    modalAgregarRol = new bootstrap.Modal(document.getElementById("modalAgregarRol"), {
        keyboard: false,
    });

    // Agrega el event listener para el evento hidden.bs.modal
    modalAgregarRol._element.addEventListener('hidden.bs.modal', () => {
        nuevoRol.value = ''; // Limpiar el campo del nuevo rol cuando el modal se cierra
        rolExistente.value = false; // Resetear la variable de rolExistente
        campoVacio.value = false; // Resetear la variable de campoVacio
    });

    modalEditarRol = new bootstrap.Modal(document.getElementById("modalEditarRol"), {
        keyboard: false,
    });

    // Agrega el event listener para el evento hidden.bs.modal
    modalEditarRol._element.addEventListener('hidden.bs.modal', () => {
        nuevoRol.value = ''; // Limpiar el campo del nuevo rol cuando el modal se cierra
        rolExistente.value = false; // Resetear la variable de rolExistente
        campoVacio.value = false; // Resetear la variable de campoVacio
    });

    modal = new bootstrap.Modal(document.getElementById("modal"), {
        keyboard: false,
    });

    modalConfirmacion = new bootstrap.Modal(document.getElementById("modalCon"), {
        keyboard: false,
    });

    const permisos = getPermisos()
    console.log(permisos)
    permisos.includes("Gestionar Roles") ? visibleGestionar.value = true : visibleGestionar.value = false;

});

const consultarRoles = async (activo) => {
    buscador.value = [];
    rolesArray.value = [];
    rolDir.value = [];
    try {
        roles.value = await obtenerRoles(activo);
        const body = roles.value.data.body;
        for (var j in body) {
            if (body[j].Activo == activo) {
                rolesArray.value.push(body[j]);
            }
            buscador.value.push(body[j].Rol);
            rolDir.value.push(body[j].idRol);
        }
        rolesDesplegados.value = rolesArray.value;
    } catch (error) {
        console.log(error);
    }
};

const filtrarRoles = (activo) => {
    consultarRoles(activo);
};

function resetCampoVacio() {
    campoVacio.value = false; // Restablecer campoVacio a false cuando el usuario comienza a escribir
}

const consultarPermisosDeRol = async (idRol) => {
    permisosDeRolArray.value = [];
    try {
        const permisosDeRol = await obtenerPermisosDelRol(idRol);
        const body = permisosDeRol.data.body;
        for (var j in body) {
            permisosDeRolArray.value.push(body[j]);
        }
        modal.show();
    } catch (error) {
        console.log(error);
    }
};

const eliminarRoles = async (idUsuario) => {
    try {
        await eliminarPermisosDelRol(idUsuario);
        await eliminarRol(idUsuario);
        await consultarRoles();
    } catch (error) {
        console.log(error);
    }
};

function abrirModalEditar(rol) {
    // Asigna los valores del rol seleccionado a rolSeleccionado
    rolSeleccionado.value.id = rol.idRol; // Asegúrate de que los nombres de las propiedades coincidan
    rolSeleccionado.value.nombre = rol.Rol; // Asegúrate de que los nombres de las propiedades coincidan
    // Asigna otros campos del rol a rolSeleccionado según sea necesario

    // Abre el modal de edición
    modalEditarRol.show();
}


async function guardarEdicion() {
    // Verificar si el campo del nuevo rol está vacío
    if (!rolSeleccionado.value.nombre) {
        campoVacio.value = true;
        return; // Salir de la función si el campo está vacío
    }

    // Consulta los roles activos
    await consultarRoles(1);
    const rolesActivos = rolesArray.value;

    // Consulta los roles inactivos
    await consultarRoles(0);
    const rolesInactivos = rolesArray.value;

    // Verifica si el rol ya existe
    const existeRol = rolesActivos.some(rol => rol.Rol === rolSeleccionado.value.nombre) || rolesInactivos.some(rol => rol.Rol === rolSeleccionado.value.nombre);

    if (existeRol) {
        rolExistente.value = true;
        console.log("El rol ya existe. Por favor, elige otro nombre.");
    } else {
        actualizarRol(rolSeleccionado.value.id, rolSeleccionado.value.nombre)
        modalEditarRol.hide();
        console.log("Rol modificado exitosamente.");
        rolExistente.value = false;
        campoVacio.value = false; // Resetear el campo vacío        
    }
    await filtrarRoles(1);
}

// const modificarRol = async (idRol) => {
//     try {
//         setRol(idRol);
//         // router.push({ name: 'actualizarRol', params: { idRolAct: idRol }});

//         //window.location.href = "http://localhost:5173/registroRol";
//         //this.$router.push("http://localhost:5173/crearRol");
//     } catch (error) {
//         console.log(error);
//     }
// };


function confirmar(idRol) {
    idRolEliminar.value = idRol;
    modalConfirmacion.show();
}

function actualizarTabla(nombre) {
    if (nombre.trim() === "") {
        rolesDesplegados.value = rolesArray.value;
    } else {
        rolesDesplegados.value = rolesArray.value.filter(role =>
            role.Rol.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}

const botonesClases = computed(() => {
    return {
        activos: rolesDesplegados.value.some(rol => rol.Activo === 1),
        inactivos: rolesDesplegados.value.some(rol => rol.Activo === 0)
    };
});

async function agregarNuevoRol() {
    // Verificar si el campo del nuevo rol está vacío
    if (nuevoRol.value.trim() === '') {
        campoVacio.value = true;
        return; // Salir de la función si el campo está vacío
    }

    // Consulta los roles activos
    await consultarRoles(1);
    const rolesActivos = rolesArray.value;

    // Consulta los roles inactivos
    await consultarRoles(0);
    const rolesInactivos = rolesArray.value;

    // Verifica si el rol ya existe
    const existeRol = rolesActivos.some(rol => rol.Rol === nuevoRol.value) || rolesInactivos.some(rol => rol.Rol === nuevoRol.value);

    if (existeRol) {
        rolExistente.value = true;
        console.log("El rol ya existe. Por favor, elige otro nombre.");
    } else {
        agregarRol(nuevoRol.value);
        modalAgregarRol.hide();
        console.log("Rol agregado exitosamente.");
        rolExistente.value = false;
        campoVacio.value = false; // Resetear el campo vacío        
    }
    await filtrarRoles(1);
}



function abrirModalAgregarRol() {
    modalAgregarRol.show();
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="roles"></cabecera>
    <!-- Contenido -->
    <div class="contenido">
        <!-- Primera parte del contenido: Barra de búsqueda -->
        <div class="navbar">
            <!-- En este div va el logo -->
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
                    <button v-show="visibleGestionar" class="btn btn-custom btn-sm mt-2 no-margin-top"
                        @click="abrirModalAgregarRol">
                        <b>Agregar &nbsp;</b><i class="fas fa-plus fa-plus-icon"></i>
                    </button>
                </div>
            </div>

        </div>
        <!-- Segunda parte del contenido: Tabla de consulta -->
        <div>
            <div class="table-container">
                <h1 class="titulo"><b>Roles </b></h1>
                <div class="botones">
                    <button @click="filtrarRoles(1)"
                        :class="{ 'btn btn-verde': botonesClases.activos, 'btn btn-gris': !botonesClases.activos }">Activos</button>
                    <button @click="filtrarRoles(0)"
                        :class="{ 'btn btn-rojo': botonesClases.inactivos, 'btn btn-gris': !botonesClases.inactivos }">Inactivos</button>
                </div>

            </div>
        </div>
        <div class="centered-div" >
            <div class="header">
                <table class="table text-center mt-4 mx-auto"
                    style="width: 920px; border: 1px solid gray; border-radius: 10px; margin-top: 0px!important;">
                    <thead>
                        <tr>
                            <th scope="col"
                                style="background-color: #f4f4f4; border-bottom: 1px solid gray; border-top: 1px solid gray;">
                                Rol</th>
                            <th scope="col"
                                style="width: 17vw; background-color: #f4f4f4; border-bottom: 1px solid gray; border-top: 1px solid gray;">
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div class="body" style="max-height: 210px; overflow-y: auto; width: 925px;">
                <table class="table text-center mt-4 mx-auto"
                    style="width: 900px; border: 1px solid gray; border-radius: 10px; margin-bottom: 0px!important; margin-top: 0px!important;">
                    <tbody>
                        <tr v-for="rol in rolesDesplegados">
                            <td style="background-color: #f4f4f4;">
                                {{ rol.Rol }}
                            </td>
                            <th scope="row" style="background-color: #f4f4f4; width: 15vw;">
                                <div class="align-items-center" v-show="visibleGestionar">
                                    <button class="btn btn-primary mx-1 btn-create" type="submit"
                                        style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                        @click="consultarPermisosDeRol(rol.idRol)">
                                        <i class="fas fa-shield-alt text-gray"></i>
                                    </button>
                                    <button class="btn btn-primary mx-1 btn-spacer" type="submit"
                                        style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                        @click="abrirModalEditar(rol)">
                                        <i class="fa-solid fa-pen-to-square text-gray"></i>
                                    </button>
                                    <button class="btn btn-primary mx-1 btn-delete" type="submit"
                                        style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                        @click="confirmar(rol.idRol)">
                                        <i class="fas fa-times text-gray"></i>
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>


        </div>

        <!-- Modal  modalCon-->
        <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Permisos del Rol</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-for="item in permisosDeRolArray">
                            <span>{{ item.Descripcion }}</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalCon" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Permisos del Rol</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <span>¿Está seguro de que quiere eliminar este permiso?</span>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal"
                            @click="eliminarRoles(idRolEliminar)">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para agregar rol -->
        <div class="modal fade" id="modalAgregarRol" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Agregar Rol</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3 text-start">
                                <label class="form-label">Rol</label>
                                <input type="text" class="form-control" id="nombreRol" v-model="nuevoRol"
                                    placeholder="Nombre del Rol" @input="resetCampoVacio" />
                            </div>
                            <div v-if="rolExistente" class="alert alert-danger d-flex align-items-center"
                                style="height: 30px; font-size: 16px" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <div>Rol existente</div>
                            </div>
                            <div v-if="campoVacio" class="alert alert-danger d-flex align-items-center"
                                style="height: 30px; font-size: 16px" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <div>El campo del rol no puede estar vacío</div>
                            </div>
                            <div class="modal-footer d-block">
                                <button type="button" class="btn btn-amarillo btn-primary float-end"
                                    @click="agregarNuevoRol">Agregar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para modificar rol -->
        <div class="modal fade" id="modalEditarRol" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Editar Rol</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3 text-start">
                                <label class="form-label">Rol</label>
                                <input type="text" class="form-control" id="nombreRolEditar"
                                    v-model="rolSeleccionado.nombre" @input="resetCampoVacio" />
                            </div>
                            <div v-if="rolExistente" class="alert alert-danger d-flex align-items-center"
                                style="height: 30px; font-size: 16px" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <div>Rol existente</div>
                            </div>
                            <div v-if="campoVacio" class="alert alert-danger d-flex align-items-center"
                                style="height: 30px; font-size: 16px" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <div>El campo del rol no puede estar vacío</div>
                            </div>
                            <!-- Otros campos del rol para editar -->
                            <div class="modal-footer d-block">
                                <button type="button" class="btn btn-amarillo btn-primary float-end"
                                    @click="guardarEdicion">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.centered-div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -2%);
    display: flex;
    flex-direction: column;
}

.table-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.titulo {
    font-family: 'Barlow', sans-serif;
    /* Establece el tipo de letra como Barlow */
    font-size: 30px;
    margin-right: 20px;
    /* Espacio entre el título y los botones */
    margin-left: 30px;
    /* Espacio entre el título y los botones */
    margin-bottom: 0px!important;
    margin-top: 2px!important;
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

.btn:focus,
.btn-verde:focus,
.btn-rojo:focus,
.btn-amarillo:focus,
.btn-gris:focus {
    outline: none;
    box-shadow: none;
    /* Elimina el contorno y la sombra al hacer clic */
}

.header {
    background-color: #f4f4f4;
    widows: 923px;
    margin-left: 2px;
}

.header table {
    width: 100%;
    margin: 0%;
}

.body {
    flex: 1;
    overflow-y: auto;
}

.body table {
    width: 100%;
}
</style>

