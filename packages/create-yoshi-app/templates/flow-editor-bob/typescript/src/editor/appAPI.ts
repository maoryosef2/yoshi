import { createWidgetAPI, WidgetEditorAPI } from '@wix/bob-widget-services';
import { EditorSDK } from '@wix/platform-editor-sdk';
import { getTags } from '../services/conferenceDataService';

export interface EditorAppAPI extends WidgetEditorAPI {
  getTags: () => Promise<Record<string, string>>;
  openDashboard: () => Promise<any>;
}

function createAppAPI(editorSDK: EditorSDK, token: string): EditorAppAPI {
  const widgetAPI = createWidgetAPI(editorSDK, token);

  const openDashboard = () =>
    editorSDK.editor.openDashboardPanel('token', {
      url: 'conferencer-bob',
      closeOtherPanels: true,
    });

  return {
    ...widgetAPI,
    getTags,
    openDashboard,
  };
}

export default createAppAPI;
