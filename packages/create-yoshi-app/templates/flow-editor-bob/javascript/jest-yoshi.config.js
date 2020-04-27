// The purpose of this file is to start your server and possibly additional servers
// like RPC/Petri servers.
//
// Because tests are running in parallel, it should start a different server on a different port
// for every test file (E2E and server tests).
//
// By attaching the server object (testkit result) on `globalObject` it will be available to every
// test file globally by that name.
module.exports = {
  server: {
    command: 'node dist/server.js',
    port: 3100,
  },
  puppeteer: {
    // launch options: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
    // debugging tips: https://github.com/GoogleChrome/puppeteer#debugging-tips
    devtools: false,
    ignoreHTTPSErrors: true,
    args: [
      '--allow-insecure-localhost',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  },
};
