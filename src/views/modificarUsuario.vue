<!---------------------------------------------- TO DO ------------------------------->
<!--  ☑ validar que solo se ingresen numeros  LISTO -->

<script setup>
import { ref, computed } from "vue"; //para usar letiables reactivas
import { onMounted } from "vue"; //para poder usar el onMounted, que ejecuta todo lo que tenga adentro cada que cargue la pagina
import { usuariosStore } from "../stores/usuarios";
import { rolesStore } from "../stores/roles";
import router from "../router/index";
import { useRoute } from 'vue-router';
import { clientesStore } from "../stores/clientes";
import { watch } from 'vue';
import cabecera from "../components/Menu.vue";

//declaramos como constantes los metodos exactos que vamos a usar de las stores y lo igualamos a la store de donde vienen
//           metodo    =     store de la que viene

const { obtenerRoles } = rolesStore();
const { getIdUsuario } = usuariosStore();
const { obtenerNicknames } = usuariosStore();
const { obtenerUnUser } = usuariosStore();
const { actualizarUsuario } = usuariosStore();
const { obtenerClientes } = clientesStore();
const route = useRoute();

const mostrarModificarContrasena = ref(false);

//variables reactivas
const nombreRol = ref("");
const nombreRazon = ref("");
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
const idUsrActualizar = ref("");
const usuario = ref([]);

const tipoConfPass = ref("password");
const tipoPass = ref("password");
const rolSeleccionado = ref("Seleccionar rol");
const clienteSeleccionado = ref("Seleccionar razón social");

watch(rolSeleccionado, (nuevoValor) => {
    if (nuevoValor !== 'Representante de Cliente') {
        clienteSeleccionado.value = 'Seleccionar razón social'; // Establecer como nulo o un valor por defecto
    }
});

const mostrarRazonSocial = computed(() => {
    return rolSeleccionado.value === "Representante de Cliente";
});

const deshabilitado = ref(false);
const repetido = ref(false);

const tagNombre = ref(null);
const tagPaterno = ref(null);
const tagMaterno = ref(null);

let nicknameActual = "";

//letiable asociada al modal
let modal;
let tried = false;
const validado = ref(true);
const alertaLlenado = ref(false);

const idUsuario = route.params.idUsuario;

//al cargar la pagina se consultan los permisos y roles que hay en la BD y se define el objeto relacionado al modal
onMounted(async () => {
    try {
        await consultarRoles();
        await obtenerDatosUsr();
        await consultarUsuarios();
        nicknameActual = nickname.value;
    } catch (error) {
        console.log(error);
    }
});

