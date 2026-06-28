'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Search, ShieldAlert } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  imageUrl: string | null;
  gifUrl: string | null;
  steps: string[];
}

interface ExerciseResponse {
  total: number;
  notice: string;
  facets: {
    categories: string[];
    equipment: string[];
    targets: string[];
  };
  exercises: Exercise[];
}

const emptyData: ExerciseResponse = {
  total: 0,
  notice: '',
  facets: { categories: [], equipment: [], targets: [] },
  exercises: [],
};

export default function EjerciciosPage() {
  const [data, setData] = useState<ExerciseResponse>(emptyData);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const search = new URLSearchParams({ limit: '60' });
    if (query.trim()) search.set('q', query.trim());
    if (category) search.set('category', category);
    if (equipment) search.set('equipment', equipment);
    if (target) search.set('target', target);
    return search.toString();
  }, [query, category, equipment, target]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetch(`/api/exercises?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('No se pudo cargar el catálogo'))))
      .then((payload: ExerciseResponse) => {
        if (!ignore) setData(payload);
      })
      .catch(() => {
        if (!ignore) setData(emptyData);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [params]);

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setEquipment('');
    setTarget('');
  };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border bg-background px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Dumbbell className="text-primary" />
              Biblioteca de ejercicios
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              1.324 ejercicios con imagen, GIF, grupo muscular y equipo.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{data.notice || 'Uso educativo/no comercial del dataset original.'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_180px_180px_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, músculo o equipo..."
              className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
            />
          </div>
          <FilterSelect label="Categoría" value={category} values={data.facets.categories} onChange={setCategory} />
          <FilterSelect label="Equipo" value={equipment} values={data.facets.equipment} onChange={setEquipment} />
          <FilterSelect label="Objetivo" value={target} values={data.facets.targets} onChange={setTarget} />
          <button
            onClick={clearFilters}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Limpiar
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? 'Cargando ejercicios...' : `${data.total} resultado${data.total === 1 ? '' : 's'} · mostrando ${data.exercises.length}`}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.exercises.map((exercise) => (
            <article key={exercise.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="aspect-video bg-muted">
                {exercise.gifUrl || exercise.imageUrl ? (
                  <img
                    src={exercise.gifUrl || exercise.imageUrl || ''}
                    alt={exercise.name}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-lg font-semibold capitalize text-foreground">{exercise.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {exercise.target} · {exercise.equipment}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs capitalize">
                  {[exercise.category, exercise.bodyPart, exercise.muscleGroup].filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
                {exercise.steps.length > 0 && (
                  <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                    {exercise.steps.slice(0, 2).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            </article>
          ))}
        </div>

        {!loading && data.exercises.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
            No encontré ejercicios con esos filtros.
          </div>
        )}
      </main>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-input bg-background px-3 py-3 text-sm capitalize text-foreground outline-none transition-all focus:ring-2 focus:ring-ring"
    >
      <option value="">{label}</option>
      {values.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}
