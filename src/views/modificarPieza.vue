<script setup>
import { ref } from "vue"; //para usar variables reactivas
import { onMounted } from "vue"; //para poder usar el onMounted, que ejecuta todo lo que tenga adentro cada que cargue la pagina
import { catalogoStore } from "../stores/catalogo";
import { materialesStore } from "../stores/materiales"
import router from "../router";
import { useRoute } from 'vue-router';
import cabecera from "../components/Menu.vue";

const { obtenerPiezaPorId, obtenerPzas, getPieza, actualizarPieza } = catalogoStore();
const { obtenerMateriales } = materialesStore();

const route = useRoute();

//variables reactivas
const codigo = ref("");
const arrayCodigo = ref([]);
const precio = ref("");
const descripcion = ref("");
const especificaciones = ref("");
const materiales = ref([]);
const nombreMaterial = ref("");
const peso = ref("");

const fotoFile = ref(null);
const dibujoFile = ref(null);

const idPzaActualizar = ref("");
const pieza = ref([]);

const materialSeleccionado = ref("Seleccionar material");
const mostrarModificarImagenes = ref(false);

const deshabilitado = ref(false);
const repetido = ref(false);

const tagCodigo = ref(null);

let codigoActual = "";
const codigoActualGuardado = ref(false); // Variable para indicar si código actual se ha guardado

//variable asociada al modal
let modal;

let tried = false;
const validado = ref(true);
const alertaLlenado = ref(false);

const idPieza = route.params.idPieza;

onMounted(async () => {
    try {
        await consultarMateriales();
        await obtenerDatosPza();
        await consultarPiezas();
        codigoActual = codigo.value;
        codigoActualGuardado.value = true; // Indicar que código actual se ha guardado        
    } catch (error) {
        console.log(error);
    }

});

//consulta los materiales usando el metodo de la store, los almacena en materialesArray
const consultarMateriales = async () => {
    try {
        materiales.value = await obtenerMateriales();
        materiales.value = materiales.value.data.body;
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

const obtenerDatosPza = async () => {
    try {
        idPzaActualizar.value = await getPieza() || idPieza;
        if (idPzaActualizar.value != "") {
            console.log("idPza")
            console.log(idPzaActualizar.value);
            pieza.value = await obtenerPiezaPorId(idPzaActualizar.value);
            console.log(pieza.value)
            codigo.value = pieza.value.NoPieza;
            console.log(pieza.value.NoPieza);
            precio.value = pieza.value.PrecioUnitario;
            descripcion.value = pieza.value.Descripcion;
            especificaciones.value = pieza.value.Especificaciones;
            materiales.value = await obtenerMateriales();
            materiales.value = materiales.value.data.body;
            materiales.value.forEach((element) => {
                if (element.idMaterial == pieza.value.idMaterial) {
                    nombreMaterial.value = element.Material;
                }
            })
            console.log(nombreMaterial);
            materialSeleccionado.value = nombreMaterial.value;
            peso.value = pieza.value.PesoKg;
            return true;
        } else {
            modal = new bootstrap.Modal(document.getElementById("modalError"), {
                keyboard: false,
            });
            modal.show();
        }
    } catch (error) {
        console.log(error);
    }
};

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
            let input = document.getElementById('tagCodigo');
            input.style.borderColor = "red";
            input.style.borderWidth = "1px";
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


const actPieza = async () => {
    try {
        console.log(materialSeleccionado.value);
        const idMaterial = obtenerIdMaterial(materialSeleccionado.value);
        console.log(idMaterial);
        console.log(idPzaActualizar.value);
        const formData = new FormData(); // Crear un objeto FormData

        formData.append('idPieza', idPzaActualizar.value);
        formData.append('NoPieza', codigo.value);
        formData.append('Descripcion', descripcion.value);
        formData.append('Especificaciones', especificaciones.value);
        formData.append('idMaterial', idMaterial);
        formData.append('PesoKg', peso.value);
        formData.append('PrecioUnitario', precio.value);
        formData.append('FOTO', fotoFile.value); // Agregar la foto al objeto FormData
        formData.append('DIBUJO', dibujoFile.value); // Agregar el dibujo técnico al objeto FormData
        formData.append('Activo', 1);
        await actualizarPieza(formData); //Actualizamos el usuario
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            keyboard: false,
        });
        modal.show(); //al ser todo exitoso, mostramos el modal notificando el exito
    } catch (error) {
        console.log(error);
    }
};

const actPiezaSC = async () => {
    try {
        console.log(materialSeleccionado.value);
        const idMaterial = obtenerIdMaterial(materialSeleccionado.value);
        console.log(idMaterial);
        console.log(idPzaActualizar.value);
        const formData = new FormData(); // Crear un objeto FormData

        formData.append('idPieza', idPzaActualizar.value);
        formData.append('NoPieza', codigo.value);
        formData.append('Descripcion', descripcion.value);
        formData.append('Especificaciones', especificaciones.value);
        formData.append('idMaterial', idMaterial);
        formData.append('PesoKg', peso.value);
        formData.append('PrecioUnitario', precio.value);
        formData.append('Activo', 1);
        await actualizarPieza(formData); //Actualizamos el usuario
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            keyboard: false,
        });
        modal.show(); //al ser todo exitoso, mostramos el modal notificando el exito
    } catch (error) {
        console.log(error);
    }
};

