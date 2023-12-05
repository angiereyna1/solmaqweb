<script setup>
import { ref, onMounted } from "vue";
import router from "../router";
import { materialesStore } from "../stores/materiales";
import { catalogoStore } from "../stores/catalogo";
import cabecera from "../components/Menu.vue";

const { obtenerMateriales } = materialesStore();
const { agregarPieza, obtenerPzas } = catalogoStore();

// variables reactivas
const materiales = ref([]);
const materialSeleccionado = ref("Seleccionar material");
const codigo = ref("");
const arrayCodigo = ref([]);
const precio = ref("");
const descripcion = ref("");
const especificaciones = ref("");
const peso = ref("");
const fotoFile = ref(null);
const dibujoFile = ref(null);
const deshabilitado = ref(false);
const repetido = ref(false);
const validado = ref(true);
const alertaLlenado = ref(false);

let tried = false;

//variable asociada al modal
let modal;

onMounted(async () => {
    try {
        consultarPiezas();
        consultarMateriales();
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

const consultarMateriales = async () => {
    try {
        materiales.value = await obtenerMateriales();
        materiales.value = materiales.value.data.body;
        console.log(materiales.value);
    } catch (error) {
        console.log(error);
    }
};

function obtenerIdMaterial(material) {
    let idMaterial = null;
    materiales.value.forEach((element) => {
        if (element.Material == material) {
            idMaterial = element.idMaterial;
            return;
        }
    });
    return idMaterial;
}

const consultarPiezas = async () => {
    try {
        arrayCodigo.value = [];
        let piezas = await obtenerPzas();
        piezas = piezas.data.body;
        piezas.forEach((element) => {
            arrayCodigo.value.push(element);
        });
    } catch (error) {
        console.log(error);
    }
};

function revisarPzaExistente() {
    for (let j in arrayCodigo.value) {
        if (arrayCodigo.value[j].NoPieza.toLowerCase() === codigo.value.toLowerCase()) {
            // codigo encontrado en la lista, retorna true
            deshabilitado.value = true;
            return true;
        }
    }
    // codigo no encontrado en la lista, retorna false
    return false;
}

// Función que carga los archivos de Fotos
function cargarArchivo(tipo, event) {
    // Obtiene el archivo seleccionado por el usuario del evento.
    const file = event.target.files[0];

    // Verifica el tipo de archivo y asigna el archivo al campo correspondiente.
    if (tipo === 'FOTO') {
        // Si el tipo es 'FOTO', asigna el archivo al campo 'campoFoto'.
        fotoFile.value = file;
    } else if (tipo === 'DIBUJO') {
        // Si el tipo es 'DIBUJO', asigna el archivo al campo 'campoDibujo'.
        dibujoFile.value = file;
    }
}

const crearPieza = async () => {
    try {
        // Obtener el id del material fue seleccionado
        const idMaterial = obtenerIdMaterial(materialSeleccionado.value);
        // Crear un objeto FormData
        const formData = new FormData();

        formData.append('idPieza', 0);
        formData.append('NoPieza', codigo.value);
        formData.append('Descripcion', descripcion.value);
        formData.append('Especificaciones', especificaciones.value);
        formData.append('idMaterial', idMaterial);
        formData.append('PesoKg', peso.value);
        formData.append('PrecioUnitario', precio.value);
        // Agregar la foto al objeto FormData
        formData.append('FOTO', fotoFile.value);
        // Agregar el dibujo técnico al objeto FormData
        formData.append('DIBUJO', dibujoFile.value);
        formData.append('Activo', 1);

        // Enviar el objeto FormData al método agregarPieza
        await agregarPieza(formData);
        // Al ser todo exitoso, mostramos el modal notificando el exito
        modal.show();
    } catch (error) {
        console.log(error);
    }
};

function guardarPieza() {
    tried = true;
    validado.value = true;
    camposVacios();
    if (
        camposVacios()
    ) {
        crearPieza();
    } else {
        alertaLlenado.value = true;
    }
}

// Función que redirigue a la pantalla catalogo
function verCatalogo() {
    modal.hide();
    router.push({ name: "catalogo" });
}

////////////////////////////////////// FUNCIONES VALIDACIONES ///////////////////////////////////////////////////////

// Validar Código de Pieza
function validarCodigo() {
    // Convertir el codigo a mayúsculas
    codigo.value = codigo.value.toUpperCase();

    let input = document.getElementById('tagCodigo');

    // Si el codigo existe, establecer el borde en rojo
    if (repetido.value) {
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    } else {
        // Si el codigo no existe, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
        repetido.value = false;
        deshabilitado.value = false;
    }
}

// Validar formarto Precio
function validarPrecio() {
    // Eliminar cualquier carácter que no sea un número o punto del campo de precio
    precio.value = precio.value.replace(/[^\d.]/g, '');



    let re = /^\d+(\.\d{2})?$/;
    let input = document.getElementById('tagPrecio');

    if (re.test(precio.value)) {
        // Precio válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Precio no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar formato Peso
function validarPeso() {
    // Eliminar cualquier carácter que no sea un número o punto del campo de peso
    peso.value = peso.value.replace(/[^\d.]/g, '');

    // Validar que el formato de peso (D - D.DDD)
    let re = /^\d+(\.\d{3})?$/;
    let input = document.getElementById('tagPeso');

    if (re.test(peso.value)) {
        // Peso válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Peso no válido, establecer el borde en rojo
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
    <cabecera interfaz="catalogo"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <h1 class="titulo"><b>Crear Nueva Pieza </b></h1>
        <form @submit.prevent="guardarPieza()" class="needs-validation formulario" novalidate>
            <div class="row">
                <div class="col">
                    <label for="tagCodigo" class="form-label">Código</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarCodigo"
                        v-model.trim="codigo" ref="tagCodigo" autofocus required placeholder="Codigo" id="tagCodigo">
                    <div v-if="revisarPzaExistente()" class="alert alert-danger mt-2 d-flex align-items-center"
                        style="height: 10px; font-size:12px;" role="alert">
                        "{{ codigo }}" ya existe
                    </div>
                </div>
                <div class="col">
                    <label for="tagPrecio" class="form-label">Precio</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="precio"
                        @input="validarPrecio" ref="tagPrecio" autofocus required placeholder="$0000.00" id="tagPrecio">
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col">
                    <label for="tagDescripcion" class="form-label">Descripción</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="descripcion"
                        ref="tagDescripcion" autofocus required placeholder="Descripción breve" id="tagDescripcion">
                </div>
                <div class="col">
                    <label for="tagEspecificaciones" class="form-label">Especificaciones</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="especificaciones"
                        ref="tagEspecificaciones" autofocus required placeholder="Especificaciones pieza"
                        id="tagEspecificaciones">
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col">
                    <label for="tagMaterial" class="form-label">Material</label>
                    <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                        v-model="materialSeleccionado" required id="tagMaterial">
                        <option v-for="material in materiales">{{ material.Material }}</option>
                    </select>
                </div>
                <div class="col">
                    <label for="tagPeso" class="form-label">Peso (kg)</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="peso" ref="tagPeso"
                        @input="validarPeso" autofocus required placeholder="0000.00" id="tagPeso">
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col">
                    <label for="tagFoto" class="form-label">Foto</label>
                    <input class="form-control form-color" type="file" @change="cargarArchivo('FOTO', $event)"
                        id="tagFoto" />
                </div>
                <div class="col">
                    <label for="tagDibujo" class="form-label">Dibujo Técnico</label>
                    <input class="form-control form-color" type="file" @change="cargarArchivo('DIBUJO', $event)"
                        id="tagDibujo" />
                </div>
            </div>
            <div class="botones">
                <router-link to="/catalogo">
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
                    <h5 class="modal-title" id="exampleModalLabel">¡Pieza creada!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">La pieza "{{ codigo }}" fue creado exitosamente.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal" @click="verCatalogo()">
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
    margin-bottom: 20px;
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
    margin-right: 10px;
    text-align: right;
}

.botones button {
    margin-top: 10px;
    /* Ajusta el espacio entre los botones si es necesario */
    margin-left: 10px;
    /* Ajusta el espacio entre los botones si es necesario */
}
</style>
