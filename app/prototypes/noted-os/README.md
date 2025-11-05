# Noted OS Prototype

A window-based note-taking app that reimagines digital note-taking through the lens of classic operating system interfaces with a cyberpunk meets 1980s retro arcade visual style.

## Features

### Window Management System
- **Draggable Windows**: Move notes and canvas windows around the screen
- **Resizable Windows**: Adjust window size with corner and edge handles
- **Window Controls**: Minimize, maximize, and close buttons
- **Snap to Grid**: Optional grid snapping for organized layouts
- **Position Persistence**: Windows remember their position between sessions

### Text Notes
- **Rich Text Editing**: Full formatting toolbar with bold, italic, headings, and lists
- **Auto-save**: Automatically saves your notes as you type
- **Dynamic Titles**: Window title updates based on note content
- **Copy/Paste**: Native browser support for text operations

### Drawing Canvas
- **Drawing Tools**: Smooth pen tool with customizable stroke width and color
- **Undo/Redo**: Full history support for drawing operations
- **Export**: Save your drawings as PNG images
- **Auto-save**: Canvas automatically saves your work

## Setup

No additional setup required! This prototype uses native browser APIs:
- Web APIs (localStorage, Canvas API, contentEditable)
- React and Next.js
- CSS Modules for styling

## Usage

1. **Create a Note**: Click "New Note" to create a text note window
2. **Create a Canvas**: Click "New Canvas" to create a drawing window
3. **Move Windows**: Click and drag the window title bar
4. **Resize Windows**: Drag the corners or edges of windows
5. **Edit Text**: Use the toolbar to format your text
6. **Draw**: Click and drag on the canvas to draw
7. **Save**: All changes are automatically saved to your browser's localStorage

## Technical Details

- Built with React and Next.js
- Uses localStorage for data persistence
- Styled with CSS modules featuring cyberpunk/retro arcade aesthetics
- Responsive design that works on different screen sizes

