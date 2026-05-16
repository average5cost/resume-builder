import { useMemo } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Module, ModuleType } from '../../types/resume';
import { ALL_MODULE_TYPES, MODULE_LABELS } from '../../types/resume';

interface Props {
  modules: Module[];
  selectedId: number | null;
  onSelect: (m: Module) => void;
  onAdd: (type: string) => void;
  onDelete: (id: number) => void;
  onToggleVisible: (id: number) => void;
  onReorder: (modules: Module[]) => void;
}

function SortableModule({ module: m, isSelected, onSelect, onDelete, onToggleVisible }: {
  module: Module;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`module-item${isSelected ? ' selected' : ''}${m.visible ? '' : ' hidden-module'}`}>
      <button {...attributes} {...listeners} className="drag-handle" title="拖拽排序">⠿</button>
      <span className="module-label" onClick={onSelect}>{MODULE_LABELS[m.type as ModuleType] || m.type}</span>
      <div className="module-actions">
        <button onClick={onToggleVisible} title={m.visible ? '隐藏' : '显示'}>
          {m.visible ? '👁' : '🚫'}
        </button>
        <button onClick={onDelete} title="删除">✕</button>
      </div>
    </div>
  );
}

export default function ModulePanel({ modules, selectedId, onSelect, onAdd, onDelete, onToggleVisible, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const usedTypes = useMemo(() => new Set(modules.map((m) => m.type)), [modules]);
  const availableTypes = ALL_MODULE_TYPES.filter((t) => !usedTypes.has(t));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const newModules = [...modules];
    const [removed] = newModules.splice(oldIndex, 1);
    newModules.splice(newIndex, 0, removed);
    onReorder(newModules);
  };

  return (
    <aside className="module-panel">
      <h3>简历模块</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="module-list">
            {modules.map((m) => (
              <SortableModule
                key={m.id}
                module={m}
                isSelected={m.id === selectedId}
                onSelect={() => onSelect(m)}
                onDelete={() => onDelete(m.id)}
                onToggleVisible={() => onToggleVisible(m.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {availableTypes.length > 0 && (
        <div className="add-module-section">
          <h4>添加模块</h4>
          <div className="add-module-list">
            {availableTypes.map((type) => (
              <button key={type} onClick={() => onAdd(type)} className="btn-add-module">
                + {MODULE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
