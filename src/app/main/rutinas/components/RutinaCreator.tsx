'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Dumbbell } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const DIAS_SEMANA = [
  { num: 0, nombre: 'Lunes', abrev: 'L' },
  { num: 1, nombre: 'Martes', abrev: 'M' },
  { num: 2, nombre: 'Miércoles', abrev: 'X' },
  { num: 3, nombre: 'Jueves', abrev: 'J' },
  { num: 4, nombre: 'Viernes', abrev: 'V' },
  { num: 5, nombre: 'Sábado', abrev: 'S' },
  { num: 6, nombre: 'Domingo', abrev: 'D' },
];

const GRUPOS_MUSCULARES = ['pecho', 'espalda', 'piernas', 'brazos', 'hombros', 'core', 'cardio', 'abdomen'];

interface Ejercicio {
  id: string;
  nombre: string;
  series: number;
  repeticiones: string;
  descanso: string;
  grupoMuscular: string;
  nota: string;
}

interface EjercicioForm {
  id: string;
  nombre: string;
  series: number;
  repeticiones: string;
  descanso: string;
  grupoMuscular: string;
  nota: string;
}

interface DiaRutinaForm {
  id: string;
  diaSemana: number;
  nombre: string;
  ejercicios: EjercicioForm[];
}

interface RutinaFormData {
  id?: string;
  nombre: string;
  descripcion: string;
  dias: DiaRutinaForm[];
}

interface Rutina {
  id: string;
  nombre: string;
  descripcion?: string | null;
  dias: {
    id: string;
    diaSemana: number;
    nombre?: string | null;
    ejercicios: {
      id: string;
      nombre: string;
      series: number;
      repeticiones: string;
      descanso: string;
      grupoMuscular?: string | null;
      nota?: string | null;
    }[];
  }[];
}

interface CatalogExercise {
  name: string;
  target: string;
  muscleGroup: string;
}

interface RutinaCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rutina?: Rutina | null;
  onSave: (data: { nombre: string; descripcion?: string; dias: { diaSemana: number; nombre?: string; ejercicios: Omit<EjercicioForm, 'id'>[]; orden: number }[] }) => void;
  isLoading?: boolean;
}

function generarId() {
  return Math.random().toString(36).substring(2, 11);
}

