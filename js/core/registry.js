const widgetRegistry = {};

export function registerWidget(type, config) {
  widgetRegistry[type] = config;
}

export function getWidgetConfig(type) {
  return widgetRegistry[type] || null;
}

export function getAllWidgetTypes() {
  return Object.entries(widgetRegistry).map(([type, cfg]) => ({
    type,
    name: cfg.name,
    icon: cfg.icon,
    description: cfg.description || '',
  }));
}

export { widgetRegistry };
