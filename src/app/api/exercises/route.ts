import { NextRequest, NextResponse } from 'next/server';
import exercises from '@/data/exercises-catalog.json';

const RAW_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';
const MAX_LIMIT = 1324;

type Exercise = (typeof exercises)[number];

const normalize = (value: string) => value.toLowerCase().trim();

const unique = (key: keyof Pick<Exercise, 'category' | 'equipment' | 'target' | 'bodyPart'>) =>
  Array.from(new Set(exercises.map((exercise) => exercise[key]).filter(Boolean))).sort();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = normalize(searchParams.get('q') || '');
  const category = normalize(searchParams.get('category') || '');
  const equipment = normalize(searchParams.get('equipment') || '');
  const target = normalize(searchParams.get('target') || '');
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 48, 1), MAX_LIMIT);

  const filtered = exercises.filter((exercise) => {
    const text = normalize([
      exercise.name,
      exercise.category,
      exercise.bodyPart,
      exercise.equipment,
      exercise.target,
      exercise.muscleGroup,
      ...exercise.secondaryMuscles,
    ].join(' '));

    return (
      (!q || text.includes(q)) &&
      (!category || normalize(exercise.category) === category) &&
      (!equipment || normalize(exercise.equipment) === equipment) &&
      (!target || normalize(exercise.target) === target)
    );
  });

  return NextResponse.json({
    total: filtered.length,
    source: 'hasaneyldrm/exercises-dataset',
    notice: 'Educational/non-commercial dataset. Media copyright remains with original holders.',
    facets: {
      categories: unique('category'),
      equipment: unique('equipment'),
      targets: unique('target'),
      bodyParts: unique('bodyPart'),
    },
    exercises: filtered.slice(0, limit).map((exercise) => ({
      ...exercise,
      imageUrl: exercise.image ? `${RAW_BASE}${exercise.image}` : null,
      gifUrl: exercise.gif ? `${RAW_BASE}${exercise.gif}` : null,
    })),
  });
}
