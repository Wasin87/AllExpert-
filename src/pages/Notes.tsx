import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useNotesStore, Note } from '@/store/useNotesStore';
import { Plus, Search, Pin, Trash2, X, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Personal', 'Travel', 'Important', 'Idea', 'Study', 'Expense', 'Shopping', 'Learning', 'Reminder', 'Health', 'Contact', 'Entertainment', 'Schedule'];

export default function Notes() {
  const { t } = useTranslation();
  const { notes, addNote, updateNote, deleteNote, togglePin, toggleHide, hidePassword, setHidePassword } = useNotesStore();
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [showHidden, setShowHidden] = useState(false);
  
  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingAction, setPendingAction] = useState<{type: 'view_hidden' | 'hide_note', noteId?: string} | null>(null);

  const filteredNotes = notes.filter(n => 
    (showHidden ? n.isHidden : !n.isHidden) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleSave = () => {
    if (!newTitle && !newContent) return;
    
    if (editingNote) {
      updateNote(editingNote.id, { title: newTitle, content: newContent, category: newCategory });
    } else {
      addNote({ title: newTitle, content: newContent, category: newCategory, isPinned: false, isHidden: false });
    }
    closeEditor();
  };

  const closeEditor = () => {
    setIsCreating(false);
    setEditingNote(null);
    setNewTitle('');
    setNewContent('');
    setNewCategory('Personal');
  };

  const openEditor = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setNewTitle(note.title);
      setNewContent(note.content);
      setNewCategory(note.category || 'Personal');
    } else {
      setEditingNote(null);
      setNewTitle('');
      setNewContent('');
      setNewCategory('Personal');
    }
    setIsCreating(true);
  };

  const handleHideAction = (noteId: string) => {
    if (!hidePassword) {
      // First time setting up password
      setPendingAction({ type: 'hide_note', noteId });
      setShowPasswordModal(true);
    } else {
      // Already has password, just hide it
      toggleHide(noteId);
    }
  };

  const handleViewHiddenAction = () => {
    if (showHidden) {
      setShowHidden(false);
      return;
    }
    
    if (!hidePassword) {
      // No hidden notes yet or no password set
      setShowHidden(true);
    } else {
      setPendingAction({ type: 'view_hidden' });
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (!hidePassword) {
      // Setting new password
      if (passwordInput.length < 4) {
        setPasswordError('Password must be at least 4 characters');
        return;
      }
      setHidePassword(passwordInput);
      
      if (pendingAction?.type === 'hide_note' && pendingAction.noteId) {
        toggleHide(pendingAction.noteId);
      } else if (pendingAction?.type === 'view_hidden') {
        setShowHidden(true);
      }
      
      closePasswordModal();
    } else {
      // Verifying existing password
      if (passwordInput === hidePassword) {
        if (pendingAction?.type === 'hide_note' && pendingAction.noteId) {
          toggleHide(pendingAction.noteId);
        } else if (pendingAction?.type === 'view_hidden') {
          setShowHidden(true);
        }
        closePasswordModal();
      } else {
        setPasswordError('Incorrect password');
      }
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordError('');
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] relative">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-accent-notes)] drop-shadow-[0_0_12px_rgba(191,0,255,0.3)]">{t('Notes')}</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleViewHiddenAction}
              className={`p-2 rounded-xl glass transition-all duration-300 ${showHidden ? 'text-[var(--color-accent-notes)] shadow-[0_0_12px_rgba(191,0,255,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {showHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => openEditor()}
              className="p-2 rounded-xl bg-[var(--color-accent-notes)] text-white shadow-[0_0_15px_rgba(191,0,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder={t('Search notes')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl glass outline-none border border-white/5 focus:border-[var(--color-accent-notes)]/50 transition-all text-sm text-white placeholder-gray-600"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 space-y-3 scrollbar-hide">
        <AnimatePresence>
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-2xl p-5 relative group cursor-pointer hover:bg-white/5 transition-all duration-300"
              onClick={() => openEditor(note)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold truncate pr-20 text-white/90">{note.title || 'Untitled'}</h3>
                <div className="flex gap-1.5 absolute right-5 top-5">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (note.isHidden) {
                        toggleHide(note.id);
                      } else {
                        handleHideAction(note.id);
                      }
                    }}
                    className={`p-1.5 rounded-lg glass transition-all ${note.isHidden ? 'text-[var(--color-accent-notes)] opacity-100' : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                  >
                    {note.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                    className={`p-1.5 rounded-lg glass transition-all ${note.isPinned ? 'text-[var(--color-accent-notes)] shadow-[0_0_10px_rgba(191,0,255,0.2)]' : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="p-1.5 rounded-lg glass text-red-500/70 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{note.content}</p>
              <div className="flex justify-between items-center text-[10px]">
                <span className="px-2 py-1 rounded-lg bg-[var(--color-accent-notes)]/10 text-[var(--color-accent-notes)] font-semibold border border-[var(--color-accent-notes)]/20">
                  {note.category || 'General'}
                </span>
                <span className="text-gray-500 font-medium">{format(note.updatedAt, 'MMM d, yyyy')}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredNotes.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            {showHidden ? t('No hidden notes found.') : t('No notes found.')}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[var(--bg)] flex flex-col"
          >
            <div className="flex justify-between items-center p-3 border-b border-[var(--border)]">
              <button onClick={closeEditor} className="p-1.5 text-gray-500">
                <X className="w-5 h-5" />
              </button>
              <span className="font-semibold text-sm">{editingNote ? t('Edit Note') : t('New Note')}</span>
              <button onClick={handleSave} className="p-1.5 text-[var(--color-accent-notes)]">
                <Check className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-5 gap-3">
              <input
                type="text"
                placeholder={t('Title')}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="text-xl font-bold bg-transparent outline-none text-[var(--text)]"
              />
              <div className="flex justify-between items-center">
                <select 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="bg-transparent text-xs text-[var(--color-accent-notes)] outline-none w-fit cursor-pointer font-semibold"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="text-black dark:text-white bg-white dark:bg-gray-800">{t(cat)}</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder={t('Start typing...')}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="flex-1 bg-transparent outline-none resize-none text-sm text-[var(--text)] leading-relaxed"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--card)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-[var(--color-accent-notes)]">
                  <Lock className="w-6 h-6" />
                  <h3 className="text-xl font-bold">
                    {!hidePassword ? t('Set Password') : t('Enter Password')}
                  </h3>
                </div>
                <button onClick={closePasswordModal} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-400 mb-6">
                {!hidePassword 
                  ? t('Create a password to protect your hidden notes. You will need this to view them later.') 
                  : t('Enter your password to access hidden notes.')}
              </p>

              <input
                type="password"
                placeholder={t('Password')}
                value={passwordInput}
                onChange={e => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                className="w-full px-4 py-3 rounded-xl glass outline-none focus:border-[var(--color-accent-notes)] transition-colors mb-2 text-[var(--text)]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePasswordSubmit();
                }}
              />
              
              {passwordError && (
                <p className="text-red-500 text-xs mb-4">{t(passwordError)}</p>
              )}

              <button
                onClick={handlePasswordSubmit}
                className="w-full py-3 mt-4 rounded-xl bg-[var(--color-accent-notes)] text-white font-medium shadow-lg transition-transform active:scale-95"
              >
                {!hidePassword ? t('Set Password & Continue') : t('Unlock')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
