import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NoteTable {
  rows: string[][];
}

export interface NoteAttachment {
  id: string;
  type: 'image' | 'file' | 'camera' | 'drawing' | 'table' | 'video';
  url: string;
  name?: string;
  fileType?: string;
  tableData?: NoteTable;
}

export interface NoteFormatting {
  color?: string;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  lineSpacing?: string;
  alignment?: 'left' | 'center' | 'right';
  fontFamily?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isHidden?: boolean;
  attachments?: NoteAttachment[];
  formatting?: NoteFormatting;
  createdAt: number;
  updatedAt: number;
}

interface NotesState {
  notes: Note[];
  hidePassword: string | null;
  setHidePassword: (password: string | null) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleHide: (id: string) => void;
  resetPassword: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      hidePassword: null,
      setHidePassword: (password) => set({ hidePassword: password }),
      addNote: (note) => set((state) => ({
        notes: [
          ...state.notes,
          {
            ...note,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        ]
      })),
      updateNote: (id, updatedFields) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, ...updatedFields, updatedAt: Date.now() } : note
        )
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((note) => note.id !== id)
      })),
      togglePin: (id) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() } : note
        )
      })),
      toggleHide: (id) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, isHidden: !note.isHidden, updatedAt: Date.now() } : note
        )
      })),
      resetPassword: () => set((state) => ({
        hidePassword: null,
        notes: state.notes.map(n => ({ ...n, isHidden: false }))
      })),
    }),
    {
      name: 'allexpert-notes',
    }
  )
);
