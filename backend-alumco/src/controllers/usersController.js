const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

const listarUsuarios = async (req, res) => {
  try {
    const db = await readDb();
    const usuarios = Array.isArray(db?.usuarios) ? db.usuarios : [];

    const sanitized = usuarios.map((u) => ({
      id: u?.id !== undefined ? String(u.id) : undefined,
      email: u?.email,
      nombre: u?.nombre,
      nombreCompleto: u?.nombreCompleto,
      genero: u?.genero,
      rol: u?.rol,
    }));

    return res.status(200).json(sanitized);
  } catch (error) {
    console.error('Error al leer usuarios:', error);
    return res.status(500).json({ mensaje: 'No se pudieron obtener los usuarios' });
  }
};

module.exports = {
  listarUsuarios,
};