//consulta los roles usando el metodo de la store, los almacena en rolesArray
const consultarRoles = async () => {
    try {
        roles.value = await obtenerRoles();
        roles.value = roles.value.data.body;
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

const obtenerDatosUsr = async () => {
    try {
        idUsrActualizar.value = getIdUsuario() || idUsuario;
        if (idUsrActualizar.value != "") {
            console.log("idUsuario")
            console.log(idUsrActualizar.value);
            usuario.value = await obtenerUnUser(idUsrActualizar.value);
            console.log(usuario.value)
            roles.value = await obtenerRoles();
            roles.value = roles.value.data.body;
            roles.value.forEach((element) => {
                if (element.idRol == usuario.value.idRol) {
                    nombreRol.value = element.Rol;
                }
            });
            console.log(nombreRol.value);
            empresas.value = await obtenerClientes();
            empresas.value = empresas.value.data.body;
            empresas.value.forEach((element) => {
                if (element.idCliente == usuario.value.idCliente) {
                    nombreRazon.value = element.RazonSocial;
                }
            })
            console.log(nombreRazon.value)
            console.log(usuario.value.Nombre);
            nombre.value = usuario.value.Nombre;
            paterno.value = usuario.value.ApellidoP;
            materno.value = usuario.value.ApellidoM;
            email.value = usuario.value.Correo;
            telefono.value = usuario.value.Telefono;
            nickname.value = usuario.value.Usuario;
            rolSeleccionado.value = nombreRol.value;
            clienteSeleccionado.value = nombreRazon.value;
            console.log(nombre.value);
            console.log(nickname.value);
            console.log(rolSeleccionado.value);
            console.log(telefono.value)
            return true;
        } else {
            modal = new bootstrap.Modal(document.getElementById("modalError"), {
                keyboard: false,
            });
            modal.show();
        }
    } catch (error) {
        console.log(error);
        //Mostrar modal bloqueado
    }
};

function revisarUsuarioExistente() {
    if (nickname.value.trim() == "") {
        deshabilitado.value = true;
        return;
    }

    for (let j in arrayNicknames.value) {
        console.log(arrayNicknames.value[j]);
        console.log(nicknameActual);
        if (
            arrayNicknames.value[j].Usuario.toLowerCase() ==
            nickname.value.trim().toLowerCase() &&
            nicknameActual != nickname.value.trim().toLowerCase()
        ) {
            repetido.value = true;
            deshabilitado.value = true;
            return true;
        }
    }
    repetido.value = false;
    deshabilitado.value = false;
    return false;
}

//metodo que crea el nuevo rol
const actUsuario = async () => {
    try {
        console.log(rolSeleccionado.value);
        const idRol = obtenerIdRol(rolSeleccionado.value);
        const idCliente = obtenerIdCliente(clienteSeleccionado.value);
        console.log(idCliente);
        console.log(idRol);
        const usuarioNuevo = {
            idUsuario: idUsrActualizar.value,
            idRol: idRol,
            idCliente: idCliente,
            Activo: 1,
            Nombre: nombre.value,
            ApellidoP: paterno.value,
            ApellidoM: materno.value,
            Telefono: telefono.value,
            Contrasena: contrasena.value,
            Usuario: nickname.value,
            Correo: email.value,
        };
        await actualizarUsuario(usuarioNuevo); //Actualizamos el usuario
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            keyboard: false,
        });
        modal.show(); //al ser todo exitoso, mostramos el modal notificando el exito
    } catch (error) {
        console.log(error);
    }
};

//metodo que crea el nuevo rol sin contraseña
const actUsuarioSC = async () => {
    try {
        console.log(rolSeleccionado.value);
        const idRol = obtenerIdRol(rolSeleccionado.value);
        console.log(idRol);
        const idCliente = obtenerIdCliente(clienteSeleccionado.value);
        console.log(idCliente);
        console.log(idUsrActualizar.value);
        const usuarioNuevo = {
            idUsuario: idUsrActualizar.value,
            idRol: idRol,
            idCliente: idCliente,
            Activo: 1,
            Nombre: nombre.value,
            ApellidoP: paterno.value,
            ApellidoM: materno.value,
            Telefono: telefono.value,
            Usuario: nickname.value,
            Correo: email.value,
        };
        await actualizarUsuario(usuarioNuevo); //Actualizamos el usuario
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            keyboard: false,
        });
        modal.show(); //al ser todo exitoso, mostramos el modal notificando el exito
    } catch (error) {
        console.log(error);
    }
};


function guardarUsuario() {
    const checkbox = document.getElementById("modifyP");

    if (checkbox.checked) {
        tried = true;        

        if (
            validarPsw() &&
            compararPsw() &&
            camposVacios() &&
            validarEmail() &&
            validarTexto(tagNombre.value) &&
            validarTexto(tagPaterno.value) &&
            validarTexto(tagMaterno.value) &&
            validado.value
        ) {
            actUsuario();
        } else {
            alertaLlenado.value = true;
        }
    } else {
        tried = true;
        
        if (
            camposVacios() &&
            validarEmail() &&
            validarTexto(tagNombre.value) &&
            validarTexto(tagPaterno.value) &&
            validarTexto(tagMaterno.value) &&
            validado.value
        ) {
            actUsuarioSC();
        } else {
            alertaLlenado.value = true;
        }
    }
}

// Función que redirigue a la pantalla usuarios
function verUsuarios() {
    modal.hide();
    router.push({ name: "usuarios" });
}

