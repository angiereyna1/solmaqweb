import { defineStore } from "pinia";
import axios from "axios";

export const rolesStore = defineStore("roles",{
  state: ()=>({
    roles: [],
    idRolActual:null
  }), 
  actions:{

    setRol(idRol){
       
        this.idRolActual = idRol;
        console.log(this.idRolActual)
    },

    getRol(){
        console.log(this.idRolActual)
        return this.idRolActual;
    },

    async obtenerRoles(){
        try {
            const res = await axios.get('http://localhost:4000/api/roles')
            return res;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },    

    async agregarRol(nombreRol){
        try {
            const res = await axios.post('http://localhost:4000/api/roles',{"idRol":0,
            "Rol":nombreRol, "Activo":1
           })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
    async actualizarRol(idRol, nombreRol){
        try {
            const res = await axios.post('http://localhost:4000/api/roles',{"idRol":idRol,
            "Rol":nombreRol
           })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
    async cambiarEstatus(idRol, estado){
        try {
            const res = await axios.post('http://localhost:4000/api/roles',{"idRol":idRol,
            "Activo": estado
           })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
    async eliminarRol(idRol){
        try{

        const res = await axios.put('http://localhost:4000/api/roles',{"idRol":idRol
       })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    }
  }  
})