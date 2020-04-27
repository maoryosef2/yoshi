import { LINKS } from '../constants';

export function bindSocialLinksButtons($w, location) {
  LINKS.forEach(({ el, link }) => {
    $w(`#${el}`).onClick(() => {
      location.to(link);
    });
  });
}
