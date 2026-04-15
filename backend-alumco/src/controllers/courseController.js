const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

async function readCoursesFromDb() {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  return parsed.cursos || [];
}

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

module.exports = {
  listarCursos,
  obtenerCursoPorId,
};
