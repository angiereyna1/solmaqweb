<script setup>
import cabecera from "../components/Menu.vue";
</script>

<template>
<!-- Cabecera -->
<cabecera interfaz="roles"></cabecera>
<!-- Contenido -->
<div class="contenido">    
    <!-- Primera parte del contenido: Barra de búsqueda -->    
    <div class="navbar">        
        <!-- En este div va el logo -->
        <div style="justify-content: left;display: flex;width: 50%;">            
            <div class="search-toggle">
		        <input type="text" placeholder="Buscar">
		        <i class="fa fa-search"></i>
	        </div>
        </div>
        <div style="justify-content: right; display: flex; width: 50%;">
            <button class="agregar-btn" @click="mostrarMenu = !mostrarMenu">Agregar &nbsp; <i class="fas fa-plus icono-grande"></i></button>            
        </div>
    </div>
    <!-- Segunda parte del contenido: Tabla de consulta -->
    <div class="table-container">        
        <!-- Aquí puedes agregar tu tabla de consulta más tarde -->
    </div>
</div>
</template>

<style scoped>
.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: center;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
}

.input-busqueda {  
    padding-left: 10px; /* Ajusta el espacio a la izquierda para la imagen */
    font-family: 'Barlow', sans-serif; /* Establece el tipo de letra como Barlow */
    font-size: 16px; /* Tamaño del texto */
    outline: none; /* Elimina el contorno al hacer clic en el campo de entrada */    
    width: 300px;
    height: 40px;
    border-radius: 30px;
    border: 1px solid gray;
}

.input-busqueda::placeholder {
  opacity: 1; /* Hace visible el placeholder */  
}

.agregar-btn {
    background-color: #FFCA0A;
    font-family: 'Barlow', sans-serif; /* Establece el tipo de letra como Barlow */
    font-size: 16px; /* Tamaño del texto */
    font-weight: bold;
    text-align: center;
    color: white;
    width: 150px;
    height: 40px;
    border-radius: 30px;
    border: 1px solid #FFCA0A;
}

.search-toggle input[type=text] {
    padding: 15px 30px 15px 17px;
    width: 400px;
    height: 40px;    
    font-size: 17px;    
    outline: none;
    border: 1px solid gray;
    border-radius: 30px;
    background: #fff;
}

/* Estilos para el icono de búsqueda */
.search-toggle i {
    position: relative;
    left: -33px;        
    font-size: 20px;
    color: gray;
}

.icono-grande {
  font-size: 1.2em; /* Ajusta el tamaño según tus necesidades */
}

</style>

<style>
body {
    background-color: lightgray;
}
</style>
