// src/controllers/courseController.js
const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function readCoursesFromDb() {
  const db = await readDb();
  return db.cursos || [];
}

// ── Public endpoints ──────────────────────────────────────────────────────────

const listarCursos = async (req, res) => {
  try {
    const cursos = await readCoursesFromDb();
    res.status(200).json(cursos);
  } catch (error) {
    console.error('Error al leer cursos:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los cursos' });
  }
};

const obtenerCursoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cursos = await readCoursesFromDb();
    const curso = cursos.find((item) => String(item.id) === String(id));

    if (!curso) {
      return res.status(404).json({ mensaje: `Curso con id ${id} no encontrado` });
    }
    return res.status(200).json(curso);
  } catch (error) {
    console.error('Error al buscar curso por id:', error);
    return res.status(500).json({ mensaje: 'No se pudo obtener el detalle del curso' });
  }
};

// ── Admin-only endpoints ──────────────────────────────────────────────────────

const crearCurso = async (req, res) => {
  try {
    const { titulo, descripcion, imagen, modulos } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ mensaje: 'titulo y descripcion son obligatorios' });
    }

    const db = await readDb();
    const cursos = db.cursos || [];

    // Generate a new unique id (max existing id + 1)
    const maxId = cursos.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0);
    const nuevoCurso = {
      id: String(maxId + 1),
      titulo,
      descripcion,
      imagen: imagen || '/static/course-images/default.svg',
      progreso: 0,
      modulos: modulos || [],
    };

    db.cursos = [...cursos, nuevoCurso];
    await writeDb(db);

    return res.status(201).json(nuevoCurso);
  } catch (error) {
    console.error('Error al crear curso:', error);
    return res.status(500).json({ mensaje: 'No se pudo crear el curso' });
  }
};

const actualizarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, imagen, modulos } = req.body;

    const db = await readDb();
    const index = db.cursos.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ mensaje: `Curso con id ${id} no encontrado` });
    }

    // Merge: keep existing fields, overwrite only what was sent
    db.cursos[index] = {
      ...db.cursos[index],
      ...(titulo      !== undefined && { titulo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(imagen      !== undefined && { imagen }),
      ...(modulos     !== undefined && { modulos }),
    };

    await writeDb(db);
    return res.status(200).json(db.cursos[index]);
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    return res.status(500).json({ mensaje: 'No se pudo actualizar el curso' });
  }
};

const eliminarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    const index = db.cursos.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ mensaje: `Curso con id ${id} no encontrado` });
    }

    const eliminado = db.cursos.splice(index, 1)[0];
    await writeDb(db);
    return res.status(200).json({ mensaje: 'Curso eliminado', curso: eliminado });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    return res.status(500).json({ mensaje: 'No se pudo eliminar el curso' });
  }
};

module.exports = {
  listarCursos,
  obtenerCursoPorId,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
};