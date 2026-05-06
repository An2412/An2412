// 3D Holographic Tilt Cards — Apple Vision Pro style parallax
export function initTilt3D() {
  document.addEventListener('mousemove', (e) => {
    const widgets = document.querySelectorAll('.widget:not(.sortable-drag):not(.removing)');
    widgets.forEach((widget) => {
      const rect = widget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      const maxDist = 600;

      if (dist < maxDist) {
        const intensity = 1 - dist / maxDist;
        const rotateY = dx * 8 * intensity;
        const rotateX = -dy * 8 * intensity;
        const glareX = (dx + 1) / 2 * 100;
        const glareY = (dy + 1) / 2 * 100;

        widget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        widget.style.setProperty('--glare-x', `${glareX}%`);
        widget.style.setProperty('--glare-y', `${glareY}%`);
        widget.style.setProperty('--glare-opacity', `${intensity * 0.15}`);
      } else {
        widget.style.transform = '';
        widget.style.setProperty('--glare-opacity', '0');
      }
    });
  });

  document.addEventListener('mouseleave', () => {
    document.querySelectorAll('.widget').forEach((w) => {
      w.style.transform = '';
      w.style.setProperty('--glare-opacity', '0');
    });
  });
}
