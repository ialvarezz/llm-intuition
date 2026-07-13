// single-active-chip filtering; cards opt in via data-tags. No-JS: bar stays hidden, all cards visible.
const bar = document.querySelector('.filters');
if (bar) {
  bar.hidden = false;
  const cards = Array.from(document.querySelectorAll('[data-tags]'));
  const sections = Array.from(document.querySelectorAll('.track-section'));
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    bar.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('on', b === btn));
    const f = btn.dataset.filter;
    cards.forEach((c) => {
      c.style.display = f === 'all' || c.dataset.tags.split(' ').includes(f) ? '' : 'none';
    });
    sections.forEach((s) => {
      s.style.display = cards.some((c) => s.contains(c) && c.style.display !== 'none') ? '' : 'none';
    });
  });
}