//////////////////////////////////////////////////////// VALIDACIONES //////////////////////////////////////////////////////////////////

function validarTexto(input) {
    console.log("validandoTexto");
    console.log(input.value);

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

function validarEmail() {
    console.log("validandomeail");
    email.value = email.value.trim();
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let pswd = document.getElementById("emailInpt");
    if (re.test(email.value)) {
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

function validarTlfn() {
    telefono.value = telefono.value.replace(/\D/g, '');
    let tlfnInpt = document.getElementById("tlfn");
    let re = /^[0-9]+$/;
    if ((telefono.value.length == 10 && telefono.value.match(re))) {
        tlfnInpt.style.borderColor = "#3ac74d";
        tlfnInpt.style.borderWidth = "1px";
        return true;
    } else {
        tlfnInpt.style.borderColor = "red";
        tlfnInpt.style.borderWidth = "1px";
        validado.value = false;
        return false;        
    }
}

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

function modificarC() {


    const checkbox = document.getElementById("modifyP");
    mostrarModificarContrasena.value = checkbox.checked;

    if (checkbox.checked) {
        document.getElementById("contraseña").style.display = "block";
        document.getElementById("contraseña2").style.display = "block";
    } else {
        document.getElementById("contraseña").style.display = "none";
        document.getElementById("contraseña2").style.display = "none";
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
        <h1 class="titulo"><b>Modificar Usuario </b></h1>
        <form @submit.prevent="guardarUsuario()" class="needs-validation formulario" novalidate>
            <div class="row">
                <div class="col">
                    <label for="rol" class="form-label">Tipo de Usuario</label>
                    <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                        v-model="rolSeleccionado" @change="camposVacios()" required id="rol">
                        <option v-for="rol in roles">{{ rol.Rol }}</option>
                    </select>
                </div>
                <div class="col">
                    <label for="tagNickname" class="form-label">Nombre de usuario</label>
                    <input type="text" class="form-control input-f inptElement form-color"
                        @input="revisarUsuarioExistente()" v-model.trim="nickname" required placeholder="Nombre de Usuario"
                        id="tagNickname" maxlength="15" />
                    <div v-if="repetido" class="alert alert-danger mt-2 d-flex align-items-center"
                        style="height: 10px; font-size:12px;" role="alert">
                        "{{ nickname }}" ya existe
                    </div>                    
                </div>
            </div>
            <br>
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
            <br>
            <div class="row">
                <div class="form-check" style="text-align: center;">
                    <input class="form-check-input" type="checkbox" value="" @input="modificarC()" id="modifyP">
                    <span class="form-check-label">
                        Modificar contraseña
                    </span>
                </div>
            </div>
            <div class="row">
                <div class="col mt-2" id="contraseña" v-show="mostrarModificarContrasena">
                    <label for="pswd" class="form-label">Contraseña</label>
                    <input id="pswd" :type="tipoPass" class="form-control inptElement form-color" @input="validarPsw()"
                        v-model="contrasena" maxlength="20" />
                </div>
                <div class="col mt-2" id="contraseña2" v-show="mostrarModificarContrasena">
                    <label for="pswdC">Confirmar constraseña</label>
                    <input id="pswdC" :type="tipoConfPass" class="form-control inptElement form-color"
                        @input="compararPsw()" v-model="confContrasena" maxlength="20" />
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
    <!------------------------------------------------------ Modal -------------------------------------------------------->
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">¡Usuario actualizado!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">El usuario {{ nickname }} fue modificado exitosamente.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal" @click="verUsuarios()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="modalError" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Error al cargar los datos</h5>
                </div>
                <div class="modal-body">Vuelva a cargar el usuario</div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" @click="verUsuarios()">
                        Volver a usuarios
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
    /* Ajusta el espacio entre los botones si es necesario */
    margin-left: 10px;
    /* Ajusta el espacio entre los botones si es necesario */
}

.btn-amarillo {
    background-color: #FFCA0A;
    color: black;
    width: 90px;
    border: none;
}
</style>