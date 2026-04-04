import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Register custom size style for Quill to support pixel values
const Size = (Quill as any).import('attributors/style/size');
(Size as any).whitelist = null; // Allow any value
(Quill as any).register(Size, true);

// Register custom font style for Quill
const Font = (Quill as any).import('attributors/style/font');
const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Playfair Display', 
  'Oswald', 'Raleway', 'Merriweather', 'Ubuntu', 'Lora', 'Nunito', 'PT Sans', 
  'PT Serif', 'Mukta', 'Kanit', 'Quicksand', 'Bebas Neue', 'Josefin Sans'
];
(Font as any).whitelist = FONT_FAMILIES;
(Quill as any).register(Font, true);

const QuillEditor = ReactQuill as any;
import { useNotesStore, Note, NoteAttachment, NoteFormatting } from '@/store/useNotesStore';
import { Plus, Search, Pin, Trash2, X, Check, Eye, EyeOff, Lock, Image as ImageIcon, FileText, Camera, Type, Pencil, AlignLeft, AlignCenter, AlignRight, Bold, Palette, Type as FontSizeIcon, MoreVertical, Download, Table as TableIcon, Edit2, List, ListOrdered, Hash, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Undo2, Redo2, Minus, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import DrawingCanvas from '@/components/DrawingCanvas';
import TableEditor from '@/components/TableEditor';
import { NoteTable } from '@/store/useNotesStore';

const CATEGORIES = ['Personal', 'Travel', 'Important', 'Idea', 'Study', 'Expense', 'Shopping', 'Learning', 'Reminder', 'Health', 'Contact', 'Entertainment', 'Schedule'];
const COLORS = ['#FFFFFF', '#BF00FF', '#00F2FF', '#4D9FFF', '#FF4D4D', '#4DFF4D', '#FFFF4D', '#000000'];

export default function Notes() {
  const { t } = useTranslation();
  const { notes, addNote, updateNote, deleteNote, togglePin, toggleHide, hidePassword, setHidePassword, resetPassword } = useNotesStore();
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newAttachments, setNewAttachments] = useState<NoteAttachment[]>([]);
  const [newFormatting, setNewFormatting] = useState<NoteFormatting>({
    color: '#FFFFFF',
    fontSize: 16,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    lineSpacing: 'leading-relaxed',
    alignment: 'left',
    fontFamily: 'Inter'
  });
  const [showFormattingMenu, setShowFormattingMenu] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<NoteAttachment | null>(null);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fontSizeInput, setFontSizeInput] = useState('');
  const [currentFormat, setCurrentFormat] = useState<any>({});
  const [savedSelection, setSavedSelection] = useState<any>(null);
  const [isFormattingActive, setIsFormattingActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Quill Modules and Formats
  const modules = {
    toolbar: false, // We use our custom toolbar
  };

  const formats = [
    'font', 'size', 'bold', 'italic', 'underline', 'color', 'align', 'list'
  ];

  // Helper to apply formatting to selection
  const applyFormat = (format: string, value: any) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = quill.getSelection() || savedSelection;
      const current = quill.getFormat(selection || undefined);
      
      let newValue = value;
      if (format === 'bold' || format === 'italic' || format === 'underline') {
        newValue = !current[format];
      } else if (format === 'align') {
        // Standard block alignment
        newValue = current[format] === value ? false : (value || false);
      } else if (format === 'list') {
        // Toggle list: if already selected, go back to none
        newValue = current[format] === value ? false : (value || false);
      }

      if (selection) {
        quill.format(format, newValue);
        // Keep selection after formatting
        quill.setSelection(selection.index, selection.length);
      } else {
        quill.format(format, newValue);
      }
      
      // Update current format state immediately for UI feedback
      setCurrentFormat(quill.getFormat(selection || undefined));
    }
  };

  const handleFontSizeChange = (val: string) => {
    // Allow only digits
    const numericVal = val.replace(/\D/g, '');
    setFontSizeInput(numericVal);
    
    if (numericVal !== '' && numericVal !== '0') {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const selection = quill.getSelection() || savedSelection;
        if (selection) {
          quill.formatText(selection.index, selection.length, 'size', `${numericVal}px`);
          // Maintain selection and focus
          quill.setSelection(selection.index, selection.length);
        } else {
          // Apply as default for next typing
          quill.format('size', `${numericVal}px`);
        }
        // Ensure editor keeps focus but doesn't steal it from input immediately
        // if we are still typing. But usually we want the editor to be ready.
      }
    }
  };

  const adjustFontSize = (delta: number) => {
    const currentSize = parseInt(fontSizeInput) || 16;
    const newSize = Math.max(8, Math.min(100, currentSize + delta));
    handleFontSizeChange(String(newSize));
  };

  const handleInputFocus = (e: React.FocusEvent | React.MouseEvent) => {
    e.stopPropagation();
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = quill.getSelection();
      if (selection && selection.length > 0) {
        setSavedSelection(selection);
      }
    }
    setIsFormattingActive(true);
  };

  const [attachmentHistory, setAttachmentHistory] = useState<NoteAttachment[][]>([]);
  const [attachmentRedoStack, setAttachmentRedoStack] = useState<NoteAttachment[][]>([]);

  const handleUndo = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) quill.history.undo();
    
    if (attachmentHistory.length > 0) {
      const prev = attachmentHistory[attachmentHistory.length - 1];
      setAttachmentRedoStack(prevStack => [newAttachments, ...prevStack]);
      setNewAttachments(prev);
      setAttachmentHistory(prevHistory => prevHistory.slice(0, -1));
    }
  };

  const handleRedo = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) quill.history.redo();
    
    if (attachmentRedoStack.length > 0) {
      const next = attachmentRedoStack[0];
      setAttachmentHistory(prevHistory => [...prevHistory, newAttachments]);
      setNewAttachments(next);
      setAttachmentRedoStack(prevStack => prevStack.slice(1));
    }
  };

  const updateAttachmentsWithHistory = (newAtts: NoteAttachment[]) => {
    setAttachmentHistory(prev => [...prev, newAttachments]);
    setAttachmentRedoStack([]);
    setNewAttachments(newAtts);
  };

  const moveAttachment = (id: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const index = newAttachments.findIndex(a => a.id === id);
    if (index === -1) return;
    
    const newIndex = (direction === 'left' || direction === 'up') ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newAttachments.length) return;
    
    const updated = [...newAttachments];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updateAttachmentsWithHistory(updated);
  };

  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handleSelectionChange = (range: any) => {
      if (range) {
        const format = quill.getFormat(range);
        setCurrentFormat(format);

        if (range.length > 0) {
          const bounds = quill.getBounds(range.index, range.length);
          const editorContainer = quill.container.parentElement; // quill-editor-container
          
          setSelectionToolbar({
            x: bounds.left + (bounds.width / 2) + (editorContainer?.offsetLeft || 0),
            y: bounds.top + (editorContainer?.offsetTop || 0) - 45,
            show: true
          });

          if (format.size) {
            const size = String(format.size).replace('px', '');
            setFontSizeInput(size);
          }
        } else {
          setSelectionToolbar(prev => ({ ...prev, show: false }));
          if (format.size) {
            const size = String(format.size).replace('px', '');
            setFontSizeInput(size);
          }
        }
      } else {
        setSelectionToolbar(prev => ({ ...prev, show: false }));
      }
    };

    quill.on('selection-change', handleSelectionChange);
    return () => {
      quill.off('selection-change', handleSelectionChange);
    };
  }, [isCreating]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingAction, setPendingAction] = useState<{type: 'view_hidden' | 'hide_note' | 'change_password', noteId?: string} | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredNotes = notes.filter(n => 
    (n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleSave = () => {
    if (!newTitle && !newContent && newAttachments.length === 0) return;
    
    const noteData = { 
      title: newTitle, 
      content: newContent, 
      category: newCategory,
      attachments: newAttachments,
      formatting: newFormatting
    };

    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      addNote({ ...noteData, isPinned: false, isHidden: false });
    }
    closeEditor();
  };

  const closeEditor = () => {
    setIsCreating(false);
    setEditingNote(null);
    setNewTitle('');
    setNewContent('');
    setNewCategory('Personal');
    setNewAttachments([]);
    setNewFormatting({
      color: '#FFFFFF',
      fontSize: 16,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      lineSpacing: 'leading-relaxed',
      alignment: 'left',
      fontFamily: 'Inter'
    });
    setShowFormattingMenu(false);
  };

  const openEditor = (note?: Note) => {
    if (note) {
      if (note.isHidden) {
        setPendingAction({ type: 'view_hidden', noteId: note.id });
        setShowPasswordModal(true);
        return;
      }
      setEditingNote(note);
      setNewTitle(note.title);
      setNewContent(note.content);
      setNewCategory(note.category || 'Personal');
      setNewAttachments(note.attachments || []);
      setNewFormatting(note.formatting || {
        color: '#FFFFFF',
        fontSize: 16,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        lineSpacing: 'leading-relaxed',
        alignment: 'left',
        fontFamily: 'Inter'
      });
      setIsReadOnly(true);
    } else {
      setEditingNote(null);
      setNewTitle('');
      setNewContent('');
      setNewCategory('Personal');
      setNewAttachments([]);
      setNewFormatting({
        color: '#FFFFFF',
        fontSize: 16,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        lineSpacing: 'leading-relaxed',
        alignment: 'left',
        fontFamily: 'Inter'
      });
      setIsReadOnly(false);
    }
    setIsCreating(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (editingAttachment) {
        updateAttachmentsWithHistory(newAttachments.map(a => a.id === editingAttachment.id ? { ...a, url, name: file.name, fileType: file.type } : a));
        setEditingAttachment(null);
      } else {
        const attachment: NoteAttachment = {
          id: crypto.randomUUID(),
          type,
          url,
          name: file.name,
          fileType: file.type
        };
        updateAttachmentsWithHistory([...newAttachments, attachment]);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please enable camera access in your browser settings.');
      } else {
        setCameraError('Failed to access camera. Please try again.');
      }
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    
    const url = canvas.toDataURL('image/jpeg');
    const attachment: NoteAttachment = {
      id: crypto.randomUUID(),
      type: 'camera',
      url,
      name: `Photo_${new Date().getTime()}.jpg`
    };
    updateAttachmentsWithHistory([...newAttachments, attachment]);
    stopCamera();
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const handleDrawingSave = (dataUrl: string) => {
    if (editingAttachment) {
      updateAttachmentsWithHistory(newAttachments.map(a => a.id === editingAttachment.id ? { ...a, url: dataUrl } : a));
      setEditingAttachment(null);
    } else {
      const attachment: NoteAttachment = {
        id: crypto.randomUUID(),
        type: 'drawing',
        url: dataUrl,
        name: `Drawing_${new Date().getTime()}.png`
      };
      updateAttachmentsWithHistory([...newAttachments, attachment]);
    }
    setShowDrawingCanvas(false);
  };

  const handleTableSave = (tableData: NoteTable) => {
    if (editingAttachment) {
      updateAttachmentsWithHistory(newAttachments.map(a => a.id === editingAttachment.id ? { ...a, tableData } : a));
      setEditingAttachment(null);
    } else {
      const attachment: NoteAttachment = {
        id: crypto.randomUUID(),
        type: 'table',
        url: '', // Table doesn't need a URL
        name: `Table_${new Date().getTime()}`,
        tableData
      };
      updateAttachmentsWithHistory([...newAttachments, attachment]);
    }
    setShowTableEditor(false);
  };

  const editAttachment = (att: NoteAttachment) => {
    if (isReadOnly) setIsReadOnly(false);
    if (att.type === 'drawing') {
      setEditingAttachment(att);
      setShowDrawingCanvas(true);
    } else if (att.type === 'table') {
      setEditingAttachment(att);
      setShowTableEditor(true);
    } else if (att.type === 'image' || att.type === 'camera' || att.type === 'file') {
      // Replace attachment
      setEditingAttachment(att);
      if (att.type === 'file') {
        fileInputRef.current?.click();
      } else {
        imageInputRef.current?.click();
      }
    }
  };

  const removeAttachment = (id: string) => {
    updateAttachmentsWithHistory(newAttachments.filter(a => a.id !== id));
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
      }
      
      closePasswordModal();
    } else if (isChangingPassword) {
      // Changing existing password
      if (passwordInput !== hidePassword) {
        setPasswordError('Incorrect current password');
        return;
      }
      if (newPasswordInput.length < 4) {
        setPasswordError('New password must be at least 4 characters');
        return;
      }
      setHidePassword(newPasswordInput);
      closePasswordModal();
    } else {
      // Verifying existing password
      if (passwordInput === hidePassword) {
        if (pendingAction?.type === 'hide_note' && pendingAction.noteId) {
          toggleHide(pendingAction.noteId);
        } else if (pendingAction?.type === 'view_hidden' && pendingAction.noteId) {
          toggleHide(pendingAction.noteId);
          const note = notes.find(n => n.id === pendingAction.noteId);
          if (note) openEditor({ ...note, isHidden: false });
        }
        closePasswordModal();
      } else {
        setPasswordError('Incorrect password');
      }
    }
  };

  const handleResetPassword = () => {
    resetPassword();
    setShowResetConfirm(false);
    closePasswordModal();
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setNewPasswordInput('');
    setPasswordError('');
    setPendingAction(null);
    setIsChangingPassword(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] relative">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-accent-notes)] drop-shadow-[0_0_12px_rgba(191,0,255,0.3)]">{t('Notes')}</h2>
          <div className="flex gap-2">
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
      <div className="flex-1 overflow-y-auto px-6 pb-28 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`glass text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-2xl p-5 relative group cursor-pointer hover:bg-white/5 transition-all duration-300 ${note.isHidden ? 'flex flex-col items-center text-center' : ''}`}
              onClick={() => openEditor(note)}
            >
              {note.isHidden ? (
                <div className="py-4 flex flex-col items-center gap-4">
                  <h3 className="text-base font-bold text-white/90">{note.title || 'Untitled'}</h3>
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center border-2 border-[var(--color-accent-notes)]/30 shadow-[0_0_20px_rgba(77,159,255,0.2)]">
                    <EyeOff className="w-8 h-8 text-[var(--color-accent-notes)]" />
                  </div>
                  <div className="absolute right-5 top-5 flex gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                      className="p-1.5 rounded-lg glass text-red-500/70 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                        className={`p-1.5 rounded-lg glass transition-all ${note.isHidden ? 'text-[var(--color-accent-notes)]' : 'text-gray-500 hover:text-white'}`}
                      >
                        {note.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                        className={`p-1.5 rounded-lg glass transition-all ${note.isPinned ? 'text-[var(--color-accent-notes)] shadow-[0_0_10px_rgba(191,0,255,0.2)]' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        className="p-1.5 rounded-lg glass text-red-500/70 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div 
                    className={`text-xs line-clamp-2 mb-3 leading-relaxed opacity-80`}
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                  
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                      {note.attachments.slice(0, 3).map(att => (
                        <div key={att.id} className="w-12 h-12 rounded-lg glass overflow-hidden flex-shrink-0 border border-white/10">
                          {att.type === 'file' ? (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                          ) : att.type === 'table' ? (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <TableIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          ) : (
                            <img src={att.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                      {note.attachments.length > 3 && (
                        <div className="w-12 h-12 rounded-lg glass flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0">
                          +{note.attachments.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="px-2 py-1 rounded-lg bg-[var(--color-accent-notes)]/10 text-[var(--color-accent-notes)] font-semibold border border-[var(--color-accent-notes)]/20">
                      {note.category || 'General'}
                    </span>
                    <span className="text-gray-500 font-medium">{format(note.updatedAt, 'MMM d, yyyy')}</span>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredNotes.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            {t('No notes found.')}
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
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{editingNote ? (isReadOnly ? t('View Note') : t('Edit Note')) : t('New Note')}</span>
                {editingNote && isReadOnly && (
                  <button onClick={() => setIsReadOnly(false)} className="p-1 text-[var(--color-accent-notes)]">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {!isReadOnly ? (
                <button onClick={handleSave} className="p-1.5 text-[var(--color-accent-notes)]">
                  <Check className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-8" />
              )}
            </div>

            {/* Formatting Menu - Sticky at top of content area */}
            <div className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-md border-b border-white/5">
              <AnimatePresence>
                {showFormattingMenu && !isReadOnly && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-3 flex flex-nowrap gap-4 items-center overflow-x-auto scrollbar-hide"
                  >
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('align', '')} 
                        className={`p-2 rounded-lg transition-all duration-200 ${(!currentFormat.align || currentFormat.align === '') ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('align', 'center')} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.align === 'center' ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('align', 'right')} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.align === 'right' ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="h-6 w-px bg-white/10 flex-shrink-0" />
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('bold', true)} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.bold ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('italic', true)} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.italic ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <span className="italic font-serif w-4 h-4 flex items-center justify-center">I</span>
                      </button>
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('underline', true)} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.underline ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <span className="underline w-4 h-4 flex items-center justify-center">U</span>
                      </button>
                    </div>
                    <div className="h-6 w-px bg-white/10 flex-shrink-0" />
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('list', 'bullet')} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.list === 'bullet' ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('list', 'ordered')} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.list === 'ordered' ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => applyFormat('list', 'roman')} 
                        className={`p-2 rounded-lg transition-all duration-200 ${currentFormat.list === 'roman' ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_10px_rgba(77,159,255,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="h-6 w-px bg-white/10 flex-shrink-0" />
                    <div className="flex gap-2 flex-shrink-0">
                      {COLORS.map(c => (
                        <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('color', c)} className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="h-6 w-px bg-white/10 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-gray-400">Size</span>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                        <button 
                          onMouseDown={(e) => e.preventDefault()} 
                          onClick={() => adjustFontSize(-1)}
                          className="px-1.5 py-1 hover:bg-white/10 text-gray-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          placeholder="16"
                          value={fontSizeInput}
                          onFocus={handleInputFocus}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          onChange={(e) => handleFontSizeChange(e.target.value)}
                          className="w-10 bg-transparent text-center py-1 text-xs outline-none text-white border-x border-white/10"
                        />
                        <button 
                          onMouseDown={(e) => e.preventDefault()} 
                          onClick={() => adjustFontSize(1)}
                          className="px-1.5 py-1 hover:bg-white/10 text-gray-400 transition-colors"
                        >
                          <PlusCircle className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="h-6 w-px bg-white/10 flex-shrink-0" />
                    <div className="relative flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                      <select 
                        value={quillRef.current?.getEditor().getFormat().font || 'Inter'}
                        onChange={(e) => {
                          applyFormat('font', e.target.value);
                          // Force focus back to editor after selection
                          setTimeout(() => quillRef.current?.getEditor().focus(), 10);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none text-white appearance-none pr-6 min-w-[100px]"
                        style={{ fontFamily: quillRef.current?.getEditor().getFormat().font || 'Inter' }}
                      >
                        {FONT_FAMILIES.map(font => (
                          <option key={font} value={font} className="bg-gray-900 text-white" style={{ fontFamily: font }}>
                            {font}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto scrollbar-hide relative">
            {/* Header Layout Restructure: Category + Tools first */}
            <div className="flex items-center z-20 bg-[var(--bg)]/90 backdrop-blur-xl py-2 sticky top-0 -mt-2 gap-3 border-b border-white/10 px-4 shadow-xl">
              <div className="flex-shrink-0">
                <div className="relative group">
                  <select 
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    disabled={isReadOnly}
                    className={`bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-[var(--color-accent-notes)] outline-none font-bold tracking-widest uppercase transition-all hover:bg-white/10 ${isReadOnly ? 'cursor-default appearance-none' : 'cursor-pointer'}`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="text-black dark:text-white bg-white dark:bg-gray-800">{t(cat)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex-1 flex items-center justify-end overflow-hidden">
                  <div className="overflow-x-auto scrollbar-hide flex items-center gap-2 pb-1 mask-fade-right pr-4">
                    <div className="flex gap-1.5 items-center flex-nowrap">
                      <button onClick={handleUndo} className="p-2.5 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 shadow-sm" title={t('Undo')}>
                        <Undo2 className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={handleRedo} className="p-2.5 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 shadow-sm" title={t('Redo')}>
                        <Redo2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-1 flex-shrink-0" />
                    <div className="flex gap-2 items-center flex-nowrap">
                      <button onClick={() => imageInputRef.current?.click()} className="p-2.5 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 shadow-sm">
                        <ImageIcon className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 shadow-sm">
                        <FileText className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={startCamera} className="p-2.5 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 shadow-sm">
                        <Camera className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => setShowDrawingCanvas(true)} className="p-2.5 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 shadow-sm">
                        <Pencil className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => setShowTableEditor(true)} className="p-2.5 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 shadow-sm">
                        <TableIcon className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => setShowFormattingMenu(!showFormattingMenu)} 
                        className={`p-2.5 rounded-xl glass transition-all flex-shrink-0 shadow-sm ${showFormattingMenu ? 'text-[var(--color-accent-notes)] border-[var(--color-accent-notes)]/50 bg-[var(--color-accent-notes)]/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                      >
                        <Type className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Title second */}
              <input
                type="text"
                placeholder={t('Title')}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                readOnly={isReadOnly}
                className={`text-2xl font-bold bg-transparent outline-none text-[var(--text)] ${isReadOnly ? 'cursor-default' : ''}`}
              />

              {/* Hidden Inputs */}
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => handleFileUpload(e, 'file')} />

              {/* Editor third */}
              <div className="flex-1 flex flex-col min-h-[200px] quill-editor-container">
                <QuillEditor
                  ref={quillRef}
                  theme="snow"
                  value={newContent}
                  onChange={setNewContent}
                  readOnly={isReadOnly}
                  modules={modules}
                  formats={formats}
                  placeholder={t('Start typing...')}
                  className="h-full border-none"
                />

                {/* Floating Selection Toolbar */}
                <AnimatePresence>
                  {selectionToolbar.show && !isReadOnly && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      style={{ 
                        position: 'absolute', 
                        left: selectionToolbar.x, 
                        top: selectionToolbar.y,
                        transform: 'translateX(-50%)'
                      }}
                      className="z-[100] glass border border-white/20 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl backdrop-blur-xl"
                      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                    >
                      <button 
                        onClick={() => applyFormat('bold', true)} 
                        className={`p-1.5 rounded-lg transition-all duration-200 ${currentFormat.bold ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_8px_rgba(77,159,255,0.4)]' : 'hover:bg-white/10 text-white'}`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => applyFormat('italic', true)} 
                        className={`p-1.5 rounded-lg transition-all duration-200 ${currentFormat.italic ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_8px_rgba(77,159,255,0.4)]' : 'hover:bg-white/10 text-white'} italic font-serif w-7 h-7 flex items-center justify-center`}
                      >
                        I
                      </button>
                      <button 
                        onClick={() => applyFormat('underline', true)} 
                        className={`p-1.5 rounded-lg transition-all duration-200 ${currentFormat.underline ? 'bg-[var(--color-accent-notes)] text-white shadow-[0_0_8px_rgba(77,159,255,0.4)]' : 'hover:bg-white/10 text-white'} underline w-7 h-7 flex items-center justify-center`}
                      >
                        U
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                        <button 
                          onMouseDown={(e) => e.preventDefault()} 
                          onClick={() => adjustFontSize(-1)} 
                          className="p-0.5 hover:text-[var(--color-accent-notes)] transition-colors"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={fontSizeInput || '16'}
                          onFocus={handleInputFocus}
                          onChange={(e) => handleFontSizeChange(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold w-6 text-center bg-transparent outline-none"
                        />
                        <button 
                          onMouseDown={(e) => e.preventDefault()} 
                          onClick={() => adjustFontSize(1)} 
                          className="p-0.5 hover:text-[var(--color-accent-notes)] transition-colors"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Professional Attachment Blocks - Vertical & Reorderable */}
              <div className="space-y-6 mt-4">
                {newAttachments.map((att, index) => (
                  <motion.div 
                    key={att.id} 
                    layout
                    className="glass rounded-2xl overflow-hidden border border-white/10 group relative shadow-xl"
                  >
                    {/* Block Header/Controls - ALWAYS VISIBLE */}
                    {!isReadOnly && (
                      <div className="absolute top-3 right-3 z-10 flex gap-2">
                        <div className="flex bg-black/60 backdrop-blur-md rounded-xl p-1 border border-white/10">
                          <button 
                            disabled={index === 0}
                            onClick={() => moveAttachment(att.id, 'up')}
                            className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-20 transition-colors"
                          >
                            <ChevronUp className="w-4 h-4 text-white" />
                          </button>
                          <button 
                            disabled={index === newAttachments.length - 1}
                            onClick={() => moveAttachment(att.id, 'down')}
                            className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-20 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <button 
                          onClick={() => setFullscreenImage(att.url)}
                          className="p-2 rounded-xl bg-indigo-500/90 text-white hover:bg-indigo-500 transition-colors shadow-lg backdrop-blur-md"
                          title={t('Full Screen')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => editAttachment(att)}
                          className="p-2 rounded-xl bg-blue-500/90 text-white hover:bg-blue-500 transition-colors shadow-lg backdrop-blur-md"
                          title={t('Edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeAttachment(att.id)}
                          className="p-2 rounded-xl bg-red-500/90 text-white hover:bg-red-500 transition-colors shadow-lg backdrop-blur-md"
                          title={t('Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Block Content */}
                    <div className="p-1">
                      {att.type === 'table' ? (
                        <div className="p-4 overflow-x-auto">
                          <div className="flex items-center gap-2 mb-4">
                            <TableIcon className="w-4 h-4 text-[var(--color-accent-notes)]" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{att.name}</span>
                          </div>
                          <table className="w-full border-collapse">
                            <tbody>
                              {att.tableData?.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-white/5 last:border-0">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border-r border-white/5 last:border-0 p-3 text-sm text-white/80 min-w-[120px]">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : att.type === 'file' ? (
                        <div className="p-8 flex flex-col items-center justify-center bg-white/5 gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-notes)]/10 flex items-center justify-center border border-[var(--color-accent-notes)]/20">
                            <FileText className="w-8 h-8 text-[var(--color-accent-notes)]" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-white/90">{att.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{att.fileType || 'Document'}</p>
                          </div>
                          <button className="mt-2 px-4 py-1.5 rounded-lg glass text-xs font-bold hover:bg-white/10 transition-all">
                            {t('Download File')}
                          </button>
                        </div>
                      ) : (
                        <div className="relative aspect-video sm:aspect-auto">
                          <img 
                            src={att.url} 
                            alt={att.name} 
                            className="w-full h-auto max-h-[500px] object-contain bg-black/20"
                            onClick={() => setFullscreenImage(att.url)}
                          />
                          <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-bold text-white/70">
                            {att.type === 'camera' ? t('Captured Photo') : t('Image Attachment')}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Camera Overlay */}
            <AnimatePresence>
              {showCamera && (
                <div className="fixed inset-0 z-[110] bg-black flex flex-col">
                  <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                    {cameraError ? (
                      <div className="p-6 text-center">
                        <p className="text-red-500 mb-4">{t(cameraError)}</p>
                        <button onClick={stopCamera} className="px-6 py-2 rounded-xl glass text-white">
                          {t('Close')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-10 items-center">
                          <button onClick={stopCamera} className="p-4 rounded-full glass text-white">
                            <X className="w-6 h-6" />
                          </button>
                          <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Drawing Canvas Overlay */}
            {showDrawingCanvas && (
              <DrawingCanvas 
                initialImage={editingAttachment?.type === 'drawing' ? editingAttachment.url : undefined}
                onSave={handleDrawingSave}
                onClose={() => {
                  setShowDrawingCanvas(false);
                  setEditingAttachment(null);
                }}
              />
            )}

            {/* Table Editor Overlay */}
            {showTableEditor && (
              <TableEditor
                initialData={editingAttachment?.tableData}
                onSave={handleTableSave}
                onClose={() => {
                  setShowTableEditor(false);
                  setEditingAttachment(null);
                }}
              />
            )}
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
                    {!hidePassword ? t('Set Password') : isChangingPassword ? t('Change Password') : t('Enter Password')}
                  </h3>
                </div>
                <button onClick={closePasswordModal} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-400 mb-6">
                {!hidePassword 
                  ? t('Create a password to protect your hidden notes. You will need this to view them later.') 
                  : isChangingPassword 
                  ? t('Enter your current password and a new one.')
                  : t('Enter your password to access hidden notes.')}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{isChangingPassword ? t('Current Password') : t('Password')}</label>
                  <input
                    type="password"
                    placeholder={isChangingPassword ? t('Current Password') : t('Password')}
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    className="w-full px-4 py-3 rounded-xl glass outline-none focus:border-[var(--color-accent-notes)] transition-colors text-[var(--text)]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isChangingPassword) handlePasswordSubmit();
                    }}
                  />
                </div>

                {isChangingPassword && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">{t('New Password')}</label>
                    <input
                      type="password"
                      placeholder={t('New Password')}
                      value={newPasswordInput}
                      onChange={e => {
                        setNewPasswordInput(e.target.value);
                        setPasswordError('');
                      }}
                      className="w-full px-4 py-3 rounded-xl glass outline-none focus:border-[var(--color-accent-notes)] transition-colors text-[var(--text)]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePasswordSubmit();
                      }}
                    />
                  </div>
                )}
              </div>
              
              {passwordError && (
                <p className="text-red-500 text-xs mt-2">{t(passwordError)}</p>
              )}

              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={handlePasswordSubmit}
                  className="w-full py-3 rounded-xl bg-[var(--color-accent-notes)] text-white font-medium shadow-lg transition-transform active:scale-95"
                >
                  {!hidePassword ? t('Set Password & Continue') : isChangingPassword ? t('Update Password') : t('Unlock')}
                </button>

                {hidePassword && !isChangingPassword && (
                  <div className="flex justify-between mt-2">
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="text-xs text-[var(--color-accent-notes)] hover:underline"
                    >
                      {t('Change Password')}
                    </button>
                    <button 
                      onClick={() => setShowResetConfirm(true)}
                      className="text-xs text-red-500/70 hover:underline"
                    >
                      {t('Forgot Password?')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--card)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('Reset Password?')}</h3>
              <p className="text-sm text-gray-400 mb-6">
                {t('Are you sure you want to reset your password? This will unhide all hidden notes.')}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl glass text-white font-medium"
                >
                  {t('Cancel')}
                </button>
                <button 
                  onClick={handleResetPassword}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium shadow-lg shadow-red-500/20"
                >
                  {t('Reset')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Preview */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullscreenImage} 
              alt="Fullscreen" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
