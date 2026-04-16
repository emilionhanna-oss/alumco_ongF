// src/app/pages/AdminPanel.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  listarCursos,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  type Curso,
  type Modulo,
  type CursoPayload,
} from '../services/adminCourseService';

// ── Empty state helpers ───────────────────────────────────────────────────────

const emptyModulo = (): Modulo => ({
  tituloModulo: '',
  tipo: 'video',
  contenido: '',
  materialDescargable: null,
  completado: false,
});

const emptyCurso = (): CursoPayload => ({
  titulo: '',
  descripcion: '',
  imagen: '/static/course-images/default.svg',
  modulos: [emptyModulo()],
});

// ── Sub-components ────────────────────────────────────────────────────────────

function ModuloForm({
  modulo,
  index,
  onChange,
  onRemove,
}: {
  modulo: Modulo;
  index: number;
  onChange: (i: number, updated: Modulo) => void;
  onRemove: (i: number) => void;
}) {
  const update = (field: keyof Modulo, value: string) =>
    onChange(index, { ...modulo, [field]: value });

  return (
    <div style={styles.moduloCard}>
      <div style={styles.moduloHeader}>
        <span style={styles.moduloBadge}>Módulo {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={styles.removeBtn}
          title="Eliminar módulo"
        >
          ✕
        </button>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Título del módulo</label>
        <input
          style={styles.input}
          value={modulo.tituloModulo}
          onChange={(e) => update('tituloModulo', e.target.value)}
          placeholder="Ej: Movilización Segura en Rutina Diaria"
          required
        />
      </div>

      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Tipo</label>
          <select
            style={styles.input}
            value={modulo.tipo}
            onChange={(e) => update('tipo', e.target.value)}
          >
            <option value="video">Video</option>
            <option value="lectura">Lectura</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>
          {modulo.tipo === 'video' ? 'URL del video (YouTube embed)' : 'Contenido / descripción'}
        </label>
        {modulo.tipo === 'video' ? (
          <input
            style={styles.input}
            value={modulo.contenido}
            onChange={(e) => update('contenido', e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
          />
        ) : (
          <textarea
            style={{ ...styles.input, height: 80, resize: 'vertical' }}
            value={modulo.contenido}
            onChange={(e) => update('contenido', e.target.value)}
            placeholder="Describe el contenido de este módulo..."
          />
        )}
      </div>
    </div>
  );
}

// ── Modal: Create / Edit course ───────────────────────────────────────────────

function CursoModal({
  initial,
  onSave,
  onClose,
  loading,
  error,
}: {
  initial: CursoPayload;
  onSave: (payload: CursoPayload) => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<CursoPayload>(initial);

  const setField = (field: keyof CursoPayload, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const updateModulo = (i: number, updated: Modulo) => {
    const modulos = [...form.modulos];
    modulos[i] = updated;
    setField('modulos', modulos);
  };

  const removeModulo = (i: number) =>
    setField('modulos', form.modulos.filter((_, idx) => idx !== i));

  const addModulo = () => setField('modulos', [...form.modulos, emptyModulo()]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {initial.titulo ? 'Editar capacitación' : 'Nueva capacitación'}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalBody}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Título *</label>
            <input
              style={styles.input}
              value={form.titulo}
              onChange={(e) => setField('titulo', e.target.value)}
              placeholder="Ej: Protocolo de Prevención de Caídas"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Descripción *</label>
            <textarea
              style={{ ...styles.input, height: 80, resize: 'vertical' }}
              value={form.descripcion}
              onChange={(e) => setField('descripcion', e.target.value)}
              placeholder="Descripción breve del contenido y objetivos..."
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Imagen (ruta o URL)</label>
            <input
              style={styles.input}
              value={form.imagen}
              onChange={(e) => setField('imagen', e.target.value)}
              placeholder="/static/course-images/mi-curso.svg"
            />
          </div>

          {/* Modules */}
          <div style={styles.modulesSection}>
            <div style={styles.modulesSectionHeader}>
              <span style={styles.label}>Módulos</span>
              <button type="button" onClick={addModulo} style={styles.addModuloBtn}>
                + Agregar módulo
              </button>
            </div>
            {form.modulos.map((m, i) => (
              <ModuloForm
                key={i}
                modulo={m}
                index={i}
                onChange={updateModulo}
                onRemove={removeModulo}
              />
            ))}
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondary} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar capacitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Curso | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Load courses ──
  const fetchCursos = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await listarCursos();
      setCursos(data);
    } catch (e) {
      setListError((e as Error).message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchCursos(); }, [fetchCursos]);

  // ── Open modal ──
  const openCreate = () => { setEditing(null); setSaveError(null); setModalOpen(true); };
  const openEdit = (curso: Curso) => { setEditing(curso); setSaveError(null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  // ── Save (create or update) ──
  const handleSave = async (payload: CursoPayload) => {
    setSaveLoading(true);
    setSaveError(null);
    try {
      if (editing) {
        const updated = await actualizarCurso(editing.id, payload);
        setCursos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await crearCurso(payload);
        setCursos((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await eliminarCurso(id);
      setCursos((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert('Error al eliminar: ' + (e as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Redirect non-admins ──
  useEffect(() => {
    if (usuario && usuario.rol !== 'admin') navigate('/panel', { replace: true });
  }, [usuario, navigate]);

  // ── Render ──
  return (
    <div style={styles.page}>
      {/* Top bar */}
      <header style={styles.topbar}>
        <span style={styles.brand}>Alumco · Admin</span>
        <div style={styles.topbarRight}>
          <button onClick={() => navigate('/panel')} style={styles.btnTopbar}>
            Ver panel
          </button>
          <button onClick={logout} style={styles.btnTopbarDanger}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Section header */}
        <div style={styles.sectionHeader}>
          <div>
            <h1 style={styles.pageTitle}>Gestión de capacitaciones</h1>
            <p style={styles.pageSubtitle}>
              {cursos.length} capacitación{cursos.length !== 1 ? 'es' : ''} registrada{cursos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={openCreate} style={styles.btnPrimary}>
            + Nueva capacitación
          </button>
        </div>

        {/* States */}
        {loadingList && <p style={styles.stateText}>Cargando capacitaciones...</p>}
        {listError && <div style={styles.errorBox}>{listError}</div>}

        {/* Course table */}
        {!loadingList && !listError && (
          <div style={styles.tableWrapper}>
            {cursos.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: 18, marginBottom: 8 }}>No hay capacitaciones todavía.</p>
                <button onClick={openCreate} style={styles.btnPrimary}>
                  Crear la primera
                </button>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Título</th>
                    <th style={styles.th}>Módulos</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cursos.map((curso) => (
                    <tr key={curso.id} style={styles.tr}>
                      <td style={styles.tdMuted}>{curso.id}</td>
                      <td style={styles.td}>
                        <div style={styles.cursoTitulo}>{curso.titulo}</div>
                        <div style={styles.cursoDesc}>{curso.descripcion.slice(0, 80)}…</div>
                      </td>
                      <td style={styles.tdCenter}>
                        <span style={styles.badge}>{curso.modulos.length}</span>
                      </td>
                      <td style={styles.tdActions}>
                        <button
                          onClick={() => openEdit(curso)}
                          style={styles.btnEdit}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(curso.id)}
                          style={styles.btnDelete}
                          disabled={deletingId === curso.id}
                        >
                          {deletingId === curso.id ? '...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {modalOpen && (
        <CursoModal
          initial={editing ? {
            titulo: editing.titulo,
            descripcion: editing.descripcion,
            imagen: editing.imagen,
            modulos: editing.modulos,
          } : emptyCurso()}
          onSave={handleSave}
          onClose={closeModal}
          loading={saveLoading}
          error={saveError}
        />
      )}
    </div>
  );
}

// ── Styles (inline — no extra CSS file needed) ────────────────────────────────

const NAV = '#1a2840';
const NAV_DARK = '#111c2d';
const GREEN = '#3B6D11';
const RED = '#A32D2D';
const RED_BG = '#FCEBEB';
const BORDER = '#d5d3cc';
const BG = '#f4f3f0';
const SURFACE = '#ffffff';
const TEXT = '#1a1a18';
const MUTED = '#5f5e5a';

const styles: Record<string, React.CSSProperties> = {
  page:      { minHeight: '100vh', background: BG, fontFamily: 'Georgia, serif', color: TEXT },
  topbar:    { background: NAV, color: '#fff', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  brand:     { fontSize: 18, fontWeight: 'bold', letterSpacing: '0.02em' },
  topbarRight: { display: 'flex', gap: 10 },
  btnTopbar: { background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 14 },
  btnTopbarDanger: { background: 'rgba(163,45,45,0.7)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 14 },

  main:      { maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' },
  sectionHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: NAV, margin: 0 },
  pageSubtitle: { fontSize: 15, color: MUTED, marginTop: 4 },
  stateText: { color: MUTED, fontSize: 17 },
  errorBox:  { background: RED_BG, color: RED, border: `1px solid #f7c1c1`, borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 15 },
  emptyState:{ textAlign: 'center', padding: '3rem 1rem', color: MUTED },

  tableWrapper: { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 15 },
  th:        { background: BG, padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: MUTED, fontSize: 13, borderBottom: `1px solid ${BORDER}` },
  tr:        { borderBottom: `1px solid ${BORDER}` },
  td:        { padding: '14px 16px', verticalAlign: 'top' },
  tdMuted:   { padding: '14px 16px', color: MUTED, fontSize: 13, verticalAlign: 'middle' },
  tdCenter:  { padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle' },
  tdActions: { padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' as const, display: 'flex', gap: 8, alignItems: 'center' },
  cursoTitulo: { fontWeight: 'bold', marginBottom: 4 },
  cursoDesc: { color: MUTED, fontSize: 13, lineHeight: 1.4 },
  badge:     { background: '#E6F1FB', color: '#0C447C', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 'bold' },

  // Buttons
  btnPrimary:  { background: NAV, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', minHeight: 44 },
  btnSecondary:{ background: SURFACE, color: NAV, border: `2px solid ${NAV}`, borderRadius: 8, padding: '10px 20px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', minHeight: 44 },
  btnEdit:     { background: '#E6F1FB', color: '#0C447C', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' },
  btnDelete:   { background: RED_BG, color: RED, border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' },
  addModuloBtn:{ background: 'none', color: NAV, border: `1px dashed ${NAV}`, borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' },
  removeBtn:   { background: 'none', border: 'none', color: MUTED, fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  closeBtn:    { background: 'none', border: 'none', color: MUTED, fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 },

  // Modal
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' },
  modal:     { background: SURFACE, borderRadius: 12, width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `1px solid ${BORDER}` },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: NAV, margin: 0 },
  modalBody: { overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 },
  modalFooter:{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 },

  // Form fields
  field:     { display: 'flex', flexDirection: 'column', gap: 6 },
  row:       { display: 'flex', gap: 12 },
  label:     { fontSize: 14, fontWeight: 'bold', color: TEXT },
  input:     { fontSize: 16, padding: '10px 12px', border: `2px solid ${BORDER}`, borderRadius: 8, fontFamily: 'inherit', color: TEXT, background: SURFACE, width: '100%', boxSizing: 'border-box' as const },

  // Modules
  modulesSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  modulesSectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  moduloCard: { border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, background: BG },
  moduloHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  moduloBadge:{ fontSize: 12, fontWeight: 'bold', color: '#0C447C', background: '#E6F1FB', padding: '2px 10px', borderRadius: 20 },
};