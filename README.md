# Assembly Reality

**A full-featured, web-based assembly language simulator built for real university use.**

Assembly Reality is not just a simple assembly language interpreter. It is a complete simulation environment for learning and writing assembly language, running entirely in the browser with no installation required. It was developed as a bachelor's thesis project at UP FAMNIT and has been actively used by students in a university hardware course.

---

## What it is

Assembly Reality gives you a custom assembly language with 58 keywords, a two-pass assembler, a simulated CPU with registers and interrupts, a graphical display, a keyboard, RAM, a stack, and a professional code editor. All inside a single web page.

The simulator is fast enough to run complex programs, including games written entirely in assembly.

---

## Architecture

The simulator is built around a two-threaded model.

The **User Interface Thread** handles all rendering: the code editor, memory visualizer, register display, I/O panels, and graphical output. It never touches simulation logic.

The **Assembler Thread** is a Web Worker running in the background. It handles tokenization, AST construction, two-pass assembly, machine code execution, interrupt handling, and all CPU state management.

The two threads communicate through **SharedArrayBuffer** for large shared state (RAM, registers, graphics), and through message passing for control signals. This means the interface stays fully responsive regardless of simulation speed.

---

## Features

**Editor**
- Monaco Editor (the editor behind VS Code) with full syntax highlighting and keyword/label autocompletion,
- Multiple editor pages with tab renaming,
- Autosave between sessions,
- Import and export of source code,
- Adjustable font size.

**Simulation**
- Custom 16-bit CPU with registers A, B, C, D (with 8-bit half-register access), IP, SP, and SR,
- 58-keyword instruction set covering arithmetic, logic, control flow, stack, and I/O,
- Register, indirect, direct, and immediate addressing modes,
- Two execution modes: continuous (with adjustable speed) and step-by-step,
- Breakpoint system,
- Keyboard, timer, and graphics interrupt support,
- Detailed error messages for syntax, assemble-time, and runtime errors.

**Visualization**
- RAM visualizer rendered on a 2D Canvas with dirty-cell tracking (only changed cells are redrawn),
- Graphical display rendered via WebGL as a single texture upload per frame,
- Text mode with sprites and bitmap mode,
- Color-coded register highlighting in memory,
- Real-time CPU register and I/O register display.

**Interface**
- Six visual themes: Dark, Light, Classic, Ocean, Forest, Ruby,
- Responsive layout for both desktop and mobile,
- Fullscreen mode,
- Screen recording,
- Progressive Web App (PWA): installable on desktop and mobile.

---

## Technology

| Layer | Technology |
|---|---|
| UI Framework | React |
| Code Editor | Monaco Editor |
| Graphics | WebGL |
| Memory Visualizer | Canvas 2D |
| Concurrency | Web Workers + SharedArrayBuffer |
| State Management | Custom (Manager) |
| Styling | SCSS |
| Build Tool | Vite |
| Distribution | PWA via Service Worker |

---

## The Assembler Pipeline

Source code goes through four stages before execution (Frontend of the Assembler):

1. **Tokenizer**: converts raw text into a typed token sequence using a priority-based pattern matching system.
2. **AST**: builds an abstract syntax tree of statements (instructions, labels, instants).
3. **Observing** *(first pass)*: simulates memory layout to resolve label addresses before any machine code is produced.
4. **Assembling** *(second pass)*: encodes instructions into machine code and writes them to RAM.

Execution is handled by the Backend, which consists of an Executor, an Executable, a Decoder, and a HexCalculator. Instructions are grouped by behavior rather than implemented individually, which keeps the codebase maintainable at scale.

---

## Acknowledgments

Developed as a bachelor's thesis at the **University of Primorska, Faculty of Mathematics, Natural Sciences and Information Technology (UP FAMNIT)**, Koper, Slovenia.

Mentor: **Assist. Prof. Domen Šoberl, PhD**

---

## License

The source code is licensed under the **GNU General Public License v3.0** or newer.
The thesis text and associated materials are licensed under **Creative Commons Attribution-ShareAlike 2.5 Slovenia** or newer.
