import React, { useState } from 'react';
import { X, Check, Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { NoteTable } from '@/store/useNotesStore';

interface TableEditorProps {
  initialData?: NoteTable;
  onSave: (table: NoteTable) => void;
  onClose: () => void;
}

export default function TableEditor({ initialData, onSave, onClose }: TableEditorProps) {
  const [rows, setRows] = useState<string[][]>(
    initialData?.rows || [['', ''], ['', '']]
  );

  const updateCell = (r: number, c: number, val: string) => {
    const newRows = [...rows];
    newRows[r] = [...newRows[r]];
    newRows[r][c] = val;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, new Array(rows[0].length).fill('')]);
  };

  const addCol = () => {
    setRows(rows.map(r => [...r, '']));
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const removeCol = (index: number) => {
    if (rows[0].length <= 1) return;
    setRows(rows.map(r => r.filter((_, i) => i !== index)));
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-white font-bold">Table Editor</h3>
        <button onClick={() => onSave({ rows })} className="p-2 text-[var(--color-accent-notes)] hover:text-white">
          <Check className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-auto glass rounded-2xl p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-8"></th>
              {rows[0].map((_, i) => (
                <th key={i} className="p-2">
                  <button onClick={() => removeCol(i)} className="text-red-500/50 hover:text-red-500">
                    <Trash2 className="w-3 h-3 mx-auto" />
                  </button>
                </th>
              ))}
              <th className="w-8">
                <button onClick={addCol} className="p-1 rounded bg-white/10 hover:bg-white/20">
                  <Plus className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIndex) => (
              <tr key={rIndex}>
                <td className="p-2 text-center">
                  <button onClick={() => removeRow(rIndex)} className="text-red-500/50 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
                {row.map((cell, cIndex) => (
                  <td key={cIndex} className="border border-white/10 p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rIndex, cIndex, e.target.value)}
                      className="w-full h-full bg-transparent p-2 outline-none text-sm text-white focus:bg-white/5"
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-2">
                <button onClick={addRow} className="p-1 rounded bg-white/10 hover:bg-white/20">
                  <Plus className="w-3 h-3" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
