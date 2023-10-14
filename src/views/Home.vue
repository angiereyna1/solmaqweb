<script setup>
import cabecera from "../components/Menu.vue";

</script>

<template>
<!-- Cabecera -->
<cabecera interfaz="menu"></cabecera>
<!-- Contenido -->
<div class = "contenido">
    <!-- ======= Header Slider Section ======= -->
    <header id="header">
        <div id="headerCarousel" class="carousel slide carousel-fade" data-ride="carousel">

            <!-- Slide Indicators -->
            <ol class="carousel-indicators">
              <li data-target="#headerCarousel" data-slide-to="0" class="active"></li>
              <li data-target="#headerCarousel" data-slide-to="1"></li>
              <li data-target="#headerCarousel" data-slide-to="2"></li>
            </ol>

            <div class="carousel-inner" role="listbox">
              <!-- Slide 1 -->
              <div class="carousel-item active">
                <div class="carousel-background"><img src="../assets/Fondo2.png" alt=""></div>                
              </div>

              <!-- Slide 2 -->
              <div class="carousel-item">
                <div class="carousel-background"><img src="../assets/Fondo1.png" alt=""></div>                                                  
              </div>

              <!-- Slide 3 -->
              <div class="carousel-item">
                <div class="carousel-background"><img src="../assets/Fondo3.jpg" alt=""></div>                
              </div>
            </div>

            <!-- Carousel pre and next arrow -->
            <a class="carousel-control-prev" href="#headerCarousel" role="button" data-slide="prev">
              <i class="fas fa-arrow-circle-left"></i>
            </a>

            <a class="carousel-control-next" href="#headerCarousel" role="button" data-slide="next">
              <i class="fas fa-arrow-circle-right"></i>
            </a>
        </div>
    </header><!-- End header -->
</div>

</template>

<style scoped>
.contenido{
    margin-top: 1.5%;
    margin-left: 3%;
    margin-right: 3%;
    text-align: center;
    background-color: white;        
    background-color: white;  
    border-radius: 20px; /* Añade un radio de borde de 30px */
    border: 1px solid gray; /* Añade un borde de 2px con color negro */
    padding: 20px; /* Agrega un relleno de 20px alrededor del contenido */
}

#headerCarousel {
    max-width: 1000px; /* Establece el ancho máximo del carrusel */
    margin: 0 auto; /* Centra el carrusel en la página */
}

.carousel-item {
    max-height: 400px; /* Establece la altura máxima de los elementos del carrusel */
    text-align: center; /* Alinea el texto en el centro del elemento del carrusel */
}

.carousel-item img {
    width: 100%; /* Hace que la imagen dentro del elemento del carrusel ocupe el 100% del ancho disponible */
    height: 100%; /* Hace que la imagen dentro del elemento del carrusel ocupe el 100% de la altura disponible */
    object-fit: cover; /* Ajusta la imagen para cubrir completamente el contenedor */
}
</style>

<style>
body {
    background-color: #f4f4f4;; /* Establece el fondo del body en lightgray */
    font-family: 'Barlow', sans-serif; /* Establece el tipo de letra como Barlow */
}
</style>