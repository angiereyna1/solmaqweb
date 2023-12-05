<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { useRoute } from 'vue-router';
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { clientesStore } from "../stores/clientes";
import { rfqStore } from "../stores/rfq";
import { piezasrfqStore } from "../stores/piezasrfq"
import { materialesStore } from "../stores/materiales"
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerUnUser } = usuariosStore();
const { obtenerRFQ, obtenerRFQPorId, cambiarEstatus } = rfqStore();
const { obtenerPorRFQ, actualizarCostos } = piezasrfqStore();
const { obtenerClientePorId } = clientesStore();
const { obtenerMateriales } = materialesStore();

const route = useRoute();

const visibleGestionar = ref("");
const visiblePedir = ref("");
const Usuario = getUser();

const rfqsArray = ref([]);
const rfqsDesplegados = ref([]);
const piezasArray = ref([]);
const piezasDesplegados = ref([]);

const idRFQ = route.params.idRFQ;

//variables reactivas
const noRFQ = ref("");
const razonSocial = ref("");
const fecha = ref("");
const costoTotal = ref("");
const estatus = ref("");

const materiales = ref([]); // Variable reactiva para almacenar los roles

// Variables reactivas para el modal
const costoModificado = ref(""); // Variable para almacenar el costo modificado
const piezaSeleccionada = ref(null); // Variable para almacenar la pieza seleccionada

// Variable reactiva para almacenar el estado de completitud de los costos
const todosCostosCompletos = ref(false)

// Declaración del modalModificarCosto
let modal;
let modalModificarCosto;

