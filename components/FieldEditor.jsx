'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Trash2, Plus, Hash, Minus } from 'lucide-react';

export default function FieldEditor({ fields, onChangeFields }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [focusIndex, setFocusIndex] = useState(null);
  const rowRefs = useRef({});

  useEffect(() => {
    if (focusIndex !== null && rowRefs.current[focusIndex]) {
      const el = rowRefs.current[focusIndex];
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const firstInput = el.querySelector('input');
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
      setFocusIndex(null);
    }
  }, [focusIndex, fields.length]);

  const handleFieldChange = (index, keyOrValue, val, isHeader = false) => {
    const updated = [...fields];
    if (isHeader) {
      updated[index] = {
        key: `SECTION: ${val}`,
        value: val
      };
    } else {
      updated[index] = {
        ...updated[index],
        [keyOrValue]: val
      };
    }
    onChangeFields(updated);
  };

  const handleDelete = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    onChangeFields(updated);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeFields(updated);
  };

  const handleAddField = () => {
    const nextIdx = fields.length;
    onChangeFields([...fields, { key: 'Custom.Key', value: 'Value' }]);
    setFocusIndex(nextIdx);
  };

  const handleAddHeader = () => {
    const nextIdx = fields.length;
    onChangeFields([...fields, { key: 'SECTION: New Section', value: 'New Section' }]);
    setFocusIndex(nextIdx);
  };

  const handleAddSpace = () => {
    const nextIdx = fields.length;
    onChangeFields([...fields, { key: '', value: '' }]);
    setFocusIndex(nextIdx);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const updated = [...fields];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    onChangeFields(updated);
  };

  return (
    <div className="flex flex-col gap-3 text-xs font-mono">
      {/* Sticky Add Action Bar */}
      <div className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-sm py-2 border-b border-[#30363d] flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleAddField}
            className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1 text-[11px] border border-[#3fb950]/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Field</span>
          </button>
          <button
            type="button"
            onClick={handleAddHeader}
            className="bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1 text-[11px] border border-[#30363d] transition-colors"
          >
            <Hash className="w-3 h-3" />
            <span>Section</span>
          </button>
          <button
            type="button"
            onClick={handleAddSpace}
            className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1 text-[11px] border border-[#30363d] transition-colors"
          >
            <Minus className="w-3 h-3 text-[#8b949e]" />
            <span>Blank Line</span>
          </button>
        </div>
        <span className="text-[10px] text-[#8b949e] tabular-nums shrink-0">
          {fields.length} rows
        </span>
      </div>

      {/* Empty State */}
      {fields.length === 0 && (
        <div className="p-6 text-center bg-[#161b22] border border-dashed border-[#30363d] rounded-lg flex flex-col items-center gap-2">
          <p className="text-[#8b949e] text-xs">No fields in your terminal card yet.</p>
          <button
            type="button"
            onClick={handleAddField}
            className="bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] px-3 py-1.5 rounded-md border border-[#30363d] text-xs font-medium"
          >
            + Add First Field
          </button>
        </div>
      )}

      {/* Rows List (Single Scroll handled by parent panel) */}
      <div className="flex flex-col gap-1.5 pb-4">
        {fields.map((field, index) => {
          const isHeader = field.key && (field.key.startsWith('SECTION:') || field.key.startsWith('---'));
          const isBlank = !field.key && !field.value;
          const titleVal = field.value || (field.key ? field.key.replace(/^SECTION:|^---/, '').replace(/---$/, '').trim() : '');

          const isDragged = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;

          return (
            <div
              key={index}
              ref={(el) => { rowRefs.current[index] = el; }}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={`group flex items-center gap-1.5 rounded-md border transition-all ${
                isBlank
                  ? 'py-1 px-2 bg-[#0d1117]/60 border-dashed border-[#30363d]/70'
                  : isHeader
                  ? 'p-2 bg-[#58a6ff]/10 border-[#58a6ff]/30 mt-1'
                  : 'p-1.5 bg-[#161b22] border-[#30363d] hover:border-[#8b949e]/60'
              } ${isDragged ? 'opacity-40 scale-[0.99]' : ''} ${
                isDragOver ? 'border-[#58a6ff] ring-1 ring-[#58a6ff]' : ''
              }`}
            >
              <GripVertical className="w-3.5 h-3.5 text-[#8b949e]/60 group-hover:text-[#c9d1d9] cursor-grab active:cursor-grabbing shrink-0" />

              {isHeader ? (
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="bg-[#58a6ff]/20 text-[#58a6ff] font-bold px-1.5 py-0.5 rounded text-[10px] uppercase shrink-0 border border-[#58a6ff]/30">
                    SEC
                  </span>
                  <input
                    type="text"
                    value={titleVal}
                    onChange={(e) => handleFieldChange(index, 'value', e.target.value, true)}
                    placeholder="Section Header Title"
                    className="flex-1 min-w-0 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-[#58a6ff] font-bold text-xs focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              ) : isBlank ? (
                <div className="flex-1 flex items-center justify-center gap-2 text-[#8b949e] text-[10px] select-none">
                  <span className="h-[1px] flex-1 bg-[#30363d]/60" />
                  <span>empty line spacer</span>
                  <span className="h-[1px] flex-1 bg-[#30363d]/60" />
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                    placeholder="Key"
                    className="w-[38%] min-w-0 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-[#79c0ff] font-medium text-[11px] focus:outline-none focus:border-[#58a6ff]"
                  />
                  <span className="text-[#8b949e] font-bold shrink-0">:</span>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 min-w-0 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-[#c9d1d9] text-[11px] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              )}

              {/* Compact Row Actions */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                  className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-white disabled:opacity-25"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => handleMove(index, 1)}
                  className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-white disabled:opacity-25"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-1 rounded hover:bg-[#f85149]/20 text-[#8b949e] hover:text-[#f85149]"
                  title="Delete Row"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

