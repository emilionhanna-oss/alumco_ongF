const certificateService = require('../services/certificateService');

const descargarCertificado = async (req, res) => {
  try {
    const curso_id = req.params.id;
    const usuario_id = req.user.id;

    const pdfBuffer = await certificateService.generateCertificate(curso_id, usuario_id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificado_alumco_${curso_id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar certificado:', error);
    if (error.message === 'El usuario no ha completado este curso') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'No se pudo generar el certificado' });
  }
};

const verificarCertificado = async (req, res) => {
  try {
    const { hash } = req.params;
    const data = await certificateService.verifyCertificate(hash);

    if (!data) {
      return res.status(404).json({ valido: false, error: 'Certificado no encontrado' });
    }

    res.json({
      valido: true,
      datos: data
    });
  } catch (error) {
    console.error('Error al verificar certificado:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
  descargarCertificado,
  verificarCertificado
};
