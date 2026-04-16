// Archivo: src/services/authService.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '../../data/db.json');

function readDb() {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
}

function verifyPassword(password, storedPassword) {
    if (!storedPassword?.salt || !storedPassword?.hash) return false;

    const derived = crypto
        .scryptSync(String(password), String(storedPassword.salt), 64)
        .toString('hex');

    const expected = String(storedPassword.hash);

    if (derived.length !== expected.length) return false;

    return crypto.timingSafeEqual(
        Buffer.from(derived, 'hex'),
        Buffer.from(expected, 'hex')
    );
}

const login = (credencial, password) => {
    const db = readDb();
    const usuarios = Array.isArray(db?.usuarios) ? db.usuarios : [];

    const email = String(credencial || '').trim().toLowerCase();

    const usuarioEncontrado = usuarios.find(
        (u) => String(u?.email || '').trim().toLowerCase() === email
    );

    if (!usuarioEncontrado || !verifyPassword(password, usuarioEncontrado.password)) {
        throw new Error('Credenciales incorrectas');
    }

    return {
        id: usuarioEncontrado.id,
        email: usuarioEncontrado.email,
        nombre: usuarioEncontrado.nombre,
        nombreCompleto: usuarioEncontrado.nombreCompleto,
        genero: usuarioEncontrado.genero,
        rol: usuarioEncontrado.rol,
    };
};

module.exports = { login };