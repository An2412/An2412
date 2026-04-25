const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (ch) => entityMap[ch]);
}