function guardarPieza() {
    const checkbox = document.getElementById("modifyP");

    if (checkbox.checked) {
        tried = true;
        //validado.value = true;

        if (
            camposVacios() &&
            validado.value
        ) {
            actPieza();
        } else {
            alertaLlenado.value = true;
        }
    } else {
        tried = true;
        //validado.value = true;
        if (
            camposVacios() &&
            validado.value
        ) {
            actPiezaSC();
        } else {
            alertaLlenado.value = true;
        }
    }
}

// Función que redirigue a la pantalla catalogo
function verCatalogo() {
    modal.hide();
    router.push({ name: "detallesPieza", params: { id: idPzaActualizar.value } });
}

/////////////////////////////////////////////////////// VALIDACIONES //////////////////////////////////////////////////////////////

function validarCodigo() {
    // Convertir el codigo a mayúsculas
    codigo.value = codigo.value.toUpperCase();

    let input = document.getElementById('tagCodigo');

    // Si el codigo existe y no es igual al código actual, establecer el borde en rojo
    if (repetido.value) {
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    } else {
        // Si el codigo no existe o es igual al código actual, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
        repetido.value = false;
        deshabilitado.value = false;
    }
}

function validarPrecio() {
    precio.value = precio.value.replace(/[^\d.]/g, '');

    // Validar que el PRECIO tenga exactamente 5 números
    let re = /^\d+(\.\d{2})?$/;
    let input = document.getElementById('tagPrecio');

    if (re.test(precio.value)) {
        // PRECIO válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // PRECIO no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

function validarPeso() {
    peso.value = peso.value.replace(/[^\d.]/g, '');

    // Validar que el PESO tenga exactamente 5 números
    let re = /^\d+(\.\d{3})?$/;
    let input = document.getElementById('tagPeso');

    if (re.test(peso.value)) {
        // PESO válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // PESO no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

function modificarC() {
    const checkbox = document.getElementById("modifyP");
    mostrarModificarImagenes.value = checkbox.checked;

    if (checkbox.checked) {
        document.getElementById("foto").style.display = "block";
        document.getElementById("dibujo").style.display = "block";
    } else {
        document.getElementById("foto").style.display = "none";
        document.getElementById("dibujo").style.display = "none";
    }
}

function camposVacios() {
    if (tried) {
        let aprobado = true;
        validado.value = true;
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        let inputs = document.querySelectorAll(".input-f");
        // Loop over them and prevent submission
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
        <h1 class="titulo"><b>Modificar Pieza </b></h1>
        <form @submit.prevent="guardarPieza()" class="needs-validation formulario" novalidate>
            <div class="row">
                <div class="col">
                    <label for="tagCodigo" class="form-label">Código</label>
                    <input type="text" class="form-control input-f inptElement form-color" @input="validarCodigo"
                        v-model.trim="codigo" ref="tagCodigo" autofocus required placeholder="Codigo" id="tagCodigo">
                    <div v-if="codigoActual && codigo && codigoActual !== codigo && revisarPzaExistente()"
                        class="alert alert-danger mt-2 d-flex align-items-center" style="height: 10px; font-size:12px;"
                        role="alert">
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
                    <label for="material" class="form-label">Material</label>
                    <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                        v-model="materialSeleccionado" required id="material">
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
                <div class="form-check" style="text-align: center;">
                    <input class="form-check-input" type="checkbox" value="" @input="modificarC()" id="modifyP">
                    <span class="form-check-label">
                        Modificar Foto y Dibujo
                    </span>
                </div>
            </div>
            <div class="row" v-show="mostrarModificarImagenes" style="margin-top: 15px;">                
                <div class="col" id="foto">
                    <label class="form-label" for="inputFoto">Foto</label>
                    <input id="inputFoto" class="form-control form-color" type="file"
                        @change="cargarArchivo('FOTO', $event)" />
                </div>                
                <div class="col" id="dibujo">
                    <label class="form-label" for="inputDibujo">Dibujo Técnico</label>
                    <input id="inputDibujo" class="form-control form-color" type="file"
                        @change="cargarArchivo('DIBUJO', $event)" />
                </div>
            </div>
            <div class="botones">
                <router-link v-if="idPzaActualizar" :to="`/detallesPieza/${idPzaActualizar}`">
                    <button class="btn btn-cancelar">Cancelar</button>
                </router-link>
                <button class="btn btn-primary btn-amarillo" type="submit" :disabled="deshabilitado">
                    Guardar
                </button>
            </div>

        </form>
    </div>
    <!------------------------------------------------ Modal ------------------------------------------------------------>
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">¡Pieza actualizada!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">La pieza "{{ codigo }}" fue modificada exitosamente.
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
    height: auto;
    margin-bottom: 20px;
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

.btn-amarillo {
    background-color: #FFCA0A;
    color: black;
    width: 90px;
    border: none;
}
</style>
