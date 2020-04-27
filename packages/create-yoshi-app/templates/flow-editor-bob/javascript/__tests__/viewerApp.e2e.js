import { viewerUrl } from '../dev/sites';

describe('Viewer App', () => {
  it('should display speakers list', async () => {
    await page.goto(viewerUrl);
    await page.waitForSelector('h2');

    const speakers = await page.$$eval('h2', nodes =>
      nodes.map(e => e.textContent?.toLowerCase()).sort(),
    );

    expect(speakers).toEqual([
      'denise wang',
      'fabian reboule',
      'fabian reboule jr.',
      'james rock',
    ]);
  });
});
