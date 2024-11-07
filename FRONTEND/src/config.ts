// tiene que iniciar con vite porque las variables de entorno que queremos que lleguen 
// al cliente tienen que ser con vite por delante sino no le llegaran
// esto para evitar que le lleguen keys de base de datos, credenciales, etc
export const { VITE_API_HOST: API_HOST } = import.meta.env