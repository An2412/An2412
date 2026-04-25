import { registerWidget } from '../core/registry.js';
import { getWidgetDataById, updateWidgetData } from '../core/state.js';
import { fetchWithRetry } from '../utils/fetchRetry.js';
import { sanitize } from '../utils/sanitize.js';

const intervals = {};

registerWidget('weather', {
  name: 'Weather',
  icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 110-14h.5A5.5 5.5 0 0120 9.5V10a5 5 0 01-2.5 9z"/></svg>',
  description: 'Current weather info',
  defaultData: { city: 'Hanoi' },
  create: createWeather,
  destroy: (id) => { clearInterval(intervals[id]); delete intervals[id]; },
});

function createWeather(container, widgetId) {
  const data = getWidgetDataById(widgetId) || { city: 'Hanoi' };

  container.innerHTML = `
    <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
      <input type="text" class="input" id="weather-city-${widgetId}" placeholder="City name" value="${sanitize(data.city)}" style="font-size:0.85rem;">
      <button class="btn btn-primary btn-sm" id="weather-search-${widgetId}">Go</button>
    </div>
    <div id="weather-result-${widgetId}" style="text-align:center;color:var(--text-secondary);font-size:0.85rem;">Loading...</div>`;

  const fetchWeather = async (city) => {
    const resultEl = document.getElementById(`weather-result-${widgetId}`);
    if (!resultEl) return;
    try {
      const geo = await fetchWithRetry(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      if (!geo.results || !geo.results.length) {
        resultEl.innerHTML = '<p>City not found</p>';
        return;
      }
      const { latitude, longitude, name } = geo.results[0];
      const w = await fetchWithRetry(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const cw = w.current_weather;
      const wmoIcons = { 0: '&#9728;', 1: '&#127780;', 2: '&#9925;', 3: '&#9729;', 45: '&#127787;', 48: '&#127787;',
        51: '&#127782;', 53: '&#127782;', 55: '&#127782;', 61: '&#127783;', 63: '&#127783;', 65: '&#127783;',
        71: '&#127784;', 73: '&#127784;', 75: '&#127784;', 80: '&#127783;', 81: '&#127783;', 82: '&#127783;',
        95: '&#9889;', 96: '&#9889;', 99: '&#9889;' };
      const icon = wmoIcons[cw.weathercode] || '&#127780;';
      resultEl.innerHTML = `
        <div style="font-size:2.5rem;">${icon}</div>
        <div style="font-size:1.5rem;font-weight:700;margin:0.25rem 0;">${cw.temperature}&deg;C</div>
        <div style="font-size:0.8rem;color:var(--text-secondary);">${sanitize(name)} &bull; Wind ${cw.windspeed} km/h</div>`;
      data.city = city;
      updateWidgetData(widgetId, data);
    } catch {
      if (resultEl) resultEl.innerHTML = '<p>Failed to load weather</p>';
    }
  };

  const searchBtn = document.getElementById(`weather-search-${widgetId}`);
  const cityInput = document.getElementById(`weather-city-${widgetId}`);
  searchBtn.addEventListener('click', () => fetchWeather(cityInput.value.trim()));
  cityInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') fetchWeather(cityInput.value.trim()); });

  fetchWeather(data.city);
  intervals[widgetId] = setInterval(() => fetchWeather(data.city), 600000);
}
