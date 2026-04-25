# Super Private Dashboard

A fully offline-capable personal dashboard with drag-and-drop widgets, glassmorphism design, and localStorage persistence. Built with vanilla JavaScript, TailwindCSS, and SortableJS.

## Features

- **Drag & Drop**: Rearrange widgets freely using SortableJS
- **Dark/Light Theme**: Toggle between themes with CSS variables
- **10 Built-in Widgets**:
  - **Todo List** - Track tasks with add, toggle, edit, delete
  - **Quick Note** - Markdown-free notepad with auto-save
  - **Clock** - Live time and date display
  - **Weather** - Current weather via Open-Meteo API (no API key needed)
  - **Calculator** - Basic arithmetic calculator
  - **Pomodoro Timer** - Focus timer with 25/5 minute cycles
  - **Bookmarks** - Save and organize links with favicons
  - **Habit Tracker** - Track daily habits over 7 days
  - **Crypto Prices** - Live prices via CoinGecko API
  - **AI Chat** - Chat with OpenAI GPT (requires API key)
- **Glassmorphism UI**: Frosted glass cards with smooth animations
- **Responsive**: 4-column desktop, 2-column tablet, 1-column mobile
- **Encryption**: Optional AES-GCM encryption for localStorage data
- **XSS Protection**: Input sanitization throughout
- **Offline-first**: All data stored in localStorage

## Quick Start

Simply open `index.html` in any modern browser. No build step required.

```bash
# Or serve locally
npx serve .
# Or
python3 -m http.server 8080
```

## Architecture

```
index.html          - Main HTML with Tailwind CDN + SortableJS
css/style.css       - Custom styles, theme variables, animations
js/
  app.js            - Entry point, event bindings, modal logic
  core/
    state.js        - State management (layout, widgetData, localStorage)
    storage.js      - localStorage helpers with encryption support
    grid.js         - Dashboard rendering, SortableJS integration
    theme.js        - Dark/light theme toggle
    registry.js     - Widget registry pattern
  utils/
    debounce.js     - Debounce utility
    toast.js        - Toast notification system
    sanitize.js     - XSS sanitization
    fetchRetry.js   - Fetch with retry and timeout
    crypto.js       - Web Crypto API (PBKDF2 + AES-GCM)
  widgets/
    todo.js         - Todo list widget
    note.js         - Quick note widget
    clock.js        - Clock widget
    weather.js      - Weather widget
    calculator.js   - Calculator widget
    pomodoro.js     - Pomodoro timer widget
    bookmark.js     - Bookmarks widget
    habit.js        - Habit tracker widget
    cryptoWidget.js - Crypto prices widget
    aichat.js       - AI chat widget
```

## Adding Custom Widgets

Register a new widget in `js/widgets/mywidget.js`:

```js
import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';

registerWidget('mywidget', {
  name: 'My Widget',
  icon: '<svg>...</svg>',
  description: 'Description here',
  defaultData: {},
  create: (container, widgetId) => { /* render widget */ },
  destroy: (widgetId) => { /* cleanup */ },
});
```

Then import it in `js/app.js`:
```js
import './widgets/mywidget.js';
```

## Tech Stack

- **HTML5** + **TailwindCSS** (CDN)
- **Vanilla JavaScript** (ES Modules)
- **SortableJS** for drag-and-drop
- **Web Crypto API** for encryption
- **localStorage** for persistence
