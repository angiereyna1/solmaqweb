import { defineStore } from "pinia";
import axios from "axios";

export const permisosRolesStore = defineStore("permisosRoles",{
  state: ()=>({
    roles: []
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

    async agregarPermisosDelRol(idRol, idPermiso){
        try {
            const res = await axios.post('http://localhost:4000/api/permisosRoles',{
                "Permisos_idPermisos": idPermiso,
                "Roles_idRoles": idRol
            })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },

    //esta funcion elimina TODOS los permisos que tenga un rol
    async eliminarPermisosDelRol(idRol){
        try {
            const res = await axios.put('http://localhost:4000/api/permisosRoles/'+idRol);

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
  } 
})