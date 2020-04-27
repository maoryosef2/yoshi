import { WixSelector } from '@wix/bob-widget-services/dist/src/types/viewerTypes';
import { LINKS } from '../constants';

export function bindSocialLinksButtons($w: WixSelector, location: any) {
  LINKS.forEach(({ el, link }) => {
    $w(`#${el}`).onClick(() => {
      location.to(link);
    });
  });
}
