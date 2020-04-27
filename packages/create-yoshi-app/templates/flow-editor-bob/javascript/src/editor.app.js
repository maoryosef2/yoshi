import { editorScriptBuilder } from '@wix/bob-widget-services';
import createAppAPI from './editor/appAPI';
import speakersWidget from './components/speakers/editor.controller';

const TOKEN = 'token';

async function editorReady(editorSDK) {
  await editorSDK.editor.setAppAPI(TOKEN, createAppAPI(editorSDK, TOKEN));
}

const appManifest = {
  pages: {
    applicationSettings: {
      default: {
        displayName: 'BoB Bootstrap',
      },
    },
  },
};

export default editorScriptBuilder()
  .withEditorReady(editorReady)
  .withAppManifest(appManifest)
  .withWidget(speakersWidget)
  .build();