export function RutinaCreator({ open, onOpenChange, rutina, onSave, isLoading }: RutinaCreatorProps) {
  const [formData, setFormData] = useState<RutinaFormData>({
    nombre: '',
    descripcion: '',
    dias: [],
  });
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<{ diaId: string; ejercicioIdx: number; text: string } | null>(null);
  const [catalogExercises, setCatalogExercises] = useState<CatalogExercise[]>([]);

  useEffect(() => {
    if (!open) return;

    fetch('/api/exercises?limit=1324')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => setCatalogExercises(payload?.exercises || []))
      .catch(() => setCatalogExercises([]));
  }, [open]);

  useEffect(() => {
    if (rutina) {
      setFormData({
        id: rutina.id,
        nombre: rutina.nombre,
        descripcion: rutina.descripcion || '',
        dias: rutina.dias.map(d => ({
          id: d.id,
          diaSemana: d.diaSemana,
          nombre: d.nombre || '',
          ejercicios: d.ejercicios.map(e => ({
            id: e.id,
            nombre: e.nombre,
            series: e.series,
            repeticiones: e.repeticiones,
            descanso: e.descanso,
            grupoMuscular: e.grupoMuscular || '',
            nota: e.nota || '',
          })),
        })),
      });
      setDiasSeleccionados(rutina.dias.map(d => d.diaSemana));
    } else {
      setFormData({ nombre: '', descripcion: '', dias: [] });
      setDiasSeleccionados([]);
    }
  }, [rutina, open]);

  const toggleDia = (diaNum: number) => {
    if (diasSeleccionados.includes(diaNum)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== diaNum));
      setFormData({
        ...formData,
        dias: formData.dias.filter(d => d.diaSemana !== diaNum),
      });
    } else {
      setDiasSeleccionados([...diasSeleccionados, diaNum]);
      setFormData({
        ...formData,
        dias: [
          ...formData.dias,
          { id: generarId(), diaSemana: diaNum, nombre: '', ejercicios: [] },
        ],
      });
    }
  };

  const agregarEjercicio = (diaId: string) => {
    setFormData({
      ...formData,
      dias: formData.dias.map(d =>
        d.id === diaId
          ? {
              ...d,
              ejercicios: [
                ...d.ejercicios,
                { id: generarId(), nombre: '', series: 3, repeticiones: '10-12', descanso: '60 seg', grupoMuscular: '', nota: '' },
              ],
            }
          : d
      ),
    });
  };

  const actualizarEjercicio = (diaId: string, ejercicioId: string, campo: keyof Ejercicio, valor: any) => {
    setFormData({
      ...formData,
      dias: formData.dias.map(d =>
        d.id === diaId
          ? {
              ...d,
              ejercicios: d.ejercicios.map(e =>
                e.id === ejercicioId ? { ...e, [campo]: valor } : e
              ),
            }
          : d
      ),
    });
  };

  const eliminarEjercicio = (diaId: string, ejercicioId: string) => {
    setFormData({
      ...formData,
      dias: formData.dias.map(d =>
        d.id === diaId
          ? { ...d, ejercicios: d.ejercicios.filter(e => e.id !== ejercicioId) }
          : d
      ),
    });
  };

  const filteredSuggestions = (text: string) => {
    if (text.length < 2) return [];
    const query = text.toLowerCase();
    return catalogExercises
      .filter((exercise) =>
        `${exercise.name} ${exercise.target} ${exercise.muscleGroup}`.toLowerCase().includes(query)
      )
      .slice(0, 6);
  };

  const gruposMusculares = Array.from(
    new Set([
      ...GRUPOS_MUSCULARES,
      ...catalogExercises.flatMap((exercise) => [exercise.target, exercise.muscleGroup]).filter(Boolean),
    ])
  ).sort();

  const aplicarEjercicioCatalogo = (diaId: string, ejercicioId: string, exercise: CatalogExercise) => {
    setFormData({
      ...formData,
      dias: formData.dias.map((dia) =>
        dia.id === diaId
          ? {
              ...dia,
              ejercicios: dia.ejercicios.map((ejercicio) =>
                ejercicio.id === ejercicioId
                  ? {
                      ...ejercicio,
                      nombre: exercise.name,
                      grupoMuscular: exercise.target || exercise.muscleGroup || ejercicio.grupoMuscular,
                    }
                  : ejercicio
              ),
            }
          : dia
      ),
    });
    setShowSuggestions(null);
  };

  const handleSubmit = () => {
    const diasOrdenados = formData.dias
      .map((d, index) => ({
        diaSemana: d.diaSemana,
        nombre: d.nombre || undefined,
        ejercicios: d.ejercicios
          .filter(e => e.nombre.trim())
          .map((e, idx) => ({
            nombre: e.nombre,
            series: e.series,
            repeticiones: e.repeticiones,
            descanso: e.descanso,
            grupoMuscular: e.grupoMuscular || '',
            nota: e.nota || '',
            orden: idx,
          })),
        orden: index,
      }))
      .filter(d => d.ejercicios.length > 0);

    onSave({
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      dias: diasOrdenados,
    });
  };

  const isEditing = !!rutina?.id;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-4xl bg-card border-border shadow-xl rounded-2xl overflow-hidden flex flex-col p-0">
        <ModalHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEditing ? 'Actualiza los detalles del entrenamiento' : 'Diseña un nuevo plan de ejercicios'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </ModalHeader>

        <ModalBody className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="rutina-nombre" className="text-sm font-medium text-foreground">
                Nombre de la Rutina <span className="text-destructive">*</span>
              </label>
              <input
                id="rutina-nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring focus:border-primary/50 outline-none transition-all"
                placeholder="Ej: Empuje / Tracción / Pierna"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rutina-descripcion" className="text-sm font-medium text-foreground">
                Descripción
              </label>
              <input
                id="rutina-descripcion"
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring focus:border-primary/50 outline-none transition-all"
                placeholder="Ej: Enfoque en hipertrofia"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Días de Entrenamiento</label>
            <div className="flex gap-2 flex-wrap">
              {DIAS_SEMANA.map((dia) => {
                const isActive = diasSeleccionados.includes(dia.num);
                return (
                  <button
                    key={dia.num}
                    onClick={() => toggleDia(dia.num)}
                    className={cn(
                      "w-10 h-10 rounded-lg font-medium text-sm transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                    )}
                    title={dia.nombre}
                    aria-pressed={isActive}
                  >
                    {dia.abrev}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              Estructura de la Semana
              <Badge variant="secondary">{formData.dias.length} DÍAS</Badge>
            </h3>

            <div className="space-y-4">
              <AnimatePresence>
                {formData.dias
                  .sort((a, b) => a.diaSemana - b.diaSemana)
                  .map((dia) => {
                    const infoDia = DIAS_SEMANA.find(d => d.num === dia.diaSemana);
                    return (
                      <motion.div
                        key={dia.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-3">
                          <div className="px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase">
                            {infoDia?.nombre}
                          </div>
                          <input
                            type="text"
                            value={dia.nombre}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                dias: formData.dias.map(d =>
                                  d.id === dia.id ? { ...d, nombre: e.target.value } : d
                                ),
                              });
                            }}
                            className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/60 outline-none border-none focus:ring-0"
                            placeholder="Nombre del día (ej: Enfoque Pecho)"
                            aria-label="Nombre del día"
                          />
                        </div>

                        <div className="p-4 space-y-3">
                          {dia.ejercicios.map((ejercicio, idx) => (
                            <div key={ejercicio.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="col-span-5 relative">
                                <input
                                  type="text"
                                  value={ejercicio.nombre}
                                  onChange={(e) => {
                                    actualizarEjercicio(dia.id, ejercicio.id, 'nombre', e.target.value);
                                    setShowSuggestions({ diaId: dia.id, ejercicioIdx: idx, text: e.target.value });
                                  }}
                                  onFocus={() => setShowSuggestions({ diaId: dia.id, ejercicioIdx: idx, text: ejercicio.nombre })}
                                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                                  placeholder="Ejercicio..."
                                  aria-label="Nombre del ejercicio"
                                />
                                {showSuggestions?.diaId === dia.id && showSuggestions?.ejercicioIdx === idx && showSuggestions.text && (
                                  <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-lg p-1 overflow-hidden">
                                    {filteredSuggestions(showSuggestions.text).map((suggestion) => (
                                      <button
                                        key={suggestion.name}
                                        onClick={() => aplicarEjercicioCatalogo(dia.id, ejercicio.id, suggestion)}
                                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted text-foreground transition-colors"
                                      >
                                        <span className="block capitalize">{suggestion.name}</span>
                                        <span className="block text-xs capitalize text-muted-foreground">
                                          {suggestion.target || suggestion.muscleGroup}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="col-span-7 grid grid-cols-4 gap-2">
                                <input
                                  type="number"
                                  value={ejercicio.series}
                                  onChange={(e) => actualizarEjercicio(dia.id, ejercicio.id, 'series', parseInt(e.target.value) || 1)}
                                  className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-xs text-center text-foreground outline-none"
                                  min={1}
                                  aria-label="Series"
                                />
                                <input
                                  type="text"
                                  value={ejercicio.repeticiones}
                                  onChange={(e) => actualizarEjercicio(dia.id, ejercicio.id, 'repeticiones', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-xs text-center text-foreground outline-none"
                                  placeholder="Reps"
                                  aria-label="Repeticiones"
                                />
                                <input
                                  type="text"
                                  value={ejercicio.descanso}
                                  onChange={(e) => actualizarEjercicio(dia.id, ejercicio.id, 'descanso', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-xs text-center text-foreground outline-none"
                                  placeholder="Desc"
                                  aria-label="Descanso"
                                />
                                <select
                                  value={ejercicio.grupoMuscular}
                                  onChange={(e) => actualizarEjercicio(dia.id, ejercicio.id, 'grupoMuscular', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-xs text-muted-foreground outline-none cursor-pointer"
                                  aria-label="Grupo muscular"
                                >
                                  <option value="">Grupo</option>
                                  {gruposMusculares.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-12 flex justify-end">
                                <button
                                  onClick={() => eliminarEjercicio(dia.id, ejercicio.id)}
                                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                  aria-label="Eliminar ejercicio"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => agregarEjercicio(dia.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary text-sm transition-colors"
                          >
                            <Plus size={14} />
                            Añadir Ejercicio
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              {formData.dias.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Dumbbell size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Selecciona arriba los días que entrenarás</p>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="p-6 pt-4 border-t border-border bg-muted/50 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.nombre.trim() || formData.dias.length === 0 || isLoading}
            className="flex-[2] py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus size={16} />
                {isEditing ? 'Guardar Cambios' : 'Crear Rutina'}
              </>
            )}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
