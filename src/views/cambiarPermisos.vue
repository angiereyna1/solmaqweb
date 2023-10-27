<script setup>
import { ref, onMounted } from 'vue';
import router from "../router";
import { permisosStore } from '../stores/permisos';
import { permisosRolesStore } from '../stores/permisosRoles';
import { useRoute } from 'vue-router';
import cabecera from '../components/Menu.vue';

const { obtenerPermisos } = permisosStore();
const { obtenerPermisosDelRol, agregarPermisosDelRol, eliminarPermisosDelRol } = permisosRolesStore();
const route = useRoute();

const permisos = ref([]); // Lista de todos los permisos
const permisoSeleccionados = ref({}); // Objeto para mantener el estado de los checkboxes seleccionados
const permisosRol = ref([]); // Variable reactiva para almacenar los permisos del rol
const idRol = route.params.idRol;

const consultarPermisos = async () => {
    try {
        const permisosDelRol = await obtenerPermisosDelRol(idRol);
        const response = await obtenerPermisos();
        permisosRol.value = permisosDelRol.data.body.map(permiso => permiso.idPermiso); // Asigna los permisos del rol
        permisos.value = response.data.body;

        // Marcar los checkboxes basándose en los permisos del rol
        permisos.value.forEach(permiso => {
            permisoSeleccionados.value[permiso.idPermiso] = permisosRol.value.includes(permiso.idPermiso);
        });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
    }
};

const redirigirARoles = () => {
    // Redirigir a la interfaz de roles después de hacer clic en "Aceptar"
    router.push('/roles');
};

const guardarPermisos = async () => {
    try {
        // Itera sobre los permisos seleccionados
        Object.keys(permisoSeleccionados.value).forEach(async idPermiso => {
            // Si el permiso está seleccionado y no está en los permisos del rol, agrégalo
            if (permisoSeleccionados.value[idPermiso] && !permisosRol.value.includes(parseInt(idPermiso))) {
                await agregarPermisosDelRol(idRol, parseInt(idPermiso));
                permisosRol.value.push(parseInt(idPermiso));
            }
            // Si el permiso no está seleccionado pero está en los permisos del rol, elimínalo
            else if (!permisoSeleccionados.value[idPermiso] && permisosRol.value.includes(parseInt(idPermiso))) {
                await eliminarPermisosDelRol(parseInt(idPermiso));
                permisosRol.value = permisosRol.value.filter(permiso => permiso !== parseInt(idPermiso));
            }
            // Mostrar el modal después de guardar los permisos
            $('#modalPermisosActualizados').modal('show');
        });

        console.log('Permisos guardados correctamente');
    } catch (error) {
        console.error('Error al guardar permisos:', error);
    }
};

onMounted(() => {
    consultarPermisos();
});

</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="roles"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <div class="table-container">
            <h1 class="titulo"><b>Permisos</b></h1>
            <!-- Tabla de permisos -->
            <div class="table-wrapper-scroll-y my-custom-scrollbar mx-auto" style="width: 85%;">
                <table class="table table-light mx-auto">
                    <tbody>
                        <tr v-for="permiso in permisos" :key="permiso.idPermiso">
                            <td style="width: 3vw;">
                                <input type="checkbox" v-model="permisoSeleccionados[permiso.idPermiso]" />
                            </td>
                            <td>{{ permiso.Permiso }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="botones">
            <router-link to="/roles">
                <button class="btn btn-cancelar">Cancelar</button>
            </router-link>
            <button class="btn btn-guardar" @click="guardarPermisos()">Guardar</button>
        </div>
    </div>

    <!-- Modal de confirmación de permisos actualizados -->
  <div class="modal fade" id="modalPermisosActualizados" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Permisos Actualizados</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Permisos actualizados correctamente.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-amarillo" data-bs-dismiss="modal" @click="redirigirARoles">
            Aceptar
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
    width: 70%;
    height: 450px;
    position: relative;
}

.titulo {
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;
    margin-left: 30px;
    margin-top: 20px;
    margin-bottom: 10px;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
}

.table th {
    background-color: #f2f2f2;
}

.my-custom-scrollbar {
    position: relative;
    height: 272px;
    overflow: auto;
}

.table-wrapper-scroll-y {
    display: block;
}

.btn-cancelar {
    border-radius: 10px;
    /* Establece el borde redondo */
    background-color: white;
    color: red;
    border: 2px solid red;

}

.btn-guardar {
    border-radius: 10px;
    /* Establece el borde redondo */
    background-color: #FFCA0A;
    color: white;
    border: 2px solid #FFCA0A;
}

.btn-amarillo {
    background-color: #FFCA0A;
    color: black;
    width: 90px;
    border: none;
}

.botones {
    position: absolute;
    bottom: 30px;
    /* Ajusta la posición vertical según tu diseño */
    right: 87px;
    /* Ajusta la posición horizontal según tu diseño */
}

.botones button {
    margin-top: 10px;
    /* Ajusta el espacio entre los botones si es necesario */
    margin-left: 10px;
    /* Ajusta el espacio entre los botones si es necesario */
}
</style>
