<script setup>
import { ref } from "vue"; //para usar variables reactivas
import { onMounted } from "vue"; //para poder usar el onMounted, que ejecuta todo lo que tenga adentro cada que cargue la pagina
import { clientesStore } from "../stores/clientes";
import router from "../router";
import cabecera from "../components/Menu.vue";

const { obtenerRFC, agregarClient } = clientesStore();

// variables reactivas
const empresa = ref("");
const rfc = ref("");
const arrayRFC = ref([]);
const calle = ref("");
const numero = ref("");
const colonia = ref("");
const cp = ref("");
const deshabilitado = ref(false);
const repetido = ref(false);
const tagEmpresa = ref(null);
const validado = ref(true);
const alertaLlenado = ref(false);

let tried = false;

// variable asociada al modal
let modal;


onMounted(async () => {
    try {
        consultarClientes();
        deshabilitado.value = true;

        // Inicialización del modal después de consultar los clientes
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            backdrop: "static", // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,    // Evita que el modal se cierre al presionar la tecla Esc
        });
    } catch (error) {
        console.error(error);
    }
});

const consultarClientes = async () => {
    try {
        arrayRFC.value = [];
        let clientes = await obtenerRFC();
        clientes = clientes.data.body;
        clientes.forEach((element) => {
            arrayRFC.value.push(element);
        });
    } catch (error) {
        console.log(error);
    }
};

// Función para verificar si existe un RFC
function revisarRFCExistente() {
    for (let j in arrayRFC.value) {
        if (arrayRFC.value[j].RFC.toLowerCase() === rfc.value.toLowerCase()) {
            // RFC encontrado en la lista, retorna true
            return true;
        }
    }
    // RFC no encontrado en la lista, retorna false
    return false;
}

const crearCliente = async () => {
    try {
        const clienteNuevo = {
            idCliente: 0,
            RazonSocial: empresa.value,
            RFC: rfc.value,
            Calle: calle.value,
            Numero: numero.value,
            Colonia: colonia.value,
            CP: cp.value,
            Activo: 1
        };
        // Creamos el cliente
        await agregarClient(clienteNuevo);
        // Al ser todo exitoso, mostramos el modal notificando el exito
        modal.show();
    } catch (error) {
        console.log(error);
    }
};

function guardarCliente() {
    tried = true;
    validado.value = true;
    camposVacios();
    if (
        camposVacios()
    ) {
        crearCliente();
    } else {
        alertaLlenado.value = true;
    }
}

// Función que redirigue a la pantalla clientes
function verClientes() {
    modal.hide();
    router.push({ name: "clientes" });
}

////////////////////////////////////// FUNCIONES VALIDACIONES ///////////////////////////////////////////////////////

// Validar formato de RFC
function validarRFC() {
    // Convertir el RFC a mayúsculas
    rfc.value = rfc.value.toUpperCase();

    // Validar el RFC con el patrón ( EJM 951103 H31 )
    //                              (Iniciales de la empresa - Fecha de creación de la emprea - Homoclave)
    let re = /^[A-Z]{3}[0-9]{6}[A-Z0-9]{3}$/;
    let input = document.getElementById('tagRFC');

    if (re.test(rfc.value)) {
        // RFC válido, ahora revisar si ya existe en la lista de RFC existentes
        repetido.value = revisarRFCExistente();
        deshabilitado.value = repetido.value;

        // Si el RFC es válido pero ya existe, establecer el borde en rojo
        if (repetido.value) {
            input.style.borderColor = "red";
            input.style.borderWidth = "1px";
        } else {
            // Si el RFC no existe, establecer el borde en verde
            input.style.borderColor = "#3ac74d";
            input.style.borderWidth = "1px";
        }
    } else {
        // RFC inválido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";

        // RFC no válido, deshabilitar el formulario
        repetido.value = false;
        deshabilitado.value = true;
    }
}

// Validar formato de Codigo Postal
function validarNumerosCP() {
    // Eliminar cualquier carácter que no sea un número del campo de código postal
    cp.value = cp.value.replace(/\D/g, '');

    // Validar que el código postal tenga exactamente 5 números
    let re = /^\d{5}$/;
    let input = document.getElementById('tagCP');

    if (re.test(cp.value)) {
        // Código postal válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Código postal no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar que Razon Social no este vacio
function validarRazon() {
    let input = document.getElementById('tagEmpresa');

    if (empresa.value !== '') {
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar que Calle no este vacio
function validarCalle() {
    let input = document.getElementById('tagCalle');

    if (calle.value !== '') {
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar que Número no este vacio
function validarNum() {
    let input = document.getElementById('tagNum');

    if (numero.value !== '') {
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar que Colonia no este vacio
function validarColonia() {
    let input = document.getElementById('tagColonia');

    if (colonia.value !== '') {
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar que los campos no esten vacios
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
    <cabecera interfaz="clientes"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <h1 class="titulo"><b>Crear Nuevo Cliente</b></h1>
        <form @submit.prevent="guardarCliente()" class="needs-validation formulario" novalidate>
            <div class="row">
                <div class="col">
                    <label for="tagEmpresa" class="form-label">Razón Social</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarRazon"
                        v-model.trim="empresa" ref="tagEmpresa" autofocus required placeholder="RazónSocial"
                        id="tagEmpresa">
                </div>
                <div class="col">
                    <label for="tagRFC" class="form-label">RFC</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarRFC"
                        v-model.trim="rfc" maxlength="12" required placeholder="RFC" id="tagRFC" />
                    <div v-if="revisarRFCExistente()" class="alert alert-danger mt-2 d-flex align-items-center"
                        style="height: 10px; font-size:12px;" role="alert">
                        "{{ rfc }}" ya existe
                    </div>
                </div>
            </div>
            <br>
            <hr style="background-color: #7d7d7d; height: 2px; border: none;">
            <div class="row">
                <div class="col">
                    <label for="tagCalle" class="form-label">Calle</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarCalle"
                        v-model.trim="calle" ref="tagCalle" autofocus required placeholder="Calle" id="tagCalle">

                </div>
                <div class="col">
                    <label for="tagNum" class="form-label">Número</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarNum"
                        v-model.trim="numero" ref="tagNum" autofocus required placeholder="Número" id="tagNum">
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col">
                    <label for="tagColonia" class="form-label">Colonia</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarColonia"
                        v-model.trim="colonia" ref="tagColonia" autofocus required placeholder="Colonia" id="tagColonia">

                </div>
                <div class="col">
                    <label for="tagCP" class="form-label">Código Postal</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model="cp"
                        @input="validarNumerosCP" maxlength="5" required placeholder="Código Postal" id="tagCP" />
                </div>
            </div>
            <div class="botones">
                <router-link to="/clientes">
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
                    <h5 class="modal-title" id="exampleModalLabel">¡Cliente creado!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">El cliente "{{ empresa }}" fue creado exitosamente.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal" @click="verClientes()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.contenido {
    margin-top: 1%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: left;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
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
    margin-top: 10px;
    margin-right: 15px;
    text-align: right;
}

.botones button {
    margin-top: 10px;
    margin-left: 10px;
}
</style>