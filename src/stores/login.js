import { defineStore } from "pinia";
import axios from "axios";

export const loginStore = defineStore("login",{
  state: ()=>({
    token: null,
    usuario:null,
    arrayPermisos:null
  }), 
  actions:{
    async login(usuario){
        try {
            const res = await axios.post('http://localhost:4000/api/usuarios/login',usuario);
            console.log(res);
            console.log(res.data.body.token)
            this.token = res.data.body.token;
            // Save data to sessionStorage
            sessionStorage.setItem("token", this.token);
            this.usuario = usuario.Usuario;
            sessionStorage.setItem("usuario", this.usuario);
            console.log(this.usuario)
            this.arrayPermisos = res.data.body.permisos
            sessionStorage.setItem("permisos", this.arrayPermisos);
            return res.data.body.token != null;            
        } catch (error) {
            console.log(error)
        }
    },

    async permisos(interfaz){
      try {
        // Imprime la interfaz en la consola para verificar que se está pasando correctamente
        console.log(interfaz);
        // Crea un objeto de configuración que incluye el token de autorización en el encabezado
        let tkn = {
          headers: {
            'Authorization':'Bearer '+this.token
          }
        }
        // Realiza una solicitud POST al servidor con la interfaz y el token de autorización
        const res = await axios.post('http://localhost:4000/api/usuarios/auth',{Interfaz: interfaz, tkn});
        // Devuelve el valor del campo 'permiso' del cuerpo de la respuesta del servidor
        return res.data.body.permiso;
      } catch (error) {
        // Maneja cualquier error que pueda ocurrir durante la solicitud
        console.log(error)        
      }
    },

    getToken(){
      console.log(this.token)
        return this.token;
    },

    getUser(){
      console.log(this.usuario)
        return this.usuario;
    },    

    getPermisos(){
        console.log(this.arrayPermisos[0])
        return this.arrayPermisos;
    },

    async reanudarSesion(){
      // Get saved data from sessionStorage
    let data = sessionStorage.getItem("token");
    if (data) {
      this.token = data;
      this.usuario = sessionStorage.getItem("usuario");
      return true;
    }else{      
      return false;      
    }
    },

    async cerrarSesion(){
      // Remove saved data from sessionStorage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");
      this.token = null;
      this.usuario = null;
    }
  } 
})