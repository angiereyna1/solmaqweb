<script setup>
import { ref } from "vue"; //para usar variables reactivas
import { loginStore } from "../stores/login";
import router from "../router/index";

const { login } = loginStore();

const usuario = ref("");
const contrasena = ref("");
const aceptado = ref(true);
const campovacio = ref(false);
const inputPass = ref("password");
var tried = false;


function mostrarTexto(){
  inputPass.value = "text";
}

function ocultarTexto(){
  inputPass.value = "password";
}

function quitarEspacios() {
  usuario.value = usuario.value.trim();
  console.log(usuario.value);
}

function camposVacios() {
  if (tried && (usuario.value == "" || contrasena.value == "")) {
    campovacio.value = true;
    return true;
  } else {
    campovacio.value = false;
  }
  return false;
}

async function iniciarSesion() {
  tried = true;
  quitarEspacios();
  if (!camposVacios()) {
    try {      
      var iniciado = await login({
        Usuario: usuario.value,
        Contrasena: contrasena.value,
      });
      if (iniciado) {
        console.log("Sesión iniciada");
        irMenu();
      } else {
        aceptado.value = false;
        console.log("Usuario y/o contraseña incorrectos");
      }
    } catch (error) {
      console.log(error);
    }
  }
}


function irMenu() {
  router.push({ name: "home" });
}
</script>

<template>  
  <!------------------------------------------ Lado izquierdo ------------------------------------------------------->
  <div class="contenedor-imagen">
    <img src="../assets/Fondo.png" alt="Descripción de la imagen" class="imagen"/>
  </div>
  <!------------------------------------------- Lado derecho -------------------------------------------------------->    
  <div class="contenedor-formulario">      
    <form @submit.prevent="iniciarSesion">
      <div>
        <img src="../assets/LogoSOLMAQ.png" alt="LogoSOLMAQ" class="logo"/>      
      </div>
      <div>        
        <div>
          <input
            type="text"
            class="input-usuario"
            v-model.trim="usuario"
            @input="camposVacios()"
            autofocus
            placeholder="Usuario"
          />
        </div>
        <div>
          <input
            :type="inputPass"
            class="input-contrasena"
            v-model.trim="contrasena"
            @input="camposVacios()"
            placeholder="Contraseña"
          />
          <button
            class="eyeBtn"
            type="button"
            id="button-addon2"
            @mousedown="mostrarTexto()"
            @mouseup="ocultarTexto()"
          >
            <img                            
              src="../assets/mostrarcontraseña.png"
            />
          </button>                    
        </div>
        <div
          v-if="!aceptado"
          class="alert alert-danger d-flex align-items-center"
          style="height: 30px; margin-left: 8%; margin-right: 8%; font-size: 16px" 
          role="alert"
        >
          Usuario y/o contraseña incorrectos
        </div>
        <div
          v-if="campovacio"
          class="alert alert-danger d-flex align-items-center"
          style="height: 30px; margin-left: 8%; margin-right: 8%; font-size: 16px"
          role="alert"
        >
          Por favor, llene todos los campos
        </div>        
<!-------------------------------------------------- Boton de iniciar sesion  ------------------------------>      
        <div>
          <button
            type="submit"
            class="btn-iniciar"          
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
  
<style scoped>
.contenedor-imagen {
  float: left; /* Alinea el contenedor a la izquierda */
  width: 55%; /* Ocupa el 50% del ancho de su contenedor padre */
  height: 619px;
}

.contenedor-formulario {  
  float: right; /* Alinea el contenedor a la izquierda */
  width: 45%; /* Ocupa el 50% del ancho de su contenedor padre */
  height: 619px; 
  text-align: center;  
  background-color: white;
}

.imagen {
  width: 100%; /* La imagen ocupará todo el ancho del contenedor */
  height: 100%; /* La altura se ajustará proporcionalmente al ancho */
}

.logo {  
  width: 40%;  
  margin-top: 10%; 
  margin-bottom: 8%; 
}


.input-usuario {
  padding-left: 50px; /* Ajusta el espacio a la izquierda para la imagen */
  background-image: url('../assets/user_icon.png'); /* Ruta de tu imagen */
  background-size: 30px; /* Tamaño de tu imagen */
  background-repeat: no-repeat;
  background-position: 5px center; /* Ajusta la posición horizontal de la imagen */  
  border: none; /* Elimina los bordes predeterminados */
  border-bottom: 5px solid #FFCA0A; /* Añade un borde inferior amarillo de 2px */
  font-family: 'Barlow', sans-serif; /* Establece el tipo de letra como Barlow */
  font-size: 25px; /* Tamaño del texto */
  outline: none; /* Elimina el contorno al hacer clic en el campo de entrada */  
  margin-bottom: 7%;
  width: 500px;
}

.input-usuario::placeholder {
  opacity: 1; /* Hace visible el placeholder */  
}

.input-contrasena {
  padding-left: 50px; /* Ajusta el espacio a la izquierda para la imagen */
  background-image: url('../assets/contraseñan_icon.png'); /* Ruta de tu imagen */
  background-size: 30px; /* Tamaño de tu imagen */
  background-repeat: no-repeat;
  background-position: 5px center; /* Ajusta la posición horizontal de la imagen */  
  border: none; /* Elimina los bordes predeterminados */
  border-bottom: 5px solid #FFCA0A; /* Añade un borde inferior amarillo de 2px */
  font-family: 'Barlow', sans-serif; /* Establece el tipo de letra como Barlow */
  font-size: 25px; /* Tamaño del texto */
  outline: none; /* Elimina el contorno al hacer clic en el campo de entrada */    
  transform: translateX(6%);
  width: 500px;
  margin-bottom: 2%;
  margin-right: 3%;
}

.input-contrasena::placeholder {
  opacity: 1; /* Hace visible el placeholder */  
}

.eyeBtn {
  height: 40px;
  font-size: 25px;
  border: none; /* Elimina los bordes predeterminados */  
  transform: translate(-75%,-10%);
  background: transparent; /* Fondo transparente */  
}

.btn-iniciar {
  text-transform: uppercase;  
  background-color: #FFCA0A; /* Color de fondo amarillo */
  color: #fff; /* Color del texto blanco */
  font-family: 'Barlow', sans-serif; /* Tipo de letra Barlow */
  font-size: 20px; /* Tamaño del texto */
  font-weight: bold;
  border: none; /* Elimina los bordes */
  border-radius: 15px; /* Bordes redondos */
  padding: 10px 20px; /* Espaciado interno */
  cursor: pointer; /* Cambia el cursor al pasar el mouse */
  transition: background-color 0.3s ease; /* Agrega una transición suave al color de fondo */
  width: 350px;  
  margin-top: 8%;
}

/* Cambia el color de fondo al pasar el mouse sobre el botón */
.btn-iniciar:hover {
  background-color: #FFD500;
}


form {
  width: 100%; /* La imagen ocupará todo el ancho del contenedor */
  height: 100%; /* La altura se ajustará proporcionalmente al ancho */  
}
</style>