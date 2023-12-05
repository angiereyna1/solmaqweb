<script setup>
import { ref, onMounted } from "vue";
import router from "../router";
import { useRoute } from 'vue-router';
import { catalogoStore } from "../stores/catalogo"
import { carritoStore } from '../stores/carrito'; // Importa el store del carrito
import { materialesStore } from "../stores/materiales"
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser, obtenerIdUsuarioPorUser } = usuariosStore();
const { obtenerPiezas, obtenerPiezaPorId, cambiarEstatus, setPieza } = catalogoStore();
const { obtenerUnMaterial } = materialesStore();
const { agregarAlCarrito } = carritoStore(); // Acción para agregar al carrito desde el store

const route = useRoute();

const visibleGestionar = ref("");
const visiblePedir = ref("");
const Usuario = getUser();

const piezas = ref([]);

const idPiezaCambiarEstatus = ref();
const estadoCambiarEstatus = ref(null);

const idPieza = route.params.id;

//variables reactivas
const codigo = ref("");
const precio = ref("");
const descripcion = ref("");
const especificaciones = ref("");
const material = ref("");
const peso = ref("");
const cantidad = ref(1);
const foto = ref("");
const thumbnails = ref([]); // Lista de miniaturas
const activo = ref("");

let modalConfirmacion;

let idUsuario = '';

