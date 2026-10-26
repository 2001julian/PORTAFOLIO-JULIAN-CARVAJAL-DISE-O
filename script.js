// ---------- Idioma ----------
// Prioridad: ?lang= en la URL, luego el idioma guardado, luego español.
const LANGS = ['es', 'en', 'pt'];

const getSavedLang = () => {
  try {
    return localStorage.getItem('lang');
  } catch (e) {
    return null;
  }
};

const urlLang = new URLSearchParams(location.search).get('lang');
const currentLang = [urlLang, getSavedLang()].find((l) => LANGS.includes(l)) || 'es';

const t = (key) => translations[currentLang][key] ?? translations.es[key] ?? '';

// Se aplica de inmediato (el script está al final del body) para evitar parpadeos
document.documentElement.lang = currentLang;
document.title = t('title');
document.querySelectorAll('[data-i18n]').forEach((el) => {
  el.innerHTML = t(el.dataset.i18n);
});
document.querySelector('.lang-current').textContent = currentLang.toUpperCase();

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Menú desplegable de idioma ----------
  const langSwitch = document.querySelector('.lang-switch');
  const langBtn = langSwitch.querySelector('.lang-btn');

  const setLangMenu = (open) => {
    langSwitch.classList.toggle('open', open);
    langBtn.setAttribute('aria-expanded', open);
  };

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setLangMenu(!langSwitch.classList.contains('open'));
  });

  document.addEventListener('click', () => setLangMenu(false));

  langSwitch.querySelectorAll('[data-lang]').forEach((option) => {
    option.classList.toggle('active', option.dataset.lang === currentLang);
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      try {
        localStorage.setItem('lang', lang);
      } catch (e) { /* sin almacenamiento: la URL basta */ }

      // Recarga la página en el idioma elegido
      const url = new URL(location.href);
      url.searchParams.set('lang', lang);
      url.hash = '';
      location.href = url.toString();
    });
  });

  // ---------- Efecto de difuminado (fade) al hacer scroll ----------
  const overlay = document.querySelector('.scroll-fade-overlay');
  const nav = document.querySelector('nav');

  const updateFade = () => {
    const scrollY = window.scrollY;
    // Llega a su máxima intensidad tras bajar una pantalla
    const progress = Math.min(scrollY / window.innerHeight, 1);

    if (overlay) overlay.style.opacity = progress;
    nav.classList.toggle('scrolled', scrollY > 50);
  };

  window.addEventListener('scroll', updateFade, { passive: true });
  window.addEventListener('resize', updateFade);
  updateFade();

  // ---------- Aparición de elementos desde el negro ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ---------- Menú: link activo según la sección ----------
  const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      menuLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

  // ---------- Menú móvil ----------
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');

  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open);
  };

  menuToggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  // ---------- Filtros de proyectos ----------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projects = [...document.querySelectorAll('.project')];

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((b) => b.classList.toggle('active', b === button));
      projects.forEach((project) => {
        const show = filter === 'all' || project.dataset.category === filter;
        project.classList.toggle('hidden', !show);
        if (show) project.classList.add('visible');
      });
    });
  });

  // ---------- Modal de proyecto ----------
  const modal = document.getElementById('project-modal');
  const modalImage = modal.querySelector('.modal-image');
  const modalTags = modal.querySelector('.modal-tags');
  const modalTitle = modal.querySelector('#modal-title');
  const modalDesc = modal.querySelector('.modal-desc');
  let currentIndex = 0;

  // Solo se navega entre los proyectos visibles con el filtro actual
  const visibleProjects = () => projects.filter((p) => !p.classList.contains('hidden'));

  const showProject = (project) => {
    currentIndex = visibleProjects().indexOf(project);
    modalImage.textContent = project.querySelector('.project-image').textContent.trim();
    modalTags.innerHTML = t(project.dataset.id + '.tags');
    modalTitle.innerHTML = t(project.dataset.id + '.title');
    modalDesc.innerHTML = t(project.dataset.id + '.desc');
  };

  const openModal = (project) => {
    showProject(project);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  const step = (dir) => {
    const list = visibleProjects();
    showProject(list[(currentIndex + dir + list.length) % list.length]);
  };

  projects.forEach((project) => project.addEventListener('click', () => openModal(project)));
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
  modal.querySelector('.modal-prev').addEventListener('click', () => step(-1));
  modal.querySelector('.modal-next').addEventListener('click', () => step(1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setLangMenu(false);
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
});
