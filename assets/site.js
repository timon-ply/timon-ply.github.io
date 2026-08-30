(() => {
  const languageNames = {
    de: 'German',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    ja: 'Japanese',
  };

  for (const year of document.querySelectorAll('[data-current-year]')) {
    year.textContent = String(new Date().getFullYear());
  }

  for (const picker of document.querySelectorAll('[data-language-picker]')) {
    const card = picker.closest('[data-app-card]');
    if (!card) continue;

    picker.addEventListener('change', () => {
      const language = picker.value;
      const app = card.dataset.app;
      const languageName = languageNames[language] ?? language.toUpperCase();

      for (const link of card.querySelectorAll('[data-document]')) {
        link.href = `/${app}/${link.dataset.document}.${language}/`;
        const badge = link.querySelector('[data-language-output]');
        if (badge) badge.textContent = language.toUpperCase();

        const title = link.querySelector('strong')?.textContent?.trim();
        if (title) link.setAttribute('aria-label', `${title} — ${languageName}`);
      }

      const status = card.querySelector('[data-language-status]');
      const appName = card.querySelector('h3')?.textContent?.trim() ?? 'App';
      if (status) status.textContent = `${appName} links now open in ${languageName}.`;
    });
  }

  const legalContent = document.querySelector('[data-legal-content]');
  const legalToc = document.querySelector('[data-legal-toc]');
  const tocList = document.querySelector('[data-legal-toc-list]');

  if (legalContent) {
    const pageTitle = document.querySelector('.legal-header h1');
    const duplicateTitle = legalContent.querySelector(':scope > h1:first-child');
    if (pageTitle && duplicateTitle && pageTitle.textContent.trim() === duplicateTitle.textContent.trim()) {
      duplicateTitle.remove();
    }

    const headings = [...legalContent.querySelectorAll('h2')];
    if (!headings.length || !legalToc || !tocList) {
      if (legalToc) legalToc.hidden = true;
    } else {
      const usedIds = new Set();
      for (const [index, heading] of headings.entries()) {
        let id = heading.id || `section-${index + 1}`;
        while (usedIds.has(id)) id = `${id}-${index + 1}`;
        heading.id = id;
        usedIds.add(id);

        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent.trim();
        item.append(link);
        tocList.append(item);
      }

      if (window.matchMedia('(max-width: 760px)').matches) legalToc.open = false;
    }
  }
})();
