import {
  WixSelector,
  WidgetAPI,
  WixCodeAPI,
} from '@wix/bob-widget-services/dist/src/types/viewerTypes';

export const variationId = 'x2nxp';

function registerSlideInAnimations($w: WixSelector, animations: any) {
  let $prevItem: WixSelector;

  $w('#speaker').onMouseIn((event: any) => {
    const timeline = animations.timeline();

    const $item = $w.at(event.context);

    if ($prevItem) {
      timeline
        .add(
          $prevItem('#socialMediaContainer'),
          {
            y: -100,
            opacity: 0,
            duration: 250,
          },
          0,
        )
        .add(
          $prevItem('#maskBox'),
          {
            y: 100,
            opacity: 0,
            duration: 250,
          },
          0,
        );
    }

    timeline
      .add(
        $item('#socialMediaContainer'),
        {
          y: 0,
          opacity: 1,
          duration: 250,
        },
        0,
      )
      .add(
        $item('#maskBox'),
        {
          y: 0,
          opacity: 1,
          duration: 250,
        },
        0,
      )
      .play();

    $prevItem = $item;
  });

  $w('#speaker').onMouseOut((event: any) => {
    const timeline = animations.timeline();
    const $item = $w.at(event.context);

    timeline
      .add(
        $item('#socialMediaContainer'),
        {
          y: -100,
          opacity: 0,
          duration: 250,
        },
        0,
      )
      .add(
        $item('#maskBox'),
        {
          y: 100,
          opacity: 0,
          duration: 250,
        },
        0,
      )
      .play();
  });
}

export const onPageReady = (
  $w: WixSelector,
  $widget: WidgetAPI,
  { animations }: WixCodeAPI,
) => {
  $w('#maskBox').hide();
  $w('#socialMediaContainer').hide();

  registerSlideInAnimations($w, animations);
};
