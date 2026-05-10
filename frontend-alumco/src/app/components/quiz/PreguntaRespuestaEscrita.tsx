// src/app/components/quiz/PreguntaRespuestaEscrita.tsx
import React from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { DetalleCalificacion } from '../../hooks/useQuizResponder';

interface PreguntaRespuestaEscritaProps {
  pregunta_id: string | number;
  pregunta: string;
  respuesta_usuario?: string | null;
  onRespuestaChange: (pregunta_id: string | number, respuesta: string) => void;
  mostrarResultado?: boolean;
  detalleResultado?: DetalleCalificacion | null;
}

export const PreguntaRespuestaEscrita: React.FC<PreguntaRespuestaEscritaProps> = ({
  pregunta_id,
  pregunta,
  respuesta_usuario,
  onRespuestaChange,
  mostrarResultado = false,
  detalleResultado = null,
}) => {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-semibold text-gray-900 mb-4">{pregunta}</h4>

      <div className="space-y-2">
        <Label htmlFor={`txt-${pregunta_id}`} className="text-sm font-medium text-gray-700">
          Tu respuesta:
        </Label>
        <Textarea
          id={`txt-${pregunta_id}`}
          placeholder="Escribe tu respuesta aquí..."
          value={respuesta_usuario || ''}
          onChange={(e) => onRespuestaChange(pregunta_id, e.target.value)}
          disabled={mostrarResultado}
          className="min-h-24 resize-none"
        />
      </div>

      {mostrarResultado && detalleResultado?.respuestaModelo && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded">
          <p className="font-semibold text-blue-900 text-sm mb-2">Respuesta modelo (para referencia):</p>
          <p className="text-blue-800 text-sm">{detalleResultado.respuestaModelo}</p>
          <p className="text-blue-700 text-xs mt-2">
            💡 Nota: Esta es la respuesta esperada. Tu respuesta será revisada por el instructor.
          </p>
        </div>
      )}

      {mostrarResultado && !detalleResultado?.respuestaModelo && (
        <div className="mt-4 p-3 bg-amber-100 border border-amber-400 rounded">
          <p className="text-amber-800 text-sm">
            ⏳ Tu respuesta fue enviada correctamente. Será revisada manualmente por el instructor.
          </p>
        </div>
      )}
    </div>
  );
};
