<script setup>
import { ref, computed } from "vue"; //para usar variables reactivas
import { onMounted } from "vue"; //para poder usar el onMounted, que ejecuta todo lo que tenga adentro cada que cargue la pagina
import { usuariosStore } from "../stores/usuarios";
import { rolesStore } from "../stores/roles";
import { clientesStore } from "../stores/clientes";
import { watch } from 'vue';
import router from "../router";
import cabecera from "../components/Menu.vue";

const { obtenerNicknames, agregarUsuario } = usuariosStore();
const { obtenerRoles } = rolesStore();
const { obtenerClientes } = clientesStore();

// variables reactivas
const roles = ref([]);
const nickname = ref("");
const arrayNicknames = ref([]);
const contrasena = ref("");
const confContrasena = ref("");
const nombre = ref("");
const paterno = ref("");
const materno = ref("");
const telefono = ref("");
const email = ref("");
const empresas = ref([]);
const tipoConfPass = ref("password");
const tipoPass = ref("password");
const rolSeleccionado = ref("Seleccionar rol");
const clienteSeleccionado = ref("Seleccionar razón social");
const deshabilitado = ref(false);
const repetido = ref(false);
const validado = ref(true);
const alertaLlenado = ref(false);

let tried = false;

const mostrarRazonSocial = computed(() => {
    return rolSeleccionado.value === "Representante de Cliente";
});

// Se establece un observador (watcher) en la variable 'rolSeleccionado'.
// Cada vez que esta variable cambie, se ejecutará
watch(rolSeleccionado, (nuevoValor) => {
    // Se verifica si el nuevo valor de 'rolSeleccionado' es diferente a 'Representante de Cliente'.
    if (nuevoValor !== 'Representante de Cliente') {
        // Establecer como nulo o un valor por defecto
        clienteSeleccionado.value = 'Seleccionar razón social';
    }
});

// Tags
const tagNombre = ref(null);
const tagPaterno = ref(null);
const tagMaterno = ref(null);

//variable asociada al modal
let modal;

onMounted(async () => {
    try {
        consultarRoles();
        consultarClientes();
        consultarUsuarios();
        deshabilitado.value = true;

        // Inicialización del modal después de consultar los clientes
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            backdrop: "static", // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,    // Evita que el modal se cierre al presionar la tecla Esc
        });
    } catch (error) {
        console.log(error);
    }
});

//consulta los roles usando el metodo de la store, los almacena en rolesArray
const consultarRoles = async () => {
    try {
        roles.value = await obtenerRoles();
        roles.value = roles.value.data.body;
        console.log(roles.value);
    } catch (error) {
        console.log(error);
    }
};

const consultarClientes = async () => {
    try {
        empresas.value = await obtenerClientes();
        empresas.value = empresas.value.data.body;
        console.log(empresas.value);
    } catch (error) {
        console.log(error);
    }
};

const consultarUsuarios = async () => {
    try {
        arrayNicknames.value = [];
        let usuarios = await obtenerNicknames();
        usuarios = usuarios.data.body;
        usuarios.forEach((element) => {
            arrayNicknames.value.push(element);
        });
    } catch (error) {
        console.log(error);
    }
};

function obtenerIdRol(rol) {
    let idRol = null;
    roles.value.forEach((element) => {
        if (element.Rol == rol) {
            idRol = element.idRol;
            return;
        }
    });
    return idRol;
}

function obtenerIdCliente(empresa) {
    let idCliente = null;
    empresas.value.forEach((element) => {
        if (element.RazonSocial == empresa) {
            idCliente = element.idCliente;
            return;
        }
    });
    return idCliente;
}

// Función para verificar si existe un Usuario
function revisarUsuarioExistente() {
    for (let j in arrayNicknames.value) {
        if (arrayNicknames.value[j].Usuario.toLowerCase() === nickname.value.toLowerCase()) {
            // RFC encontrado en la lista, retorna true
            return true;
        }
    }
    return false;
}

const crearUsuario = async () => {
    try {
        // Obtener el id del rol que fue seleccionado
        const idRol = obtenerIdRol(rolSeleccionado.value);
        console.log(idRol);
        // Obtener el id del cliente que fue seleccionado
        const idCliente = obtenerIdCliente(clienteSeleccionado.value);
        console.log(idCliente);
        const usuarioNuevo = {
            idUsuario: 0,
            Usuario: nickname.value,
            idCliente: idCliente,
            idRol: idRol,
            Nombre: nombre.value,
            ApellidoP: paterno.value,
            ApellidoM: materno.value,
            Telefono: telefono.value,
            Correo: email.value,
            Contrasena: contrasena.value,
            Activo: 1
        };
        // Creamos el rol
        await agregarUsuario(usuarioNuevo);
        // Al ser todo exitoso, mostramos el modal notificando el exito
        modal.show();
    } catch (error) {
        console.log(error);
    }
};

