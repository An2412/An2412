const widgetRegistry = {};

export function registerWidget(type, config) {
  widgetRegistry[type] = config;
}

export function getWidgetConfig(type) {
  return widgetRegistry[type] || null;
}

const EMOJI_MAP = {
  todo: '✅', note: '📝', clock: '🕐', weather: '🌤️',
  calculator: '🧮', pomodoro: '⏱️', bookmark: '🔖',
  habit: '📊', crypto: '💰', aichat: '🤖',
};

export function getAllWidgetTypes() {
  return Object.entries(widgetRegistry).map(([type, cfg]) => ({
    type,
    name: cfg.name,
    icon: cfg.icon,
    emoji: EMOJI_MAP[type] || '📦',
    description: cfg.description || '',
  }));
}

export { widgetRegistry };
