<!-- TO DO LIST -->
<!-- ☑ Cambiar el contador para que aumente solo hasta que se le de agregar LISTO -->
<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { onBeforeRouteLeave } from 'vue-router';
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { materialesStore } from "../stores/materiales";
import { tipoStore } from "../stores/tipopieza";
import { rfqStore } from "../stores/rfq";
import { piezasrfqStore } from "../stores/piezasrfq";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { obtenerMateriales } = materialesStore();
const { obtenerTipos } = tipoStore();
const { getUser } = loginStore();
const { agregarRFQ, obtenerRFQ } = rfqStore();
const { agregarPiezas } = piezasrfqStore();
const { obtenerIdPorUser, obtenerIdUsuarioPorUser } = usuariosStore();

const visibleGestionar = ref("");
const Usuario = getUser();

// Variables reactivas
const nuevoRFQ = ref('');
const nuevoNumeroPieza = ref('');
const materiales = ref([]);
const materialSeleccionado = ref("Seleccionar material");
const cantidad = ref("");
const comentarios = ref('');
const tipos = ref([]);
const tiposSeleccionado = ref("Seleccionar tipo");
const espesor = ref('');
const diametro = ref('');
const largo = ref('');
const altura = ref('');
const rfqs = ref([]);
const contadorPiezas = ref(1);
let piezasGuardadas = ref([]);
const piezaEditada = ref(-1); // Inicializar con un valor que no sea un índice válido
const validado = ref(true);
const alertaLlenado = ref(false);
let tried = false;

// Declaración del modal
let modal;
let modalAgregar;
let idUsuario = '';

const contadorRFQ = ref(1);

onBeforeRouteLeave((to, from, next) => {
    // Verifica si el usuario está cambiando a una ruta diferente a la de la interfaz actual
    if (from.name === 'agregarRFQ') {
        // Limpia el almacenamiento sessionStorage
        limpiarStorage();
    }
    // Continúa con la navegación
    next();
});

onMounted(async () => {
    try {
        // Obteniendo el contador
        const today = new Date();
        const fecha = localStorage.getItem('fecha');
        const count = localStorage.getItem('rfqCount');
        // Si el contador esta vacio o es otro día reiniciar el contador a 1
        if (!count || fecha !== today.toDateString()) {
            contadorRFQ.value = 1;
        } else {
            // Si no obtener el contador
            contadorRFQ.value = parseInt(count);
        }

        consultarMateriales();
        consultarTipos();

        idUsuario = await obtenerIdUsuarioPorUser(Usuario);
        console.log(idUsuario);

        nuevoRFQ.value = generarNumeroRFQ();
        console.log(nuevoRFQ.value)

        cargarPiezasGuardadas();

        // Inicialización del modalModificarCosto
        modalAgregar = new bootstrap.Modal(document.getElementById('modalAgregar'), {
            backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });

        // Permisos
        const idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);
        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Gestionar RFQ") ? visibleGestionar.value = true : visibleGestionar.value = false;
    } catch (error) {
        console.error(error);
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
        if (element.Material === material) {
            idMaterial = element.idMaterial;
            return;
        }
    });
    return idMaterial;
}

const consultarTipos = async () => {
    try {
        tipos.value = await obtenerTipos();
        tipos.value = tipos.value.data.body;
        console.log(tipos.value);
    } catch (error) {
        console.log(error);
    }
};

function obtenerIdTipo(tipo) {
    let idTipo = null;
    tipos.value.forEach((element) => {
        if (element.Tipo === tipo) {
            idTipo = element.idTipoPieza;
            return;
        }
    });
    return idTipo;
}

const consultarRFQs = async () => {
    try {
        rfqs.value = await obtenerRFQ();
        rfqs.value = rfqs.value.data.body;
        console.log(rfqs.value);
    } catch (error) {
        console.log(error);
    }
};

function obtenerIdRFQ(noRFQ) {
    let idRFQ = null;
    rfqs.value.forEach((element) => {
        console.log(element.NoRFQ)
        console.log(noRFQ)
        if (element.NoRFQ === noRFQ) {
            idRFQ = element.idRFQ;
            return;
        }
    });
    return idRFQ;
}

