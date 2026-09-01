// Efecto de difuminado (fade) al hacer scroll
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.scroll-fade-overlay');

  if (!overlay) {
    console.warn('No se encontró el elemento .scroll-fade-overlay en el HTML');
    return;
  }

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / (maxScroll * 0.5), 1);

    overlay.style.opacity = progress;
  });
});
