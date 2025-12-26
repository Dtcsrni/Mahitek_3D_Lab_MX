/**
 * Desofusca correos en enlaces protegidos.
 */

export function initEmailLinks() {
  const links = document.querySelectorAll('.email-link[data-email-user][data-email-domain]');
  links.forEach(link => {
    const user = link.getAttribute('data-email-user');
    const domain = link.getAttribute('data-email-domain');
    if (!user || !domain) return;
    const email = `${user}@${domain}`;
    link.setAttribute('href', `mailto:${email}`);
    const label = link.getAttribute('data-email-label');
    if (!link.textContent.trim() || label) {
      link.textContent = label || email;
    }
    link.setAttribute('rel', `${link.getAttribute('rel') || ''} nofollow noopener noreferrer`);
  });
}
