// Archivo: src/services/authService.js

const login = (credencial, password) => {
    // Simulamos la base de datos de Alumco con los 3 perfiles
    const usuariosMock = [
        { id: 1, nombre: 'Ana (Admin)', rol: 'admin', email: 'admin@alumco.cl', password: '123' },
        { id: 2, nombre: 'Carlos (Profe)', rol: 'profesor', email: 'profe@alumco.cl', password: '123' },
        { id: 3, nombre: 'María (Colaboradora)', rol: 'usuario', email: 'maria@gmail.com', password: '123' }
    ];

    // Buscamos si existe un usuario que coincida con las credenciales
    const usuarioEncontrado = usuariosMock.find(
        (u) => u.email === credencial && u.password === password
    );

    if (!usuarioEncontrado) {
        throw new Error('Credenciales incorrectas'); // Lanzamos un error si falla
    }

    // Si todo sale bien, devolvemos los datos del usuario (sin la contraseña por seguridad)
    return {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        rol: usuarioEncontrado.rol
    };
};

module.exports = {
    login
};