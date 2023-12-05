import { defineStore } from "pinia";
import axios from "axios";

export const usuariosStore = defineStore("usuarios",{
  state: ()=>({
    token:"",
    idUsuarioActual: ""
  }), 

  actions:{
    setToken(token){
        this.token = token;
    },

    getToken(){
        return this.token;
    },

    //trae todos los usuarios ACTIVOS
    async obtenerUsuarios(){
        try {
            const res = await axios.get('http://localhost:4000/api/usuarios')
            return res;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },    

    async obtenerIdPorUser(user){
        try {
            const res = await axios.post('http://localhost:4000/api/usuarios/userid',{"Usuario":user})
            // console.log(res.data.body)
            return res.data.body;
        } catch (error) {
            console.log(error)
        }
    },
    
    async obtenerIdUsuarioPorUser(user){
        try {
            const res = await axios.post('http://localhost:4000/api/usuarios/idUsuario',{"Usuario":user})
            // console.log(res.data.body)
            return res.data.body;
        } catch (error) {
            console.log(error)
        }
    },

    async obtenerUnUser(idUsuario){
        try {
            if (idUsuario=="") {
                throw error
            }
            // console.log('http://localhost:4000/api/usuarios/'+idUsuario)
            const res = await axios.get('http://localhost:4000/api/usuarios/'+idUsuario)
            return res.data.body;
        } catch (error) {
            throw error
        }
    },

    //metodos para resibir usuario y guardar el que se esta modificando
    setIdUsuario(idUsuario){
        this.idUsuarioActual = idUsuario
    },

    getIdUsuario(){
        return this.idUsuarioActual
    },
    
    //hay que mandarle el json ya creado
    async agregarUsuario(usuario){
        try {
            //nos retorna el id del usuario creado
            const res = await axios.post('http://localhost:4000/api/usuarios',usuario)
           console.log(res)
            return res;
            
        } catch (error) {
            console.log(error)
            return -1;
            
        }
    },

    //hay que mandarle el json ya creado
    async actualizarUsuario(usuario){
        try {
            const res = await axios.post('http://localhost:4000/api/usuarios',usuario)
           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },    

    async cambiarEstatus(idUsuario, estado){
        try {
            const res = await axios.post('http://localhost:4000/api/usuarios',{"idUsuario":idUsuario,
            "Activo": estado
           })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },

    async inactivar(idUsuario, estado){
        try {
            const res = await axios.post('http://localhost:4000/api/usuarios',{"idUsuario":idUsuario,
            "Activo": estado
           })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },

    //Trae TODOS los nombres de usuario que existen
    async obtenerNicknames(){
        try {
            const res = await axios.get('http://localhost:4000/api/usuarios/nicks')
            return res;
        } catch (error) {
            console.log(error)
        }
    }
  } 
})