// Generar un nuevo número de RFQ con el formato (Fecha-0001)
const generarNumeroRFQ = () => {
    const today = new Date();
    const formattedCount = contadorRFQ.value.toString().padStart(4, '0');
    const rfqNumber = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${formattedCount}`;

    return rfqNumber;
};

// Generar un nuevo número de pieza con el formato (Fecha-0001-001)
const generarNumeroPieza = () => {
    const formattedCount = contadorPiezas.value.toString().padStart(3, '0');
    const numeroPieza = `${nuevoRFQ.value}-${formattedCount}`;
    // Aumenta el contador para la próxima pieza
    contadorPiezas.value++;
    return numeroPieza;
};

// Abrir Modal para agregar una nueva pieza
const abrirModal = () => {
    nuevoNumeroPieza.value = generarNumeroPieza();
    // Abre el modal
    modalAgregar.show();
};

const crearPieza = () => {
    try {

        const nuevaPieza = {
            numeroPieza: nuevoNumeroPieza.value,
            tipo: tiposSeleccionado.value,
            altura: altura.value,
            espesor: espesor.value,
            largo: largo.value,
            diametro: diametro.value,
            material: materialSeleccionado.value,
            cantidad: cantidad.value,
            comentarios: comentarios.value
        };

        if (piezaEditada.value !== -1) {
            // Editar la pieza existente en la lista en lugar de agregar una nueva
            piezasGuardadas.value.splice(piezaEditada.value, 1, nuevaPieza);
            piezaEditada.value = -1; // Restablecer el índice de edición a un valor no válido
        } else {
            // Si no se está editando, agregar una nueva pieza
            piezasGuardadas.value.push(nuevaPieza);
        }

        // Guardar en el Session Storage
        sessionStorage.setItem('piezasRFQ', JSON.stringify(piezasGuardadas));

        // Cerrar el modal después de agregar la pieza
        modalAgregar.hide();

        // Limpiar los campos del formulario modal
        limpiarCampos();
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

const editarPieza = (pieza) => {
    if (Array.isArray(piezasGuardadas.value)) {
        piezaEditada.value = piezasGuardadas.value.findIndex(item => item.numeroPieza === pieza.numeroPieza);
    } else {
        console.error('piezasGuardadas no es un array');
    }

    // Llenar los campos del formulario modal con los datos de la pieza seleccionada para editar
    nuevoNumeroPieza.value = pieza.numeroPieza;
    tiposSeleccionado.value = pieza.tipo;
    altura.value = pieza.altura;
    espesor.value = pieza.espesor;
    largo.value = pieza.largo;
    diametro.value = pieza.diametro;
    materialSeleccionado.value = pieza.material;
    cantidad.value = pieza.cantidad;
    comentarios.value = pieza.comentarios;

    // Guardar el índice de la pieza a editar
    piezaEditada.value = piezasGuardadas.value.findIndex(item => item.numeroPieza === pieza.numeroPieza);

    // Abre el modal para editar la pieza
    modalAgregar.show();
};

const borrarPieza = (index) => {
    // Elimina la pieza de la lista según su índice
    piezasGuardadas.value.splice(index, 1); // Accede al valor del ref usando .value
    // Actualiza el Session Storage
    sessionStorage.setItem('piezasRFQ', JSON.stringify(piezasGuardadas.value)); // Accede al valor del ref usando .value
    // ...
};

const cargarPiezasGuardadas = () => {
    const piezasAlmacenadas = sessionStorage.getItem('piezasRFQ');
    if (piezasAlmacenadas) {
        piezasGuardadas.value = JSON.parse(piezasAlmacenadas);
    }
};

const obtenerFechaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const fechaActual = `${year}-${month}-${day}`;
    return fechaActual;
};

const realizarInserciones = async () => {
    try {
        // Obtener el nuevo RFQ y fecha (reemplaza esto con tu lógica real)
        const noRFQ = nuevoRFQ.value;
        const fecha = obtenerFechaActual();

        console.log(noRFQ);
        console.log(fecha);
        console.log(idUsuario);

        // Agregar el RFQ
        await agregarRFQ(noRFQ, idUsuario, fecha);

        await consultarRFQs();

        // Obtener el ID del RFQ recién insertado
        const idRFQ = await obtenerIdRFQ(noRFQ);
        console.log(idRFQ);

        if (Array.isArray(piezasGuardadas.value)) {
            // Recorrer cada pieza guardada para insertarlas en la base de datos
            for (const pieza of piezasGuardadas.value) {
                console.log(pieza.tipo);
                const idTipoPieza = obtenerIdTipo(pieza.tipo);
                const idMaterial = obtenerIdMaterial(pieza.material);
                const idRFQ = obtenerIdRFQ(noRFQ);
                console.log(idTipoPieza);
                console.log(idMaterial);
                console.log(idRFQ);

                // // Insertar cada pieza con los datos obtenidos
                await agregarPiezas(
                    pieza.numeroPieza,
                    idRFQ,
                    idTipoPieza,
                    idMaterial,
                    pieza.altura,
                    pieza.espesor,
                    pieza.largo,
                    pieza.diametro,
                    pieza.cantidad,
                    pieza.comentarios
                );
            }
        } else {
            console.error('piezasGuardadas no es un array');
        }
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
    }
};

const guardarRFQ = async () => {
    try {
        // Realiza las inserciones o actualizaciones en la base de datos
        await realizarInserciones();
        // Limpia el almacenamiento sessionStorage después de guardar los cambios
        limpiarStorage();
        // Incrementa el contador después de guardar los cambios
        contadorRFQ.value++;
        // Almacenar el nuevo contador de RFQ en el sessionStorage
        localStorage.setItem('rfqCount', contadorRFQ.value.toString());

        const hoy = new Date();
        localStorage.setItem('fecha', hoy.toDateString());
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });
        // Al ser todo exitoso, mostramos el modal notificando el exito
        modal.show();
    } catch (error) {
        console.error(error);
    }
};

// Función que redirigue a la pantalla rfq
function verRFQ() {
    modal.hide();
    router.push({ name: "rfq" });
}

////////////////////////////////////// LIMPIEZAS ///////////////////////////////////////////////////////

// Limpiar campos si se cambia el tipo de pieza
const limpiarCamposIrrelevantes = (tipo) => {
    // Si el tipo de pieza cambia a 'Rectangular'
    if (tipo === 'Rectangular') {
        // Borra el campo 'diametro'
        diametro.value = '';
    }
    // Si el tipo de pieza cambia a 'Redonda'
    else if (tipo === 'Redonda') {
        // Borra los campos 'altura' y 'espesor'
        altura.value = '';
        espesor.value = '';
    }

};

const limpiarCampos = () => {
    nuevoNumeroPieza.value = '';
    tiposSeleccionado.value = 'Seleccionar tipo';
    altura.value = '';
    espesor.value = '';
    largo.value = '';
    diametro.value = '';
    materialSeleccionado.value = 'Seleccionar material';
    cantidad.value = "";
    comentarios.value = '';
};

const limpiarStorage = () => {
    sessionStorage.removeItem('piezasRFQ');
    // Limpiar piezasGuardadas
    piezasGuardadas.value = []; // Asignar un nuevo array vacío
    // Luego, puedes también limpiar los campos del formulario si es necesario
    limpiarCampos();
};

////////////////////////////////////// FUNCIONES VALIDACIONES ///////////////////////////////////////////////////////

// Validar formato de Altura
function validarAltura() {
    // Eliminar cualquier carácter que no sea un número o punto o diagonal del campo de altura
    altura.value = altura.value.replace(/[^\d./]/g, '');

    // Validar que el formato de altura (D - D.DDD - D/D)
    let re = /^\d+(\.\d{3})?$|^\d+\/\d+$/;
    let input = document.getElementById('altura');

    if (re.test(altura.value)) {
        // Altura válida, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Altura no válida, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar formato de Espesor
function validarEspesor() {
    // Eliminar cualquier carácter que no sea un número o punto o diagonal del campo de espesor
    espesor.value = espesor.value.replace(/[^\d./]/g, '');

    // Validar que el formato de espesor (D - D.DDD - D/D)
    let re = /^\d+(\.\d{3})?$|^\d+\/\d+$/;
    let input = document.getElementById('espesor');

    if (re.test(espesor.value)) {
        // Espesor válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Espesor no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar formato de Largo
function validarLargo() {
    // Eliminar cualquier carácter que no sea un número o punto o diagonal del campo de largo
    largo.value = largo.value.replace(/[^\d./]/g, '');

    // Validar que el formato de largo (D - D.DDD - D/D)
    let re = /^\d+(\.\d{3})?$|^\d+\/\d+$/;
    let input = document.getElementById('largo');

    if (re.test(largo.value)) {
        // Largo válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Largo no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar formato de Diámetro
function validarDiametro() {
    // Eliminar cualquier carácter que no sea un número o punto o diagonal del campo de diámetro
    diametro.value = diametro.value.replace(/[^\d./]/g, '');

    // Validar que el formato de diámetro (D - D.DDD - D/D)
    let re = /^\d+(\.\d{3})?$|^\d+\/\d+$/;
    let input = document.getElementById('diametro');

    if (re.test(diametro.value)) {
        // Diámetro válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Diámetro no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}

// Validar formato de Diámetro
function validarCantidad() {
    // Eliminar cualquier carácter que no sea un número del campo de cantidad
    cantidad.value = cantidad.value.replace(/\D/g, '');

    // Validar que el cantidad sea mayor a 1
    let re = /^[1-9]\d*$/;
    let input = document.getElementById('cantidad');

    if (re.test(cantidad.value)) {
        // Si es un número válido y mayor que cero, muestra el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Si no es un número o es menor o igual a cero, muestra el borde en rojo
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

// Validar que la tabla no se encuentre vacia
const TablaVacia = computed(() => {
    return piezasGuardadas.value.length === 0;
});

</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="rfq"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <div class="table-container">
            <h1 class="titulo"><b>Agregar Nuevo RFQ</b></h1>
            <div class="flex botones">
                <button class="btn" @click="abrirModal">Agregar &nbsp;<i class="fas fa-plus fa-plus-icon"></i> </button>
            </div>
        </div>
        <!-- tabla de piezas -->
        <div class="table-wrapper-scroll-y my-custom-scrollbar mx-auto"
            style="width: 95%; border: 1px solid gray; background-color:#f4f4f4;">
            <table class="table table-bordered mb-0 table-light">
                <thead class="thead-light " style="position: sticky; top: 0; text-align: center;">
                    <tr class="table-gray-border" st>
                        <th scope="col">N° Pieza</th>
                        <th scope="col">Material</th>
                        <th scope="col">Altura</th>
                        <th scope="col">Espesor</th>
                        <th scope="col">Largo</th>
                        <th scope="col">Diámetro</th>
                        <th scope="col">Cantidad</th>
                        <th scope="col">Comentarios</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr v-for="(pieza, index) in piezasGuardadas" :key="index">
                        <td>{{ pieza.numeroPieza }}</td>
                        <td>{{ pieza.material }}</td>
                        <td>{{ pieza.altura }}</td>
                        <td>{{ pieza.espesor }}</td>
                        <td>{{ pieza.largo }}</td>
                        <td>{{ pieza.diametro }}</td>
                        <td>{{ pieza.cantidad }}</td>
                        <td>{{ pieza.comentarios }}</td>
                        <th scope="row" style="width: 10vw;">
                            <button class="btn btn-primary mx-1 btn-spacer" type="submit"
                                style="background-color: hsl(0, 0%, 96%); border-color: #f4f4f4; height: 37px;"
                                @click="editarPieza(pieza)">
                                <i class="fa-solid fa-pen-to-square text-gray"></i>
                            </button>
                            <button class="btn btn-primary mx-1 btn-delete" type="submit"
                                style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                @click="borrarPieza(index)">
                                <i class="fas fa-trash-alt text-gray"></i>
                            </button>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="btnes">
            <router-link to="/rfq">
                <button class="btn btn-cancelar" @click="limpiarStorage">Cancelar</button>
            </router-link>
            <button :disabled="TablaVacia" class="btn btn-primary btn-yellow" type="submit" @click="guardarRFQ">
                Guardar
            </button>
        </div>
    </div>
    <!------------------------------------------------ Modal para Agregar ------------------------------------------------>
    <div class="modal fade" id="modalAgregar" tabindex="-1" aria-labelledby="modalAgregarLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalAgregarLabel">Agregar Pieza RFQ</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col">
                            <label for="numPieza" class="form-label">N° Pieza</label>
                            <input type="text" class="form-control" v-model="nuevoNumeroPieza" readonly id="numPieza">
                        </div>
                        <div class="col">
                            <label for="tipo" class="form-label">Tipo</label>
                            <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                                v-model="tiposSeleccionado" required @change="limpiarCamposIrrelevantes(tiposSeleccionado)"
                                id="tipo">
                                <option v-for="tipo in tipos">{{ tipo.Tipo }}</option>
                            </select>
                        </div>
                    </div>
                    <br>
                    <hr style="background-color: #7d7d7d; height: 2px; border: none;">
                    <div class="row" v-if="tiposSeleccionado === 'Rectangular'">
                        <div class="col">
                            <label for="altura" class="form-label">Altura<span class="small-text"> (pulgadas)</span></label>
                            <input type="text" class="form-control input-f inptElement form-color" v-model.trim="altura"
                                @input="validarAltura" id="altura">
                        </div>
                        <div class="col">
                            <label for="espesor" class="form-label">Espesor<span class="small-text">
                                    (pulgadas)</span></label>
                            <input type="text" class="form-control input-f inptElement form-color" v-model.trim="espesor"
                                @input="validarEspesor" id="espesor">
                        </div>
                        <div class="col">
                            <label for="largo" class="form-label">Largo<span class="small-text"> (mm)</span></label>
                            <input type="text" class="form-control input-f inptElement form-color" v-model.trim="largo"
                                @input="validarLargo" id="largo">
                        </div>
                    </div>
                    <div class="row" v-else-if="tiposSeleccionado === 'Redonda'">
                        <div class="col">
                            <label for="largo" class="form-label">Largo<span class="small-text"> (mm)</span></label>
                            <input type="text" class="form-control input-f inptElement form-color" v-model.trim="largo"
                                @input="validarLargo" id="largo">
                        </div>
                        <div class="col">
                            <label for="diametro" class="form-label">Diámetro<span class="small-text">
                                    (pulgadas)</span></label>
                            <input type="text" class="form-control input-f inptElement form-color" v-model.trim="diametro"
                                @input="validarDiametro" id="diametro">
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
                            <label for="cantidad" class="form-label">Cantidad</label>
                            <input type="text" class="form-control input-f inptElement form-color" v-model.trim="cantidad"
                                @input="validarCantidad" id="cantidad">
                        </div>
                    </div>
                    <br>
                    <div class="row">
                        <div class="col">
                            <label for="comentarios" class="form-label">Comentarios</label>
                            <input type="text" class="form-control form-color" id="comentarios" v-model="comentarios">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary btn-yellow" @click="guardarPieza">Agregar</button>
                </div>
            </div>
        </div>
    </div>
    <!------------------------------------------- Modal --------------------------------------------------->
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">¡RFQ creado!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">El RFQ "{{ nuevoRFQ }}" fue creado exitosamente.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-yellow" data-bs-dismiss="modal" @click="verRFQ()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.small-text {
    /* Tamaño de fuente más pequeño */
    font-size: 0.7em;
    /* Opacidad reducida */
    opacity: 0.6;
}

.btnes {
    margin-top: 15px;
    margin-right: 35px;
    text-align: right;
}

.btnes button {
    margin-top: 10px;
    margin-left: 10px;
}

.btn-yellow {
    background-color: #FFCA0A;
    color: black;
    width: 90px;
    border: none;
}

.btn-cancelar {
    border-radius: 10px;
    background-color: white;
    color: red;
    border: 2px solid red;

}

.table-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2%;
}

.titulo {
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;
    margin-left: 30px;
    margin-top: 20px;
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
    height: auto;
    width: 95%;
}

.botones button {
    margin-top: 20px;
    margin-right: 30px;
    height: 41.19px;
    background-color: #f4f4f4;
    width: auto !important;
    border: 1px solid lightgray;
}

.fa-plus-icon {
    font-weight: bold;
    transform: scale(1.2);
    /* Ajusta este valor para hacer el ícono más grueso */
}

.text-gray {
    color: gray;
}

.my-custom-scrollbar {
    position: relative;
    height: 250px;
    overflow: auto;
}

.table-wrapper-scroll-y {
    display: block;
}
</style>