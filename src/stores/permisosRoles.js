import { defineStore } from "pinia";
import axios from "axios";

export const permisosRolesStore = defineStore("permisosRoles",{
  state: ()=>({
    roles: [],
    arrayPermisos:null
  }), 
  actions:{
    async obtenerPermisosDelRol(idRol){
        try {
            const res = await axios.get('http://localhost:4000/api/permisosRoles/'+idRol)            
            return res;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },

    async obtenerPermisos(idRol){
        try {
            const res = await axios.post('http://localhost:4000/api/permisosRoles/idRol',{"idRol":idRol})
            this.arrayPermisos = res.data.body.permisos                        
            return this.arrayPermisos;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },

    async agregarPermisosDelRol(idRol, idPermiso){
        try {
            const res = await axios.post('http://localhost:4000/api/permisosRoles',{
                "Permisos_idPermiso": idPermiso,
                "Roles_idRol": idRol
            })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },

    //esta funcion elimina TODOS los permisos que tenga un rol
    async eliminarPermisosDelRol(idPermiso){
        try {
            const res = await axios.put('http://localhost:4000/api/permisosRoles/'+idPermiso);

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
  } 
})