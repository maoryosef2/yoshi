import _ from 'lodash';
import { widgetScriptBuilder } from '@wix/bob-widget-services';
import { getSpeakersList } from '../../services/conferenceDataService';
import { bindSocialLinksButtons } from '../../utils/viewer';
import * as hoverVariation from './hover.variation';

const DEFAULT_PROPS = {
  filterType: 'all',
  sortingType: 'abc',
  filteredTags: [],
};

async function updateSpeakers($w, $widget) {
  const filter =
    $widget.props.filterType === 'tag' ? $widget.props.filteredTags : null;
  const sort = $widget.props.sortingType === 'abc';

  const speakersResponse = await getSpeakersList(filter, sort);

  if (!speakersResponse || speakersResponse.length === 0) {
    $w('#statebox1').changeState('NoSpeakers');
    return;
  }

  $w('#statebox1').changeState('SpeakersList');

  const speakers = speakersResponse.map(({ id, name, ...speaker }) => ({
    _id: id,
    name: name.toUpperCase(),
    ...speaker,
  }));

  $w('#speakersList').data = speakers;
}

function createWidget(config, $w, $widget, wixCodeApi) {
  const onPropsChanged = (oldProps, newProps) => {
    if (!_.isEqual(oldProps, newProps)) {
      updateSpeakers($w, $widget);
    }
  };

  $widget.onPropsChanged(onPropsChanged);

  return {
    pageReady: async () => {
      $w('#socialMediaContainer').show();

      $w('#speakersList').onItemReady(($item, itemData) => {
        $item('#name').text = itemData.name;
        $item('#title').text = itemData.title;
        $item('#description').text = itemData.description;
        $item('#profileImage').src = itemData.photoUrl;
        $item('#speaker').onClick(() => {
          wixCodeApi.location.to(`/speaker/${itemData._id}`);
        });
      });

      bindSocialLinksButtons($w, wixCodeApi.location);

      await updateSpeakers($w, $widget);
    },
  };
}

const speakersViewerController = widgetScriptBuilder()
  .withDefaultProps(DEFAULT_PROPS)
  .withCreateMethod(createWidget)
  .withVariation(hoverVariation)
  .build();

export default ({ controllerConfig }) =>
  speakersViewerController(controllerConfig);
