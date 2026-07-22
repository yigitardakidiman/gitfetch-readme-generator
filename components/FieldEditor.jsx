'use client';

import { useState } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

export default function FieldEditor({ fields, onChangeFields }) {
  const [draggedIndex, setDraggedIndex] = useState(null);

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
    onChangeFields([...fields, { key: "New.Key", value: "New Value" }]);
  };

  const handleAddHeader = () => {
    onChangeFields([...fields, { key: "SECTION: New Section", value: "New Section" }]);
  };

  const handleAddSpace = () => {
    onChangeFields([...fields, { key: "", value: "" }]);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...fields];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    onChangeFields(updated);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Add Action Buttons */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={handleAddField}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Field
        </button>
        <button
          type="button"
          onClick={handleAddHeader}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] border border-cyan-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Header
        </button>
        <button
          type="button"
          onClick={handleAddSpace}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] border border-white/10"
        >
          <Plus className="w-3.5 h-3.5" /> Blank Space
        </button>
      </div>

      {/* Rows Container */}
      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {fields.map((field, index) => {
          const isHeader = field.key && (field.key.startsWith('SECTION:') || field.key.startsWith('---'));
          const isBlank = !field.key && !field.value;
          const titleVal = field.value || (field.key ? field.key.replace(/^SECTION:|^---/, '').replace(/---$/, '').trim() : '');

          return (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-white/10 transition-all ${
                draggedIndex === index ? 'opacity-40 border-indigo-500' : 'hover:border-indigo-500/40'
              }`}
            >
              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab shrink-0 hover:text-cyan-400" />

              {isHeader ? (
                <>
                  <span className="bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase shrink-0">HEADER</span>
                  <input
                    type="text"
                    value={titleVal}
                    onChange={(e) => handleFieldChange(index, 'value', e.target.value, true)}
                    placeholder="Section Title"
                    className="flex-1 bg-slate-950 border border-white/10 rounded px-2 py-1 text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </>
              ) : isBlank ? (
                <div className="flex-1 text-center text-slate-500 bg-slate-950/40 py-1 rounded border border-white/5 font-mono text-[11px]">
                  --- Blank Line Space ---
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                    placeholder="Key"
                    className="w-1/3 bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-slate-500 font-bold">:</span>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => handleMove(index, 1)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                  title="Delete"
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