onMounted(async () => {
    try {
        await consultarRfqs();
        await consultarPiezas();
        await consultarMateriales();
        console.log(idRFQ)
        const rfq = await obtenerRFQPorId(idRFQ);
        console.log(rfq);

        // llenar variables reactivas
        noRFQ.value = rfq.NoRFQ || "";
        fecha.value = rfq.FechaRFQ || "";
        estatus.value = rfq.Estatus;
        console.log(rfq.idUsuario);
        razonSocial.value = await obtenerRazonSocial(rfq.idUsuario)
        costoTotal.value = rfq.CostoTotal || "";

        // Inicialización del modalModificarCosto
        modalModificarCosto = new bootstrap.Modal(document.getElementById('modalModificarCosto'), {
            backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });

        // Agrega el event listener para el evento hidden.bs.modal
        modalModificarCosto._element.addEventListener('hidden.bs.modal', () => {
            costoModificado.value = ""; // Resetear el valor del costo modificado al cerrar el modal
        });

        // Permisos
        const idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);
        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Agregar Costos RFQ") ? visibleGestionar.value = true : visibleGestionar.value = false;
        permisos.includes("Realizar Pedidos") ? visiblePedir.value = true : visiblePedir.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarRfqs = async (activo) => {
    try {
        const response = await obtenerRFQ(activo);
        const rfqs = response.data.body.filter(rfq => rfq.Activo === activo);

        rfqsArray.value = rfqs;
        rfqsDesplegados.value = rfqsArray.value
    } catch (error) {
        console.log(error);
    }
};

const consultarPiezas = async () => {
    try {
        const response = await obtenerPorRFQ(idRFQ);
        const piezas = response.data.body;

        piezasArray.value = piezas;
        piezasDesplegados.value = piezasArray.value
    } catch (error) {
        console.log(error);
    }
};

const consultarMateriales = async () => {
    try {
        const response = await obtenerMateriales();
        materiales.value = response.data.body;
    } catch (error) {
        console.log(error);
    }

};

const obtenerRazonSocial = async (idUsuario) => {
    try {
        const usuario = await obtenerUnUser(idUsuario);
        const idCliente = usuario.idCliente;
        const cliente = await obtenerClientePorId(idCliente);
        return cliente.RazonSocial;
    } catch (error) {
        console.error(error);
        return 'Error obteniendo Razón Social';
    }
};


const getMaterial = (idMaterial) => {
    // Encuentra el objeto de material correspondiente al idMaterial
    const material = materiales.value.find(material => material.idMaterial === idMaterial);
    // Retorna el nombre del rol si se encuentra, o una cadena vacía si no
    return material ? material.Material : '';
};

const abrirModalModificarCosto = (pieza) => {
    piezaSeleccionada.value = pieza;
    // Abre el modal
    modalModificarCosto.show();
};

// Función para verificar si todos los costos de las piezas están completos
const verificarTodosCostosCompletos = () => {
    todosCostosCompletos.value = piezasDesplegados.value.every(pieza => {
        const costoGuardado = sessionStorage.getItem(`costo_${pieza.idPiezaRFQ}`);
        return costoGuardado !== null && !isNaN(parseFloat(costoGuardado));
    });
};

// Función para guardar el costo modificado
const guardarCostoModificado = () => {
    if (piezaSeleccionada.value && !isNaN(costoModificado.value)) {
        const costo = parseFloat(costoModificado.value);
        if (costo > 0) {
            // Guarda el costo en sessionStorage
            sessionStorage.setItem(`costo_${piezaSeleccionada.value.idPiezaRFQ}`, costo);
            modalModificarCosto.hide(); // Cierra el modal después de guardar el costo modificado

            // Verifica si todos los costos de las piezas están completos después de guardar el costo
            verificarTodosCostosCompletos();
        } else {
            alert('El costo debe ser un número positivo');
        }
    } else {
        alert('Por favor, seleccione una pieza y escriba un costo válido');
    }
};

const realizarInserciones = async () => {
    try {        
        let sumaCostos = 0;
        // Obtener los datos modificados almacenados en sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith('costo_')) {
                const idPiezaRFQ = key.replace('costo_', '');
                const costo = parseFloat(sessionStorage.getItem(key));
                // Realizar inserción o actualización en la base de datos con el nuevo costo
                // Utiliza la función correspondiente para actualizar el costo de la pieza
                await actualizarCostos(idPiezaRFQ, costo);
                console.log(idPiezaRFQ)
                console.log(piezasDesplegados.value)
                const pieza = piezasDesplegados.value.find(pieza => pieza.idPiezaRFQ.toString() === idPiezaRFQ);
                console.log(pieza)
                if (pieza) {
                    const costoTotalPieza = costo * pieza.Cantidad; // Multiplica costo unitario por cantidad
                    console.log(costoTotalPieza)
                    sumaCostos += costoTotalPieza; // Suma el costo total por pieza                    
                }
            }
        }
        // Cambia el estado usando la función cambiarEstatus del store de RFQ
        await cambiarEstatus(idRFQ, sumaCostos); // Cambia el estado y envía la suma de costos

    } catch (error) {
        console.error(error);
    }
};

const guardarCambios = async () => {
    try {
        await realizarInserciones(); // Realiza las inserciones o actualizaciones en la base de datos
        limpiarStorage(); // Limpia el almacenamiento sessionStorage después de guardar los cambios
        modal = new bootstrap.Modal(document.getElementById("modal"), {
            keyboard: false,
        });
        modal.show(); //al ser todo exitoso, mostramos el modal notificando el exito
        // router.push({ name: "rfq" });
    } catch (error) {
        console.error(error);
    }
};

function verRFQ() {
    modal.hide();
    router.push({ name: "rfq" });
}



//////////////////////////////////////////// LIMPIEZAS /////////////////////////////////////////////////////

const limpiarStorage = () => {
    // Lógica para limpiar el almacenamiento sessionStorage
    // Elimina todos los elementos del sessionStorage relacionados con los costos
    Object.keys(sessionStorage)
        .filter(key => key.startsWith('costo_'))
        .forEach(key => {
            sessionStorage.removeItem(key);
        });
};

