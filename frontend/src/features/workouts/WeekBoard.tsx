import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { Workout } from "./types";
import "./WeekBoard.css";

const DAYS = [
  { id: "1", label: "Segunda" },
  { id: "2", label: "Terça" },
  { id: "3", label: "Quarta" },
  { id: "4", label: "Quinta" },
  { id: "5", label: "Sexta" },
  { id: "6", label: "Sábado" },
  { id: "0", label: "Domingo" },
];

const todayDow = new Date().getDay(); // 0..6

function WorkoutChip({ workout }: { workout: Workout }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: workout.id });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="workout-chip"
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
      aria-label={`Arrastar treino ${workout.name}. ${workout.exercises.length} exercícios`}
    >
      <strong>{workout.name}</strong>
      <small>{workout.exercises.length} exercícios</small>
    </button>
  );
}

function DayBox({
  id,
  label,
  isToday,
  children,
}: {
  id: string;
  label: string;
  isToday: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`day-box ${isOver ? "over" : ""} ${isToday ? "today" : ""}`}
      role="region"
      aria-label={`Treinos de ${label}${isToday ? " (hoje)" : ""}`}
    >
      <h4>
        {label}
        {isToday && <span className="today-badge">hoje</span>}
      </h4>
      <div className="day-box-items">{children}</div>
    </div>
  );
}

export function WeekBoard({
  workouts,
  onAssign,
}: {
  workouts: Workout[];
  onAssign: (workoutId: string, day: number | null) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(e: DragEndEvent) {
    const workoutId = String(e.active.id);
    const day = e.over ? Number(e.over.id) : null; // soltar fora = remove o dia
    onAssign(workoutId, day);
  }

  const unassigned = workouts.filter((w) => w.scheduledDay === null);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <section className="unassigned" aria-label="Treinos sem dia definido">
        <h3>Disponíveis</h3>
        <div className="chip-list">
          {unassigned.length === 0 ? (
            <p className="empty-hint">Todos os treinos já têm um dia 👍</p>
          ) : (
            unassigned.map((w) => <WorkoutChip key={w.id} workout={w} />)
          )}
        </div>
      </section>

      <div className="week-grid">
        {DAYS.map((d) => (
          <DayBox
            key={d.id}
            id={d.id}
            label={d.label}
            isToday={Number(d.id) === todayDow}
          >
            {workouts
              .filter((w) => w.scheduledDay === Number(d.id))
              .map((w) => (
                <WorkoutChip key={w.id} workout={w} />
              ))}
          </DayBox>
        ))}
      </div>
    </DndContext>
  );
}
