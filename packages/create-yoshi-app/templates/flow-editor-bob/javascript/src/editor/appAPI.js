import { createWidgetAPI } from '@wix/bob-widget-services';
import { getTags } from '../services/conferenceDataService';

function createAppAPI(editorSDK, token) {
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
