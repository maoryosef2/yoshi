import { editorScriptBuilder } from '@wix/bob-widget-services';
import { EditorSDK } from '@wix/platform-editor-sdk';
import AppManifest from '@wix/platform-editor-sdk/lib/js/manifest';
import createAppAPI from './editor/appAPI';
import speakersWidget from './components/speakers/editor.controller';

const TOKEN = 'token';

async function editorReady(editorSDK: EditorSDK) {
  await editorSDK.editor.setAppAPI(TOKEN, createAppAPI(editorSDK, TOKEN));
}

const appManifest: AppManifest = {
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
