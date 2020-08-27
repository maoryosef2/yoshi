// @ts-nocheck
import Template from 'webpack/lib/Template';

export class WebWorkerMainTemplatePlugin {
  apply(mainTemplate) {
    const needChunkOnDemandLoadingCode = (chunk) => {
      for (const chunkGroup of chunk.groupsIterable) {
        if (chunkGroup.getNumberOfChildren() > 0) {
          return true;
        }
      }
      return false;
    };
    mainTemplate.hooks.localVars.tap(
      'WebWorkerMainTemplatePlugin',
      (source, chunk) => {
        if (needChunkOnDemandLoadingCode(chunk)) {
          return Template.asString([
            source,
            '',
            '// object to store loaded chunks',
            '// "1" means "already loaded"',
            '// "Promise" is the signal for "already loading"',
            'var installedChunks = {',
            Template.indent(
              chunk.ids.map((id) => `${JSON.stringify(id)}: 1`).join(',\n'),
            ),
            '};',
          ]);
        }
        return source;
      },
    );
    mainTemplate.hooks.requireEnsure.tap(
      'WebWorkerMainTemplatePlugin',
      (_, chunk, hash) => {
        const chunkFilename = mainTemplate.outputOptions.chunkFilename;
        const chunkMaps = chunk.getChunkMaps();
        return Template.asString([
          'promises.push(Promise.resolve().then(function() {',
          Template.indent([
            '// "1" is the signal for "already loaded"',
            'if (installedChunks[chunkId] === 1) return;',
            '// "Promise" is the signal for "already loading"',
            'if(installedChunks[chunkId] instanceof Promise) return installedChunks[chunkId];',
            'if(!installedChunks[chunkId]) {',
            Template.indent([
              'return installedChunks[chunkId] = fetch(' +
                '__webpack_require__.p + ' +
                mainTemplate.getAssetPath(JSON.stringify(chunkFilename), {
                  hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
                  hashWithLength: (length) =>
                    `" + ${mainTemplate.renderCurrentHashCode(
                      hash,
                      length,
                    )} + "`,
                  chunk: {
                    id: '" + chunkId + "',
                    hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
                    hashWithLength(length) {
                      const shortChunkHashMap = Object.create(null);
                      for (const chunkId of Object.keys(chunkMaps.hash)) {
                        if (typeof chunkMaps.hash[chunkId] === 'string') {
                          shortChunkHashMap[chunkId] = chunkMaps.hash[
                            chunkId
                          ].substr(0, length);
                        }
                      }
                      return `" + ${JSON.stringify(
                        shortChunkHashMap,
                      )}[chunkId] + "`;
                    },
                    contentHash: {
                      javascript: `" + ${JSON.stringify(
                        chunkMaps.contentHash.javascript,
                      )}[chunkId] + "`,
                    },
                    contentHashWithLength: {
                      javascript: (length) => {
                        const shortContentHashMap = {};
                        const contentHash = chunkMaps.contentHash.javascript;
                        for (const chunkId of Object.keys(contentHash)) {
                          if (typeof contentHash[chunkId] === 'string') {
                            shortContentHashMap[chunkId] = contentHash[
                              chunkId
                            ].substr(0, length);
                          }
                        }
                        return `" + ${JSON.stringify(
                          shortContentHashMap,
                        )}[chunkId] + "`;
                      },
                    },
                    name: `" + (${JSON.stringify(
                      chunkMaps.name,
                    )}[chunkId]||chunkId) + "`,
                  },
                  contentHashType: 'javascript',
                }) +
                ')',
              Template.indent([
                '.then(function(resp) {',
                Template.indent([
                  'if (!resp.ok) {',
                  Template.indent(
                    "throw new Error('Loading chunk ' + chunkId + ' failed with status ' + resp.status + '(' + resp.statusText + ')');",
                  ),
                  '}',
                  'return resp.text();',
                ]),
                '})',
                '.then(function(moduleContent) {',
                Template.indent([
                  'if (!moduleContent) {',
                  Template.indent(
                    "throw new Error('Loading chunk ' + chunkId + ' failed with empty moduleContent ' + typeof moduleContent);",
                  ),
                  '}',
                  "if (typeof moduleContent !== 'string') {",
                  Template.indent(
                    "throw new Error('Loading chunk ' + chunkId + ' failed with unexpected moduleContent \\n' + moduleContent);",
                  ),
                  '}',
                  'var args = Function("return " + moduleContent)()',
                  'webpackChunkCallback(args[0], args[1])',
                ]),
                '});',
              ]),
            ]),
            '}',
            "throw new Error('Loading chunk ' + chunkId + ' failed with unexpected installedChunk: ' + installedChunks[chunkId]);",
          ]),
          '}));',
        ]);
      },
    );
    mainTemplate.hooks.bootstrap.tap(
      'WebWorkerMainTemplatePlugin',
      (source, chunk, hash) => {
        if (needChunkOnDemandLoadingCode(chunk)) {
          return Template.asString([
            source,
            `function webpackChunkCallback(chunkIds, moreModules) {`,
            Template.indent([
              'for(var moduleId in moreModules) {',
              Template.indent(
                mainTemplate.renderAddModule(
                  hash,
                  chunk,
                  'moduleId',
                  'moreModules[moduleId]',
                ),
              ),
              '}',
              'while(chunkIds.length)',
              Template.indent('installedChunks[chunkIds.pop()] = 1;'),
            ]),
            '};',
          ]);
        }
        return source;
      },
    );
    mainTemplate.hooks.hotBootstrap.tap(
      'WebWorkerMainTemplatePlugin',
      (source, chunk, hash) => {
        const hotUpdateChunkFilename =
          mainTemplate.outputOptions.hotUpdateChunkFilename;
        const hotUpdateMainFilename =
          mainTemplate.outputOptions.hotUpdateMainFilename;
        const hotUpdateFunction = mainTemplate.outputOptions.hotUpdateFunction;
        const globalObject = mainTemplate.outputOptions.globalObject;
        const currentHotUpdateChunkFilename = mainTemplate.getAssetPath(
          JSON.stringify(hotUpdateChunkFilename),
          {
            hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
            hashWithLength: (length) =>
              `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
            chunk: {
              id: '" + chunkId + "',
            },
          },
        );
        const currentHotUpdateMainFilename = mainTemplate.getAssetPath(
          JSON.stringify(hotUpdateMainFilename),
          {
            hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
            hashWithLength: (length) =>
              `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
          },
        );

        return (
          source +
          '\n' +
          `var parentHotUpdateCallback = ${globalObject}[${JSON.stringify(
            hotUpdateFunction,
          )}];\n` +
          `${globalObject}[${JSON.stringify(hotUpdateFunction)}] = ` +
          Template.getFunctionContent(
            require('webpack/lib/webworker/WebWorkerMainTemplate.runtime'),
          )
            .replace(/\/\/\$semicolon/g, ';')
            .replace(/\$require\$/g, mainTemplate.requireFn)
            .replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename)
            .replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename)
            .replace(/\$hash\$/g, JSON.stringify(hash))
        );
      },
    );
    mainTemplate.hooks.hash.tap('WebWorkerMainTemplatePlugin', (hash) => {
      hash.update('webworker');
      hash.update('4');
    });
  }
}