onMounted(async () => {
    try {
        await consultarPiezas();

        console.log(idPieza)

        const pza = await obtenerPiezaPorId(idPieza);

        console.log(pza);

        // llenar variables reactivas
        codigo.value = pza.NoPieza || "";
        precio.value = pza.PrecioUnitario || "";
        descripcion.value = pza.Descripcion || "";
        especificaciones.value = pza.Especificaciones || "";
        const prueba = await obtenerUnMaterial(pza.idMaterial);
        console.log(prueba)
        material.value = prueba.Material || "";
        peso.value = pza.PesoKg || "";
        foto.value = pza.Foto || "";
        thumbnails.value = [pza.Foto, pza.Dibujo]
        activo.value = pza.Activo;

        // modal confirmar eliminar
        modalConfirmacion = new bootstrap.Modal(document.getElementById("modalConfirmacion"), {
            backdrop: "static", // Evita que el modal se cierre al hacer clic fuera del modal
            keyboard: false,
        });

        idUsuario = await obtenerIdUsuarioPorUser(Usuario);
        console.log(idUsuario);

        // Permisos
        const idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);
        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Gestionar Catalogo") ? visibleGestionar.value = true : visibleGestionar.value = false;
        permisos.includes("Realizar Pedidos") ? visiblePedir.value = true : visiblePedir.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarPiezas = async () => {
    try {
        const response = await obtenerPiezas();
        piezas.value = response.data.body;
    } catch (error) {
        console.error(error);
    }    
};

// Función principal para cambiar el estado de piezas
async function cambiarEstatusPzas(idPieza, estado) {
    try {
        const formData = new FormData(); // Crear un objeto FormData
        if (estado == 1) {
            estado = 0;
        } else {
            estado = 1;
        }
        formData.append('idPieza', idPieza);
        formData.append('Activo', estado);
        await cambiarEstatus(formData);

        // Actualizar la variable reactiva 'activo' con el nuevo estado
        activo.value = estado;
    } catch (error) {
        console.error(error);
    }
}

const confirmar = (idPieza, estado) => {
    // Guarda el idPieza y el estado en las referencias adecuadas
    idPiezaCambiarEstatus.value = idPieza;
    estadoCambiarEstatus.value = estado;
    // Muestra el modal de confirmación
    modalConfirmacion.show();
};

const modificarPieza = async (idPieza) => {
    try {
        setPieza(idPieza);
        router.push({ name: 'modificarPieza', params: { idPieza: idPieza } });
    } catch (error) {
        console.log(error);
    }
};

const agregarCarrito = () => {
  const pieza = {
    id: idPieza,
    codigo: codigo.value,
    cantidad: cantidad.value,
    precio: precio.value,    
    foto: foto.value    
  };

  agregarAlCarrito(pieza, idUsuario); // Agrega la pieza al carrito usando el store

  // Redirige al usuario a la vista del carrito
  router.push({ name: 'carrito' });
};

//////////////////////////////////////////////// FOTOS E IMAGENES ////////////////////////////////////////////////////

const cambiarFoto = (nuevaFoto) => {
    foto.value = nuevaFoto; // Cambia la foto principal al hacer clic en una miniatura
};
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="catalogo"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto position-relative flex">
        <router-link to="/catalogo">
            <button class="btn btn-redondo position-absolute top-0 start-0 m-3">
                <i class="fas fa-arrow-left icono-blanco"></i>
            </button>
        </router-link>

        <div class="left">
            <div class="main_image">
                <div class="thumbnails">
                    <img v-for="(thumbnail, index) in thumbnails" :key="index"
                        :src="`http://localhost:4000/images/${thumbnail}`" class="thumbnail"
                        @click="cambiarFoto(thumbnail)">
                </div>
                <img v-if="foto" :src="`http://localhost:4000/images/${foto}`" class="slide principal">
                <div v-else>
                    Cargando imagen...
                </div>
            </div>
        </div>
        <div class="right">
            <h2><b>{{ codigo }}</b></h2>
            <h3>${{ precio }}</h3>
            <h5>Descripcion</h5>
            <p>{{ descripcion }}</p>
            <h5>Especificaciones</h5>
            <p style="margin-bottom: 2px!important;">{{ especificaciones }}</p>
            <div class="material-peso">
                <div>
                    <h5>Material</h5>
                    <p style="margin-bottom: 2px!important;">{{ material }}</p>
                </div>
                <div style="width: 200px;">
                    <h5>Peso</h5>
                    <p style="margin-bottom: 10px!important;">{{ peso }}</p>
                </div>
            </div>
            <div class="botones">
                <button v-show="visibleGestionar" class="btn" @click="modificarPieza(idPieza)"><i
                        class="fa-solid fa-pen-to-square text-gray"></i> &nbsp;Editar </button>
                <button v-if="activo === 1 && visibleGestionar" class="btn" type="submit"
                    @click="confirmar(idPieza, activo)">
                    <i class="fas fa-times text-gray"></i> &nbsp;Inactivar
                </button>
                <button v-else-if="activo === 0 && visibleGestionar" class="btn" type="submit"
                    @click="confirmar(idPieza, activo)">
                    <i class="fas fa-check text-gray"></i> &nbsp;Activar
                </button>
                <div class="cantidad-input" v-show="visiblePedir">
                    <label for="cantidad">
                        <h5>Cantidad: &nbsp;</h5>
                    </label>
                    <input class="form-control form-color" type="number" id="cantidad" v-model="cantidad" min="1" />
                </div>
                <div class="centrar-boton" v-show="visiblePedir">
                    <button style="margin-top: 1px!important;" class="btn btn-amarillo" @click="agregarCarrito"><b>Agregar
                            al carrito</b></button>
                </div>
            </div>
        </div>
    </div>
    <!----------------------------------------- Acivar e inactivar -------------------------------------------------->
    <div class="modal fade" id="modalConfirmacion" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Estatus de la pieza</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <span v-if="estadoCambiarEstatus === 1">¿Está seguro de que quiere inactivar esta pieza?</span>
                    <span v-else>¿Está seguro de que quiere activar esta pieza?</span>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal"
                        @click="cambiarEstatusPzas(idPiezaCambiarEstatus, estadoCambiarEstatus)">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.form-color {
    background-color: #f4f4f4;
    width: 70px;
    border-color: #afafaf;
}

.centrar-boton {
    text-align: center;    
    margin-top: 10px;    
}

.cantidad-input {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.cantidad-input input {
  width: 70px; 
  height: 35px;
  margin-left: 5px; 
  padding: 5px;
}

.text-gray {
    color: gray;
}

.botones button {
    margin-top: 10px;
    margin-right: 15px;    
    background-color: #f4f4f4;
    width: 120px;
    border: 1px solid lightgray;
}

.material-peso {
    display: flex;
    justify-content: space-between;
    margin-top: 0px !important;
}

.material-peso div h5 {
    margin-bottom: 5px;    
}

h2 {
    text-transform: uppercase;
    font-family: 'Barlow', sans-serif;
    text-align: left;
}

h3 {
    text-transform: uppercase;
    font-family: 'Barlow', sans-serif;
    font-size: 24px;
    text-align: left;
    font-weight: 600;
    margin-bottom: 18px !important;
}

p {
    color: rgb(59, 59, 59);
}

h5 {
    margin-top: 10px;
    font-family: 'Barlow', sans-serif;
    text-align: left;
    font-weight: 500;
    /* Medium */
}

.thumbnails {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 25%;
    /* Ajusta el margen derecho entre las miniaturas y la imagen principal según tus necesidades */
}

.thumbnail {
    width: 70px;
    height: 65px;
    margin-bottom: 10px;
    /* Ajusta el margen inferior entre las miniaturas según tus necesidades */
    cursor: pointer;
}

.icono-blanco {
    color: white;
}

.btn-redondo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 24px;
    background-color: #FFCA0A;
    /* Estilos adicionales según sea necesario */
}

.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: justify;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    margin-bottom: 20px;
    height: auto;
    width: 90%;
}

.left,
.right {
    width: 50%;
    padding: 35px;
}

.flex {
    display: flex;
    justify-content: space-between;
}

.main_image {
    display: flex;
    justify-content: space-between;
    width: auto;
    height: auto;

}

.right {
    padding: 35px 100px 50px 50px;
}

.principal {
    width: 80%;
    height: 380px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    /* Sombra de 10px de desenfoque y color negro con opacidad 0.5 */
}

.btn-amarillo {
    background-color: #FFCA0A !important;
    color: white !important;
    width: 300px !important;
    border: none;
    font-family: 'Barlow', sans-serif !important;
    font-size: 20px !important;
}
</style>