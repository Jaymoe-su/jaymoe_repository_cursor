"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

// Types
interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

interface Window {
  id: string;
  type: 'note' | 'canvas';
  title: string;
  position: WindowPosition;
}

interface NoteData {
  id: string;
  content: string;
  lastModified: number;
}

interface CanvasData {
  id: string;
  data: string; // base64 image data
  lastModified: number;
}

export default function NotedOSPrototype() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [notes, setNotes] = useState<Record<string, NoteData>>({});
  const [canvasData, setCanvasData] = useState<Record<string, CanvasData>>({});
  
  const dragStateRef = useRef<{
    windowId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    isResizing: boolean;
    resizeHandle: string;
  } | null>(null);

  const GRID_SIZE = 20;

  // Load saved data from localStorage
  useEffect(() => {
    const savedWindows = localStorage.getItem('noted-os-windows');
    const savedNotes = localStorage.getItem('noted-os-notes');
    const savedCanvas = localStorage.getItem('noted-os-canvas');
    
    if (savedWindows) {
      try {
        const parsed = JSON.parse(savedWindows);
        setWindows(parsed);
        // Set the highest z-index window as active
        if (parsed.length > 0) {
          const topWindow = parsed.reduce((prev: Window, curr: Window) => 
            curr.position.zIndex > prev.position.zIndex ? curr : prev
          );
          setActiveWindowId(topWindow.id);
        }
      } catch (e) {
        console.error('Failed to load windows:', e);
      }
    }

    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }

    if (savedCanvas) {
      try {
        setCanvasData(JSON.parse(savedCanvas));
      } catch (e) {
        console.error('Failed to load canvas:', e);
      }
    }
  }, []);

  // Save windows to localStorage
  useEffect(() => {
    if (windows.length > 0) {
      localStorage.setItem('noted-os-windows', JSON.stringify(windows));
    }
  }, [windows]);

  // Save notes to localStorage
  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem('noted-os-notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Save canvas to localStorage
  useEffect(() => {
    if (Object.keys(canvasData).length > 0) {
      localStorage.setItem('noted-os-canvas', JSON.stringify(canvasData));
    }
  }, [canvasData]);

  const snapToGridValue = (value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const bringToFront = (windowId: string) => {
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.position.zIndex), 0);
      return prev.map(w => 
        w.id === windowId ? { ...w, position: { ...w.position, zIndex: maxZ + 1 } } : w
      );
    });
    setActiveWindowId(windowId);
  };

  const handleMouseDown = (e: React.MouseEvent, windowId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    bringToFront(windowId);

    const isResizing = !!handle;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = window.position.x;
    const initialY = window.position.y;
    const initialWidth = window.position.width;
    const initialHeight = window.position.height;

    dragStateRef.current = {
      windowId,
      startX,
      startY,
      initialX,
      initialY,
      isResizing,
      resizeHandle: handle || '',
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return;

      const { windowId, startX, startY, initialX, initialY, isResizing, resizeHandle } = dragStateRef.current;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setWindows(prev => {
        const window = prev.find(w => w.id === windowId);
        if (!window) return prev;

        if (isResizing) {
          let newWidth = initialWidth;
          let newHeight = initialHeight;
          let newX = initialX;
          let newY = initialY;

          if (resizeHandle.includes('right')) {
            newWidth = Math.max(300, initialWidth + deltaX);
          }
          if (resizeHandle.includes('left')) {
            const newWidthVal = Math.max(300, initialWidth - deltaX);
            newX = snapToGridValue(initialX + (initialWidth - newWidthVal));
            newWidth = newWidthVal;
          }
          if (resizeHandle.includes('bottom')) {
            newHeight = Math.max(200, initialHeight + deltaY);
          }
          if (resizeHandle.includes('top')) {
            const newHeightVal = Math.max(200, initialHeight - deltaY);
            newY = snapToGridValue(initialY + (initialHeight - newHeightVal));
            newHeight = newHeightVal;
          }

          return prev.map(w => 
            w.id === windowId 
              ? { 
                  ...w, 
                  position: { 
                    ...w.position, 
                    x: snapToGridValue(newX),
                    y: snapToGridValue(newY),
                    width: snapToGridValue(newWidth),
                    height: snapToGridValue(newHeight),
                  } 
                } 
              : w
          );
        } else {
          // Dragging
          const newX = snapToGridValue(initialX + deltaX);
          const newY = snapToGridValue(initialY + deltaY);
          
          return prev.map(w => 
            w.id === windowId 
              ? { 
                  ...w, 
                  position: { 
                    ...w.position, 
                    x: newX,
                    y: newY,
                  } 
                } 
              : w
          );
        }
      });
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const createWindow = (type: 'note' | 'canvas') => {
    const id = `${type}-${Date.now()}`;
    const newWindow: Window = {
      id,
      type,
      title: type === 'note' ? 'New Note' : 'New Canvas',
      position: {
        x: 100 + windows.length * 30,
        y: 100 + windows.length * 30,
        width: type === 'note' ? 500 : 600,
        height: type === 'note' ? 400 : 500,
        minimized: false,
        maximized: false,
        zIndex: Math.max(...windows.map(w => w.position.zIndex), 0) + 1,
      },
    };

    if (type === 'note') {
      setNotes(prev => ({
        ...prev,
        [id]: { id, content: '', lastModified: Date.now() },
      }));
    } else {
      setCanvasData(prev => ({
        ...prev,
        [id]: { id, data: '', lastModified: Date.now() },
      }));
    }

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(id);
  };

  const closeWindow = (windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    setActiveWindowId(prev => prev === windowId ? null : prev);
  };

  const minimizeWindow = (windowId: string) => {
    setWindows(prev => 
      prev.map(w => 
        w.id === windowId 
          ? { ...w, position: { ...w.position, minimized: !w.position.minimized } }
          : w
      )
    );
  };

  const maximizeWindow = (windowId: string) => {
    setWindows(prev => 
      prev.map(w => {
        if (w.id !== windowId) return w;
        const isMaximized = w.position.maximized;
        return {
          ...w,
          position: {
            ...w.position,
            maximized: !isMaximized,
            ...(isMaximized ? {} : {
              x: 0,
              y: 0,
              width: typeof window !== 'undefined' ? window.innerWidth : 1200,
              height: typeof window !== 'undefined' ? window.innerHeight - 60 : 800,
            }),
          },
        };
      })
    );
  };

  const updateWindowTitle = (windowId: string, title: string) => {
    setWindows(prev => 
      prev.map(w => w.id === windowId ? { ...w, title } : w)
    );
  };

  const updateNoteContent = (windowId: string, content: string) => {
    setNotes(prev => ({
      ...prev,
      [windowId]: {
        id: windowId,
        content,
        lastModified: Date.now(),
      },
    }));

    // Update window title from first line
    const firstLine = content.split('\n')[0].trim();
    const title = firstLine || 'New Note';
    updateWindowTitle(windowId, title.length > 30 ? title.substring(0, 30) + '...' : title);
  };

  const updateCanvasData = (windowId: string, data: string) => {
    setCanvasData(prev => ({
      ...prev,
      [windowId]: {
        id: windowId,
        data,
        lastModified: Date.now(),
      },
    }));
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>☜</Link>
      
      <div className={styles.desktop}>
        <div className={styles.toolbar}>
          <button 
            className={styles.toolbarButton}
            onClick={() => createWindow('note')}
          >
            + New Note
          </button>
          <button 
            className={styles.toolbarButton}
            onClick={() => createWindow('canvas')}
          >
            + New Canvas
          </button>
          <label className={styles.toolbarCheckbox}>
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
            Snap to Grid
          </label>
        </div>

        {windows.map(window => (
          <WindowComponent
            key={window.id}
            window={window}
            isActive={activeWindowId === window.id}
            onMouseDown={handleMouseDown}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onMaximize={maximizeWindow}
            onBringToFront={bringToFront}
            noteContent={window.type === 'note' ? notes[window.id]?.content || '' : ''}
            onNoteContentChange={(content) => updateNoteContent(window.id, content)}
            canvasData={window.type === 'canvas' ? canvasData[window.id]?.data || '' : ''}
            onCanvasDataChange={(data) => updateCanvasData(window.id, data)}
          />
        ))}
      </div>
    </div>
  );
}

// Window Component
interface WindowComponentProps {
  window: Window;
  isActive: boolean;
  onMouseDown: (e: React.MouseEvent, windowId: string, handle?: string) => void;
  onClose: (windowId: string) => void;
  onMinimize: (windowId: string) => void;
  onMaximize: (windowId: string) => void;
  onBringToFront: (windowId: string) => void;
  noteContent: string;
  onNoteContentChange: (content: string) => void;
  canvasData: string;
  onCanvasDataChange: (data: string) => void;
}

function WindowComponent({
  window,
  isActive,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  onBringToFront,
  noteContent,
  onNoteContentChange,
  canvasData,
  onCanvasDataChange,
}: WindowComponentProps) {
  const noteEditorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const canvasHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const [strokeColor, setStrokeColor] = useState('#00ff00');
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Define saveCanvasState before it's used
  const saveCanvasState = useCallback(() => {
    if (canvasRef.current) {
      const data = canvasRef.current.toDataURL();
      canvasHistoryRef.current = canvasHistoryRef.current.slice(0, historyIndexRef.current + 1);
      canvasHistoryRef.current.push(data);
      historyIndexRef.current = canvasHistoryRef.current.length - 1;
      
      // Limit history to 50 states
      if (canvasHistoryRef.current.length > 50) {
        canvasHistoryRef.current.shift();
        historyIndexRef.current--;
      }
      
      onCanvasDataChange(data);
    }
  }, [onCanvasDataChange]);

  // Initialize canvas
  useEffect(() => {
    if (window.type === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = window.position.width - 40;
      canvas.height = window.position.height - 100;

      // Load saved canvas data
      if (canvasData) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          saveCanvasState();
        };
        img.src = canvasData;
      } else {
        // Initialize with transparent/white background for neon green drawing
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveCanvasState();
      }
    }
  }, [window.type, window.position.width, window.position.height, canvasData, saveCanvasState]);

  // Update canvas size when window resizes
  useEffect(() => {
    if (window.type === 'canvas' && canvasRef.current && !window.position.minimized) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentData = canvas.toDataURL();
      canvas.width = window.position.width - 40;
      canvas.height = window.position.height - 100;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = currentData;
    }
  }, [window.position.width, window.position.height, window.position.minimized, window.type]);

  const undo = () => {
    if (historyIndexRef.current > 0 && canvasRef.current) {
      historyIndexRef.current--;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0);
          onCanvasDataChange(canvasRef.current!.toDataURL());
        };
        img.src = canvasHistoryRef.current[historyIndexRef.current];
      }
    }
  };

  const redo = () => {
    if (historyIndexRef.current < canvasHistoryRef.current.length - 1 && canvasRef.current) {
      historyIndexRef.current++;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0);
          onCanvasDataChange(canvasRef.current!.toDataURL());
        };
        img.src = canvasHistoryRef.current[historyIndexRef.current];
      }
    }
  };

  const exportCanvas = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `noted-os-canvas-${window.id}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastPointRef.current = { x, y };
    
    // Set drawing properties
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw initial point
    ctx.beginPath();
    ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set drawing properties
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';

    // Draw smooth line from last point to current point
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Update last point for next move
    lastPointRef.current = { x, y };
  };

  const handleCanvasMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      saveCanvasState();
    }
  };

  // Auto-save note content
  const noteSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleNoteChange = (content: string) => {
    onNoteContentChange(content);
    
    if (noteSaveTimeoutRef.current) {
      clearTimeout(noteSaveTimeoutRef.current);
    }
    
    noteSaveTimeoutRef.current = setTimeout(() => {
      // Auto-save is handled by the parent component's useEffect
    }, 500);
  };

  if (window.position.minimized) {
    return (
      <div
        className={`${styles.window} ${styles.minimized} ${isActive ? styles.active : ''}`}
        style={{
          left: `${window.position.x}px`,
          top: `${window.position.y}px`,
          zIndex: window.position.zIndex,
        }}
        onClick={() => onBringToFront(window.id)}
      >
        <div className={styles.windowTitleBar}>
          <span className={styles.windowTitle}>{window.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.window} ${isActive ? styles.active : ''}`}
      style={{
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        width: `${window.position.width}px`,
        height: `${window.position.height}px`,
        zIndex: window.position.zIndex,
      }}
      onClick={() => onBringToFront(window.id)}
    >
      {/* Resize handles */}
      <div
        className={styles.resizeHandle}
        style={{ top: 0, left: 0, cursor: 'nwse-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'top-left')}
      />
      <div
        className={styles.resizeHandle}
        style={{ top: 0, right: 0, cursor: 'nesw-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'top-right')}
      />
      <div
        className={styles.resizeHandle}
        style={{ bottom: 0, left: 0, cursor: 'nesw-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'bottom-left')}
      />
      <div
        className={styles.resizeHandle}
        style={{ bottom: 0, right: 0, cursor: 'nwse-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'bottom-right')}
      />
      <div
        className={styles.resizeHandle}
        style={{ top: 0, left: '10px', right: '10px', cursor: 'ns-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'top')}
      />
      <div
        className={styles.resizeHandle}
        style={{ bottom: 0, left: '10px', right: '10px', cursor: 'ns-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'bottom')}
      />
      <div
        className={styles.resizeHandle}
        style={{ left: 0, top: '30px', bottom: '10px', cursor: 'ew-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'left')}
      />
      <div
        className={styles.resizeHandle}
        style={{ right: 0, top: '30px', bottom: '10px', cursor: 'ew-resize' }}
        onMouseDown={(e) => onMouseDown(e, window.id, 'right')}
      />

      {/* Title bar */}
      <div
        className={styles.windowTitleBar}
        onMouseDown={(e) => onMouseDown(e, window.id)}
      >
        <span className={styles.windowTitle}>{window.title}</span>
        <div className={styles.windowControls}>
          <button
            className={styles.windowButton}
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(window.id);
            }}
            title="Minimize"
          >
            −
          </button>
          <button
            className={styles.windowButton}
            onClick={(e) => {
              e.stopPropagation();
              onMaximize(window.id);
            }}
            title="Maximize"
          >
            □
          </button>
          <button
            className={`${styles.windowButton} ${styles.closeButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onClose(window.id);
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window content */}
      <div className={styles.windowContent}>
        {window.type === 'note' ? (
          <TextNoteEditor
            ref={noteEditorRef}
            content={noteContent}
            onChange={handleNoteChange}
          />
        ) : (
          <DrawingCanvas
            ref={canvasRef}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            onStrokeColorChange={setStrokeColor}
            onStrokeWidthChange={setStrokeWidth}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onUndo={undo}
            onRedo={redo}
            onExport={exportCanvas}
            canUndo={historyIndexRef.current > 0}
            canRedo={historyIndexRef.current < canvasHistoryRef.current.length - 1}
          />
        )}
      </div>
    </div>
  );
}

// Text Note Editor Component
interface TextNoteEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TextNoteEditor = React.forwardRef<HTMLDivElement, TextNoteEditorProps>(
  ({ content, onChange }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (editorRef.current && editorRef.current.textContent !== content) {
        editorRef.current.textContent = content;
      }
    }, [content]);

    const handleInput = () => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML || editorRef.current.textContent || '';
        onChange(newContent);
      }
    };

    const execCommand = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        editorRef.current.focus();
        handleInput();
      }
    };

    return (
      <div className={styles.textEditor}>
        <div className={styles.toolbar}>
          <button
            className={styles.toolbarBtn}
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => execCommand('formatBlock', 'h1')}
            title="Heading 1"
          >
            H1
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => execCommand('formatBlock', 'h2')}
            title="Heading 2"
          >
            H2
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            •
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
          >
            1.
          </button>
        </div>
        <div
          ref={editorRef}
          className={styles.textEditorContent}
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning
        />
      </div>
    );
  }
);

TextNoteEditor.displayName = 'TextNoteEditor';

// Drawing Canvas Component
interface DrawingCanvasProps {
  strokeColor: string;
  strokeWidth: number;
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DrawingCanvas = React.forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({
    strokeColor,
    strokeWidth,
    onStrokeColorChange,
    onStrokeWidthChange,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onUndo,
    onRedo,
    onExport,
    canUndo,
    canRedo,
  }, ref) => {
    return (
      <div className={styles.canvasEditor}>
        <div className={styles.canvasToolbar}>
          <div className={styles.canvasToolGroup}>
            <label>Color:</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => onStrokeColorChange(e.target.value)}
              className={styles.colorInput}
            />
          </div>
          <div className={styles.canvasToolGroup}>
            <label>Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className={styles.widthSlider}
            />
            <span>{strokeWidth}px</span>
          </div>
          <button
            className={styles.canvasBtn}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↶
          </button>
          <button
            className={styles.canvasBtn}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↷
          </button>
          <button
            className={styles.canvasBtn}
            onClick={onExport}
            title="Export"
          >
            ⬇
          </button>
        </div>
        <canvas
          ref={ref}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className={styles.canvas}
        />
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