////////////////////////////////////////// FORMATOS ///////////////////////////////////////////////////////

// Formato costo
const mostrarCostoModificado = (pieza) => {
    const costoGuardado = sessionStorage.getItem(`costo_${pieza.idPiezaRFQ}`);
    return costoGuardado ? parseFloat(costoGuardado).toFixed(2) : pieza.CostoUnitario;
};


///////////////////////////////////////// VALIDACIONES /////////////////////////////////////////
function validarPrecio() {
    costoModificado.value = costoModificado.value.replace(/[^\d.]/g, '');

    // Validar que el código postal tenga exactamente 5 números
    let re = /^\d+(\.\d{2})?$/;
    let input = document.getElementById('costoModificado');

    if (re.test(costoModificado.value)) {
        // Código postal válido, establecer el borde en verde
        input.style.borderColor = "#3ac74d";
        input.style.borderWidth = "1px";
    } else {
        // Código postal no válido, establecer el borde en rojo
        input.style.borderColor = "red";
        input.style.borderWidth = "1px";
    }
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="rfq"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <div class="table-container">
            <h1 class="titulo"><b>Modificar RFQ: </b></h1>
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
                        <th scope="col">Costo Unitario</th>
                        <th scope="col">Importe</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr v-for="pieza in piezasDesplegados">
                        <td> {{ pieza.NoPiezaRFQ }} </td>
                        <td> {{ getMaterial(pieza.idMaterial) }} </td>
                        <td>{{ pieza.Altura ? pieza.Altura : 'No aplica' }}</td>
                        <td> {{ pieza.Espesor }} </td>
                        <td> {{ pieza.Largo }} </td>
                        <td> {{ pieza.Diametro ? pieza.Diametro : 'No aplica' }} </td>
                        <td> {{ pieza.Cantidad }} </td>
                        <td> {{ pieza.Comentarios }} </td>
                        <td> ${{ mostrarCostoModificado(pieza) }} </td>
                        <td> ${{ mostrarCostoModificado(pieza) ? pieza.Cantidad * mostrarCostoModificado(pieza) : "" }}
                        </td>
                        <th scope="row" style="width: 8vw;">
                            <button class="btn btn-primary mx-1 btn-create" type="submit"
                                style="background-color: #f4f4f4; border-color: #f4f4f4; height: 37px;"
                                @click="abrirModalModificarCosto(pieza)">
                                <!-- <i class="fas fa-coins text-gray"></i> -->
                                <i class="bi bi-coin bi-4x text-gray"></i>
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
            <button class="btn btn-primary btn-yellow" type="submit" @click="guardarCambios"
                :disabled="!todosCostosCompletos">Guardar</button>
        </div>
    </div>
    <!----------------------------------------------- Modal para modificar costo ---------------------------------------->
    <div class="modal fade" id="modalModificarCosto" tabindex="-1" aria-labelledby="modalModificarCostoLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalModificarCostoLabel">Modificar Costo de Pieza</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <label for="costoModificado">Nuevo Costo:</label>
                    <input type="text" class="form-control input-f inptElement form-color" v-model.trim="costoModificado"
                        @input="validarPrecio" id="costoModificado">
                    <!-- <input type="number" v-model="costoModificado" id="costoModificado" class="form-control"> -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary btn-yellow"
                        @click="guardarCostoModificado">Agregar</button>
                </div>
            </div>
        </div>
    </div>
    <!------------------------------------------------- Modal --------------------------------------------------------------->
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">¡Costos agregados!</h5>
                </div>
                <div class="modal-body" style="text-align: center;">Los costos fueron agregados exitosamente.
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
.btnes {
    position: absolute;
    bottom: 50px;    
    right: 95px;    
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
    /* Establece el borde redondo */
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
    height: 450px;
    width: 95%;
}

.text-gray {
    color: rgb(72, 71, 71);
    font-size: 1.2em;
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