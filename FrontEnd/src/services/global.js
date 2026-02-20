export const getAuth = () => {
    return sessionStorage.getItem('auth') ? JSON.parse(sessionStorage.getItem('auth')) : null
     
}