function guardarUsuario() {
    tried = true;
    validado.value = true;
    camposVacios();
    validarEmail();
    validarPsw();
    compararPsw();
    validarTlfn();
    if (
        camposVacios() &&
        validarEmail() &&
        validarTlfn() &&
        validarTexto(tagNombre.value) &&
        validarTexto(tagPaterno.value) &&
        validarTexto(tagMaterno.value) && validarPsw() && compararPsw()
    ) {
        crearUsuario();
    } else {
        alertaLlenado.value = true;
    }
}

// Función que redirigue a la pantalla usuarios
function verUsuarios() {
    modal.hide();
    router.push({ name: "usuarios" });
}

////////////////////////////////////// FUNCIONES VALIDACIONES ///////////////////////////////////////////////////////

// Validar Usuario
function validarUsuario() {
    let re = /^[a-zA-Z0-9 !@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/;
    let input = document.getElementById('tagNickname'); // Reemplaza 'tagRFC' con el id real de tu input RFC

    if (re.test(nickname.value)) {
        // Usuario válido, ahora revisar si ya existe en la lista de Usuario existentes
        repetido.value = revisarUsuarioExistente();
        deshabilitado.value = repetido.value;

        // Si el Usuario es válido pero ya existe, establecer el borde en rojo
        if (repetido.value) {
            input.style.borderColor = "red";
            input.style.borderWidth = "1px";
        } else {
            // Si el Usuario no existe, establecer el borde en verde
            input.style.borderColor = "#3ac74d";
            input.style.borderWidth = "1px";
        }
    } else {
        // Usuario inválido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";

        // Usuario no válido, deshabilitar el formulario
        repetido.value = false;
        deshabilitado.value = true;
    }
}

// Validar formato de Correo
function validarEmail() {
    email.value = email.value.trim();

    // Validar que el formato de correo (email@gmail.com - email@outlook.es - .mx - .etc)
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let input = document.getElementById("emailInpt");

    if (re.test(email.value)) {
        // Correo válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
        return true;
    } else {
        // Correo no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
        validado.value = false;
        return false;
    }
}

// Validar formato Teléfono
function validarTlfn() {
    // Eliminar cualquier carácter que no sea un número del campo de teléfono
    telefono.value = telefono.value.replace(/\D/g, '');

    let re = /^[0-9]+$/;
    let tlfnInpt = document.getElementById("tlfn");

    if ((telefono.value.length == 10 && telefono.value.match(re))) {
        // Teléfono válido, establecer el borde en verde
        tlfnInpt.style.borderColor = "#3ac74d";
        tlfnInpt.style.borderWidth = "1px";
        return true;
    } else {
        // Teléfono no válido, establecer el borde en rojo
        tlfnInpt.style.borderColor = "red";
        tlfnInpt.style.borderWidth = "1px";
        validado.value = false;
        return false;
    }
}

// Validar Contraseña
function validarPsw() {
    contrasena.value = contrasena.value.trim();
    compararPsw();
    let pswd = document.getElementById("pswd");

    if (contrasena.value.length < 8) {
        pswd.style.borderColor = "red";
        pswd.style.borderWidth = "1px";
        validado.value = false;
        return false;
    } else {
        pswd.style.borderColor = "#3ac74d";
        pswd.style.borderWidth = "1px";
        return true;
    }
}

// Comparar Contraseña
function compararPsw() {
    confContrasena.value = confContrasena.value.trim();
    let pswd = document.getElementById("pswdC");

    if ((confContrasena.value == contrasena.value && confContrasena.value != "")) {
        pswd.style.borderColor = "#3ac74d";
        pswd.style.borderWidth = "1px";
        return true;
    } else {
        pswd.style.borderColor = "red";
        pswd.style.borderWidth = "1px";
        validado.value = false;
        return false;
    }
}

// Validar formato texto
function validarTexto(input) {
    let re = /^[a-zA-Z ]+$/;

    if (re.test(input.value)) {
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
        return true;
    } else {
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
        validado.value = false;
        return false;
    }
}

function camposVacios() {
    if (tried) {
        let aprobado = true;
        validado.value = true;

        let inputs = document.querySelectorAll(".input-f");

        Array.prototype.slice.call(inputs).forEach(function (input) {
            if (input.value == "") {
                input.style.borderColor = "red";
                input.style.borderWidth = "1px";
                aprobado = false;
                validado.value = false;
            } else {
                input.style.borderColor = "#3ac74d";
                input.style.borderWidth = "1px";
            }
        });
        return aprobado;
    }
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="usuarios"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <h1 class="titulo"><b>Crear Nuevo Usuario </b></h1>
        <form @submit.prevent="guardarUsuario()" class="needs-validation formulario" novalidate>
            <div class="row">
                <div class="col">
                    <label for="tipoUser" class="form-label">Tipo de Usuario</label>
                    <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                        v-model="rolSeleccionado" @change="camposVacios()" required id="tipoUser">
                        <option v-for="rol in roles">{{ rol.Rol }}</option>
                    </select>
                </div>
                <div class="col">
                    <label for="tagNickname" class="form-label">Nombre de usuario</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarUsuario"
                        v-model.trim="nickname" required placeholder="Nombre de Usuario" id="tagNickname" maxlength="15" />
                    <div v-if="revisarUsuarioExistente()" class="alert alert-danger mt-2 d-flex align-items-center"
                        style="height: 10px; font-size:12px;" role="alert">
                        "{{ nickname }}" ya existe
                    </div>
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col">
                    <label for="pswd" class="form-label">Contraseña</label>
                    <input id="pswd" :type="tipoPass" class="form-control inptElement form-color" @input="validarPsw()"
                        v-model="contrasena" required placeholder="Contraseña" maxlength="20" />
                    <small id="passwordHelpBlock" class="form-text text-muted" style="margin-left: 8px;">
                        Debe tener entre 8 y 20 caracteres.
                    </small>
                </div>
                <div class="col">
                    <label for="pswdC" class="form-label">Confirmar contraseña</label>
                    <input id="pswdC" :type="tipoConfPass" class="form-control inptElement form-color"
                        @input="compararPsw()" v-model="confContrasena" required placeholder="Confirmar contraseña"
                        maxlength="20" />
                </div>
            </div>
            <hr style="background-color: #7d7d7d; height: 2px; border: none;">
            <div class="row">
                <div class="col">
                    <label for="tagNombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="nombre"
                        @input="validarTexto(tagNombre)" ref="tagNombre" autofocus required placeholder="Nombre"
                        id="tagNombre">

                </div>
                <div class="col">
                    <label for="tagPaterno" class="form-label">Apellido Paterno</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="paterno"
                        ref="tagPaterno" @input="validarTexto(tagPaterno)" autofocus required placeholder="Apellido Paterno"
                        id="tagPaterno">
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col">
                    <label for="tagMaterno" class="form-label">Apellido Materno</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="materno"
                        @input="validarTexto(tagMaterno)" ref="tagMaterno" autofocus required placeholder="Apellido Materno"
                        id="tagMaterno">
                </div>
                <div class="col">
                    <label for="tlfn" class="form-label">Teléfono</label>
                    <input id="tlfn" type="text" class="form-control input-f inptElement form-color" v-model.trim="telefono"
                        @input="validarTlfn()" required placeholder="Teléfono" maxlength="10">
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col">
                    <label for="emailInpt" class="form-label">Correo</label>
                    <input id="emailInpt" type="email" class="form-control input-f inptElement form-color"
                        v-model.trim="email" @input="validarEmail()" required placeholder="Correo">

                </div>
                <div class="col" v-if="mostrarRazonSocial">
                    <label for="empresa" class="form-label">Razón Social</label>
                    <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                        v-model="clienteSeleccionado" @change="camposVacios()" required id="empresa">
                        <option v-for="empresa in empresas">{{ empresa.RazonSocial }}</option>
                    </select>
                </div>

            </div>
            <div class="botones">
                <router-link to="/usuarios">
                    <button class="btn btn-cancelar">Cancelar</button>
                </router-link>
                <button class="btn btn-primary btn-amarillo" type="submit" :disabled="deshabilitado">
                    Guardar
                </button>
            </div>
        </form>
    </div>
    <!------------------------------------------- Modal --------------------------------------------------->
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">¡Usuario creado!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">El usuario "{{ nickname }}" fue creado exitosamente.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal" @click="verUsuarios()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: left;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
    padding-bottom: 30px;
    height: auto;
    width: 70%;
}

.titulo {
    /* Establece el tipo de letra como Barlow */
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;
    margin-left: 30px;
    margin-top: 1%;
}

.formulario {
    /* Establece el tipo de letra como Barlow */
    font-family: 'Barlow', sans-serif;
    font-size: 18px;
    margin-right: 20px;
    margin-left: 30px;
    margin-top: 1.5%;
}

.form-color {
    background-color: #f4f4f4;
    width: 400px;
    border-color: #afafaf;
}

.row {
    margin-left: 3px;
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
    color: black;
    width: 90px;
    border: none;
}

.botones {
    margin-top: 15px;
    margin-right: 10px;
    text-align: right;
}

.botones button {
    margin-top: 10px;
    margin-left: 10px;
}
</style>