import {
  WidgetEditor,
  CustomEventHandler,
} from '@wix/bob-widget-services/dist/src/types/editorTypes';
import {
  ControllerStageDataManifest,
  ExportsManifest,
  EditorSDK,
} from '@wix/platform-editor-sdk';
import { panelUrlBuilder } from '../../utils/editor';
import { MEMBER_KIND } from '../../types/types';
import variationPresets from './variations.json';
import { id as widgetId } from './.component.json';

const SETTINGS_EV_ID = `${widgetId}:settings`;

function openSpeakerSettingsPanel(editorSDK: EditorSDK, { componentRef }: any) {
  editorSDK.editor.openComponentPanel('token', {
    title: 'Speakers Settings',
    url: panelUrlBuilder(editorSDK, componentRef, 'speakers'),
    height: 440,
    componentRef,
  });
}

const widgetEventsHandler: CustomEventHandler = {
  widgetGfppClicked: {
    [SETTINGS_EV_ID]: (payload, editorSDK) =>
      openSpeakerSettingsPanel(editorSDK, payload),
  },
};

const widgetStageData: ControllerStageDataManifest = {
  [widgetId]: {
    default: {
      gfpp: {
        desktop: {
          mainAction1: {
            actionId: SETTINGS_EV_ID,
            label: 'Settings',
          },
          iconButtons: {},
        },
        mobile: {
          iconButtons: {},
        },
      },
      connections: {
        '*': {
          behavior: {
            dataEditOptions: 'TEXT_STYLE_ONLY',
          },
        },
        profileImage: {
          displayName: 'Speaker Photo',
        },
        name: {
          displayName: 'Speaker Name',
        },
        title: {
          displayName: 'Speaker Job title',
        },
        description: {
          displayName: 'Speaker Bio',
        },
      },
      displayName: 'Speakers',
      nickname: 'speakers',
    },
  },
};

const widgetExports: ExportsManifest = {
  [widgetId]: {
    inherits: {},
    members: {
      filterType: {
        description: 'Type of filter to be used (tag | all)',
        kind: MEMBER_KIND,
      },
      filteredTags: {
        description: 'which tags should be shown',
        kind: MEMBER_KIND,
      },
      sortingType: {
        description: 'How the speakers should be sorted',
        kind: MEMBER_KIND,
      },
    },
  },
};

function createWidget(): WidgetEditor {
  return {
    type: widgetId,
    getEventHandlers() {
      return widgetEventsHandler;
    },
    getStageData() {
      return widgetStageData;
    },
    getExports() {
      return widgetExports;
    },
    getVariations() {
      return {
        variations: variationPresets,
        options: {
          presetsPanelTitle: 'Change speakers layout',
        },
      };
    },
  };
}

export default createWidget();
