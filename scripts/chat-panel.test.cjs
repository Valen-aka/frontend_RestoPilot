// Run against the compiled scripts/fixtures/chat-panel.ts, never a real session.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/test');
const root = path.resolve('artifacts/chat-panel-app/browser');
const output = path.resolve(process.env.CHAT_PANEL_OUTPUT || 'artifacts/chat-panel');
const cpuRate = Number(process.env.CHAT_PANEL_CPU_RATE || 1);
if (!Number.isFinite(cpuRate) || cpuRate < 1 || cpuRate > 8) throw new Error('CHAT_PANEL_CPU_RATE debe estar entre 1 y 8.');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  let page;
  const startedAt = new Date().toISOString();
  const results = [];
  const ok = name => { results.push(name); console.log('OK ' + name); };
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
    const context = await browser.newContext();
    context.setDefaultTimeout(10000);
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
    page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}`;
    await page.goto(url);
    const input = page.getByRole('textbox', { name: 'Mensaje para el asistente' });
    const send = page.getByRole('button', { name: 'Enviar mensaje', exact: true });
    await input.waitFor();
    await page.getByRole('button', { name: 'Consulta de prueba', exact: true }).click();
    await expect(input).toHaveValue('Consulta de prueba');
    assert.equal(await page.evaluate(() => window.chatQA.sent.length), 0);
    await input.fill('');
    await page.screenshot({ path: path.join(output, 'bienvenida-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'bienvenida-mobile.png') });
    ok('consulta sugerida prepara el borrador sin enviarlo');
    await expect(send).toBeDisabled();
    await input.fill('   ');
    await expect(send).toBeDisabled();
    await input.fill('Quiero');
    await page.getByRole('button', { name: 'Voz', exact: true }).click();
    await page.getByRole('button', { name: 'Hablar con el asistente', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Detener dictado', exact: true })).toBeVisible();
    await expect(input).not.toBeEditable();
    await page.evaluate(() => window.recognitionQA.onresult({ results: [[{ transcript: 'opciones vegetarianas' }]] }));
    await expect(send).toBeDisabled();
    await expect(input).toHaveValue('Quiero opciones vegetarianas');
    assert.equal(await page.evaluate(() => window.chatQA.sent.length), 0);
    await page.getByRole('button', { name: 'Detener dictado', exact: true }).click();
    await expect(input).toBeEditable();
    await input.fill('Quiero opciones veganas');
    await expect(send).toBeEnabled();
    await send.click();
    assert.deepEqual(await page.evaluate(() => window.chatQA.sent), ['Quiero opciones veganas']);
    await page.getByText('Consultando al asistente…', { exact: true }).waitFor();
    await expect(send).toBeDisabled();
    ok('dictado editable, sin envío automático ni doble envío durante carga');
    await page.evaluate(() => window.chatQA.reply('CLARIFICATION_REQUIRED', '¿Qué restricción deseas consultar?'));
    await page.getByText('Necesito una aclaración', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Escuchar respuesta', exact: true }).click();
    assert.equal(await page.evaluate(() => window.speechQA.text), '¿Qué restricción deseas consultar?');
    await expect(page.getByRole('button', { name: 'Detener lectura', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Detener lectura', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Detener lectura', exact: true })).toHaveCount(0);
    ok('aclaración explícita y lectura que se puede detener');
    await page.evaluate(() => window.chatQA.reply('NO_DATA', 'Faltan ingredientes registrados.'));
    await page.getByText('Sin información suficiente', { exact: true }).waitFor();
    await page.evaluate(() => window.chatQA.error.set('No se pudo consultar. Vuelve a enviar el mensaje.'));
    await page.getByRole('alert').waitFor();
    await input.fill('Mi borrador');
    await page.getByRole('button', { name: 'Voz', exact: true }).click();
    await page.getByRole('button', { name: 'Hablar con el asistente', exact: true }).click();
    await page.evaluate(() => window.recognitionQA.onerror());
    await page.getByText('No se pudo usar el micrófono. Puedes escribir el mensaje.', { exact: true }).waitFor();
    await expect(input).toHaveValue('Mi borrador');
    ok('sin datos, error del servicio y rechazo de micrófono conservan la edición');
    await page.evaluate(() => {
      window.chatQA.error.set('');
      window.chatQA.reply('ANSWER', 'Respuesta larga '.repeat(60));
    });
    await expect(page.getByText('Respuesta larga '.repeat(60).trim(), { exact: true })).toBeVisible();
    for (const [width, height] of [[1440, 900], [768, 900], [390, 844], [320, 640], [640, 320]]) {
      await page.setViewportSize({ width, height });
      await input.scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator('rp-chat-panel').evaluate(el => {
        const box = el.getBoundingClientRect();
        return Math.abs(box.width - Math.min(912, innerWidth - 16)) < 1;
      }), { message: `El panel debe ajustarse al viewport ${width}x${height}` }).toBe(true);
      const metrics = await page.locator('rp-chat-panel').evaluate(el => {
        const box = el.getBoundingClientRect();
        const panel = el.querySelector('.panel');
        return { width: box.width, overflow: document.documentElement.scrollWidth > innerWidth, panelOverflow: panel.scrollWidth > panel.clientWidth + 1 };
      });
      assert(!metrics.overflow && !metrics.panelOverflow, JSON.stringify({ width, height, metrics }));
      assert(metrics.width >= Math.min(400, width - 16) - 1);
      await expect(input).toBeVisible();
      await page.screenshot({ path: path.join(output, `${width}x${height}.png`) });
      ok(`panel y texto largo sin desbordamiento horizontal ${width}x${height}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Voz', exact: true }).click();
    await page.getByRole('button', { name: 'Hablar con el asistente', exact: true }).click();
    await input.press('Escape');
    await page.locator('rp-chat-panel').waitFor({ state: 'detached' });
    assert.equal(await page.locator('rp-chat-panel').count(), 0);
    assert(await page.evaluate(() => window.abortedQA && window.cancelledQA));
    ok('Escape cierra y libera micrófono y lectura');
    await page.goto(url + '?wrapper');
    const launcher = page.getByRole('button', { name: 'Abrir asistente', exact: true });
    await launcher.click();
    await input.waitFor();
    await expect(input).toBeFocused();
    await page.getByRole('button', { name: 'Cambiar restaurante', exact: true }).click();
    await page.getByRole('button', { name: 'Restaurante de prueba', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Cambiar restaurante', exact: true })).toContainText('Restaurante de prueba');
    const position = await page.locator('rp-chat-panel').boundingBox();
    assert(position.width > 350 && position.x >= 0 && position.y >= 0);
    await input.fill('Consulta que falla');
    await send.click();
    await page.evaluate(() => window.chatQA.failRequest());
    await page.getByRole('alert').waitFor();
    await expect(input).toHaveValue('');
    await input.fill('Consulta que falla');
    await send.click();
    await page.evaluate(() => window.chatQA.resolveRequest());
    await page.getByText('Respuesta de prueba', { exact: true }).waitFor();
    await input.fill('Borrador conservado al cerrar');
    await input.press('Escape');
    await launcher.waitFor();
    await expect(launcher).toBeFocused();
    await launcher.click();
    await expect(input).toHaveValue('Borrador conservado al cerrar');
    await page.getByRole('button', { name: '＋ Nueva consulta', exact: true }).click();
    await page.getByRole('heading', { name: '¿Qué hacemos hoy?', exact: true }).waitFor();
    await expect(input).toHaveValue('');
    await expect(page.getByText('Respuesta de prueba', { exact: true })).toHaveCount(0);
    await page.waitForFunction(() => document.querySelector('.chat-log').scrollTop === 0);
    await page.screenshot({ path: path.join(output, 'chat-integrado-mobile.png') });
    ok('contenedor existente: posición móvil, foco, respuesta, reintento y borrador al reabrir');
    await page.evaluate(() => window.chatQA.verifyRequests());
    await context.close();
    const fallback = await browser.newContext();
    fallback.setDefaultTimeout(10000);
    await fallback.addInitScript(() => {
      Object.defineProperty(window, 'SpeechRecognition', { value: undefined });
      Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined });
      Object.defineProperty(window, 'speechSynthesis', { value: undefined });
    });
    const other = await fallback.newPage();
    other.on('pageerror', error => errors.push(error.message));
    await other.goto(url);
    await expect(other.getByRole('textbox', { name: 'Mensaje para el asistente' })).toBeVisible();
    await other.getByRole('button', { name: 'Voz', exact: true }).click();
    await expect(other.getByText('Tu navegador no admite dictado. Puedes continuar en Chat.', { exact: true })).toBeVisible();
    await expect(other.getByRole('button', { name: 'Hablar con el asistente', exact: true })).toHaveCount(0);
    await other.getByRole('button', { name: 'Chat', exact: true }).click();
    await other.getByRole('textbox', { name: 'Mensaje para el asistente' }).fill('Consulta escrita');
    await other.getByRole('button', { name: 'Enviar mensaje' }).click();
    assert.deepEqual(await other.evaluate(() => window.chatQA.sent), ['Consulta escrita']);
    await other.evaluate(() => window.chatQA.reply('ANSWER', 'Respuesta sin audio'));
    await expect(other.getByText('Respuesta sin audio', { exact: true })).toBeVisible();
    await expect(other.getByRole('button', { name: 'Escuchar respuesta', exact: true })).toHaveCount(0);
    ok('navegador sin voz conserva envío escrito y explica la limitación');
    assert.deepEqual(errors, []);
    for (const image of await other.locator('img').all()) {
      await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      const box = await image.boundingBox();
      assert(box && box.width > 0 && box.height > 0);
    }
    fs.writeFileSync(path.join(output, 'resultado.json'), JSON.stringify({ passed: true, startedAt, cpuRate, scope: 'UI aislada; voz controlada, sin backend real ni reconocimiento físico', results }, null, 2));
    await fallback.close();
  } catch (error) {
    fs.writeFileSync(path.join(output, 'resultado.json'), JSON.stringify({ passed: false, startedAt, cpuRate, results, error: String(error) }, null, 2));
    if (page && !page.isClosed()) await page.screenshot({ path: path.join(output, 'fallo.png') }).catch(() => {});
    throw error;
  } finally {
    try { await browser?.close(); } finally { server.close(); }
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
