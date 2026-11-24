// Run against the compiled scripts/fixtures/chat-panel.ts, never a real session.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('artifacts/chat-panel-app/browser');
const output = path.resolve('artifacts/chat-panel');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const results = [];
  const ok = name => { results.push(name); console.log('OK ' + name); };
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      window.SpeechRecognition = class {
        start() { window.recognitionQA = this; }
        stop() { this.onend?.(); }
        abort() { window.abortedQA = true; this.onend?.(); }
      };
      Object.defineProperty(window, 'speechSynthesis', { value: {
        speak(speech) { window.speechQA = speech; },
        cancel() { window.cancelledQA = true; },
      } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}`;
    await page.goto(url);
    const input = page.getByRole('textbox', { name: 'Mensaje para el asistente' });
    const send = page.getByRole('button', { name: 'Enviar mensaje', exact: true });
    await input.waitFor();
    await page.getByRole('button', { name: 'Consulta de prueba', exact: true }).click();
    assert.equal(await input.inputValue(), 'Consulta de prueba');
    assert.equal(await page.evaluate(() => window.chatQA.sent.length), 0);
    await input.fill('');
    await page.screenshot({ path: path.join(output, 'bienvenida-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'bienvenida-mobile.png') });
    ok('consulta sugerida prepara el borrador sin enviarlo');
    assert(await send.isDisabled());
    await input.fill('   ');
    assert(await send.isDisabled());
    await input.fill('Quiero');
    await page.getByRole('button', { name: 'Dictar mensaje', exact: true }).click();
    await page.evaluate(() => window.recognitionQA.onresult({ results: [[{ transcript: 'opciones vegetarianas' }]] }));
    assert(await send.isDisabled());
    assert.equal(await input.inputValue(), 'Quiero opciones vegetarianas');
    assert.equal(await page.evaluate(() => window.chatQA.sent.length), 0);
    await page.getByRole('button', { name: 'Detener dictado', exact: true }).click();
    await input.fill('Quiero opciones veganas');
    await send.click();
    assert.deepEqual(await page.evaluate(() => window.chatQA.sent), ['Quiero opciones veganas']);
    await page.getByText('Consultando al asistente…', { exact: true }).waitFor();
    assert(await send.isDisabled());
    ok('dictado editable, sin envío automático ni doble envío durante carga');
    await page.evaluate(() => window.chatQA.reply('CLARIFICATION_REQUIRED', '¿Qué restricción deseas consultar?'));
    await page.getByText('Necesito una aclaración', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Escuchar respuesta', exact: true }).click();
    assert.equal(await page.evaluate(() => window.speechQA.text), '¿Qué restricción deseas consultar?');
    await page.getByRole('button', { name: 'Detener lectura', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Detener lectura', exact: true }).count(), 0);
    ok('aclaración explícita y lectura que se puede detener');
    await page.evaluate(() => window.chatQA.reply('NO_DATA', 'Faltan ingredientes registrados.'));
    await page.getByText('Sin información suficiente', { exact: true }).waitFor();
    await page.evaluate(() => window.chatQA.error.set('No se pudo consultar. Vuelve a enviar el mensaje.'));
    await page.getByRole('alert').waitFor();
    await input.fill('Mi borrador');
    await page.getByRole('button', { name: 'Dictar mensaje', exact: true }).click();
    await page.evaluate(() => window.recognitionQA.onerror());
    await page.getByText('No se pudo usar el micrófono. Puedes escribir el mensaje.', { exact: true }).waitFor();
    assert.equal(await input.inputValue(), 'Mi borrador');
    ok('sin datos, error del servicio y rechazo de micrófono conservan la edición');
    await page.evaluate(() => {
      window.chatQA.error.set('');
      window.chatQA.reply('ANSWER', 'Respuesta larga '.repeat(60));
    });
    for (const [width, height] of [[1440, 900], [768, 900], [390, 844], [320, 640], [640, 320]]) {
      await page.setViewportSize({ width, height });
      await input.scrollIntoViewIfNeeded();
      const metrics = await page.locator('rp-chat-panel').evaluate(el => {
        const box = el.getBoundingClientRect();
        const panel = el.querySelector('.panel');
        return { width: box.width, overflow: document.documentElement.scrollWidth > innerWidth, panelOverflow: panel.scrollWidth > panel.clientWidth + 1 };
      });
      assert(!metrics.overflow && !metrics.panelOverflow, JSON.stringify({ width, height, metrics }));
      assert(metrics.width >= Math.min(400, width - 16) - 1);
      assert(await input.isVisible());
      await page.screenshot({ path: path.join(output, `${width}x${height}.png`) });
      ok(`panel y texto largo sin desbordamiento horizontal ${width}x${height}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Dictar mensaje', exact: true }).click();
    await input.press('Escape');
    await page.locator('rp-chat-panel').waitFor({ state: 'detached' });
    assert.equal(await page.locator('rp-chat-panel').count(), 0);
    assert(await page.evaluate(() => window.abortedQA && window.cancelledQA));
    ok('Escape cierra y libera micrófono y lectura');
    await page.goto(url + '?wrapper');
    const launcher = page.getByRole('button', { name: 'Abrir asistente', exact: true });
    await launcher.click();
    await input.waitFor();
    await page.waitForFunction(() => document.activeElement?.tagName === 'TEXTAREA');
    const position = await page.locator('rp-chat-panel').boundingBox();
    assert(position.width > 350 && position.x >= 0 && position.y >= 0);
    await input.fill('Consulta que falla');
    await send.click();
    await page.evaluate(() => window.chatQA.failRequest());
    await page.getByRole('alert').waitFor();
    assert.equal(await input.inputValue(), 'Consulta que falla');
    await send.click();
    await page.evaluate(() => window.chatQA.resolveRequest());
    await page.getByText('Respuesta de prueba', { exact: true }).waitFor();
    await input.fill('Borrador conservado al cerrar');
    await input.press('Escape');
    await launcher.waitFor();
    await page.waitForFunction(() => document.activeElement?.classList.contains('launcher'));
    await launcher.click();
    assert.equal(await input.inputValue(), 'Borrador conservado al cerrar');
    await page.getByRole('button', { name: '＋ Nueva consulta', exact: true }).click();
    await page.getByRole('heading', { name: 'Tu carta, conversada.' }).waitFor();
    assert.equal(await input.inputValue(), '');
    assert.equal(await page.getByText('Respuesta de prueba', { exact: true }).count(), 0);
    await page.waitForFunction(() => document.querySelector('.chat-log').scrollTop === 0);
    await page.screenshot({ path: path.join(output, 'chat-integrado-mobile.png') });
    ok('contenedor existente: posición móvil, foco, respuesta, reintento y borrador al reabrir');
    await context.close();
    const fallback = await browser.newContext();
    await fallback.addInitScript(() => {
      Object.defineProperty(window, 'SpeechRecognition', { value: undefined });
      Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined });
      Object.defineProperty(window, 'speechSynthesis', { value: undefined });
    });
    const other = await fallback.newPage();
    await other.goto(url);
    await other.getByText('Lectura en voz alta no disponible en este navegador.', { exact: true }).waitFor();
    assert.equal(await other.getByRole('button', { name: 'Dictar mensaje' }).count(), 0);
    await other.getByRole('textbox', { name: 'Mensaje para el asistente' }).fill('Consulta escrita');
    await other.getByRole('button', { name: 'Enviar mensaje' }).click();
    assert.deepEqual(await other.evaluate(() => window.chatQA.sent), ['Consulta escrita']);
    ok('navegador sin voz conserva envío escrito y explica la limitación');
    assert.deepEqual(errors, []);
    for (const image of await other.locator('img').all()) {
      assert(await image.evaluate(el => el.complete && el.naturalWidth > 0));
      const box = await image.boundingBox();
      assert(box && box.width > 0 && box.height > 0);
    }
    fs.writeFileSync(path.join(output, 'resultado.json'), JSON.stringify({ scope: 'UI aislada; voz controlada, sin backend real ni reconocimiento físico', results }, null, 2));
    await fallback.close();
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
