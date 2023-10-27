import { defineStore } from "pinia";
import axios from "axios";

export const permisosStore = defineStore("permisos",{
  state: ()=>({
    roles: []
  }), 
  actions:{
    async obtenerPermisos(){
        try {
            const res = await axios.get('http://localhost:4000/api/permisos')
            console.log(res)
            return res;
            
        } catch (error) {
            console.log(error)
        }
    }
  } 
})