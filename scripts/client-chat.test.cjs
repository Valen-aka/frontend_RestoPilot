// Browser integration with Angular's HTTP test backend; no live account or Gemini.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('artifacts/client-chat-app/browser');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByRole('button', { name: 'Abrir asistente', exact: true }).click();
    const input = page.getByRole('textbox', { name: 'Mensaje para el asistente' });
    const send = page.getByRole('button', { name: 'Enviar mensaje', exact: true });
    const select = async name => {
      await page.locator('mat-form-field').filter({ has: page.getByRole('combobox', { name: 'Restaurante para tus preguntas' }) }).click();
      assert.equal(await page.getByRole('option', { name: 'Restaurante inactivo', exact: true }).count(), 0);
      await page.getByRole('option', { name, exact: true }).click();
    };
    await input.fill('Opciones veganas');
    assert(await send.isDisabled());
    await select('Restaurante uno');
    await input.fill('  Opciones veganas  ');
    await send.click();
    assert(await send.isDisabled());
    const request = await page.evaluate(() => {
      const req = window.clientQA.http.expectOne('/api/ia/cliente/chat');
      const details = { method: req.request.method, body: req.request.body, auth: req.request.headers.get('Authorization') };
      req.flush({ estado: 'ANSWER', mensaje: 'Opciones del restaurante uno', datos: null, pedidoId: 42 });
      return details;
    });
    assert.deepEqual(request, { method: 'POST', body: { mensaje: 'Opciones veganas', restauranteId: 1 }, auth: 'Bearer qa-token' });
    await page.getByText('Opciones del restaurante uno', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.clientQA.chat().messages().at(-1).asistente.pedidoId), 42);
    console.log('OK selección obligatoria, POST autenticado y pedidoId conservado');
    for (const estado of ['CLARIFICATION_REQUIRED', 'NO_DATA']) {
      await input.fill('Consulta ' + estado);
      await send.click();
      await page.evaluate(estado => window.clientQA.http.expectOne('/api/ia/cliente/chat').flush({ estado, mensaje: 'Respuesta ' + estado }), estado);
      await page.getByText('Respuesta ' + estado, { exact: true }).waitFor();
    }
    for (const status of [400, 401, 403, 429, 502, 503, 500]) {
      await input.fill('Consulta ' + status);
      await send.click();
      await page.evaluate(status => window.clientQA.http.expectOne('/api/ia/cliente/chat').flush({ message: 'PRIVATE SERVER DETAIL' }, { status, statusText: 'Test error' }), status);
      await page.getByRole('alert').waitFor();
      assert.equal(await input.inputValue(), 'Consulta ' + status);
      assert(!(await page.getByRole('alert').innerText()).includes('PRIVATE'));
    }
    console.log('OK estados de respuesta y errores HTTP conservan el borrador');
    for (const body of [null, {}, { estado: 'UNKNOWN', mensaje: 'Incorrecto' }, { estado: 'ANSWER', mensaje: '' }, { estado: 'ANSWER', mensaje: 'Incorrecto', pedidoId: -1 }, { estado: 'ANSWER', mensaje: 'Incorrecto', datos: { inesperado: true } }]) {
      await input.fill('Validar contrato');
      await send.click();
      await page.evaluate(body => window.clientQA.http.expectOne('/api/ia/cliente/chat').flush(body), body);
      await page.getByText('El asistente devolvió una respuesta no válida. Inténtalo de nuevo.', { exact: true }).waitFor();
      assert.equal(await input.inputValue(), 'Validar contrato');
    }
    await send.click();
    await page.evaluate(() => { window.pendingQA = window.clientQA.http.expectOne('/api/ia/cliente/chat'); });
    await select('Restaurante dos');
    assert(await page.evaluate(() => window.pendingQA.cancelled));
    assert.equal(await input.inputValue(), '');
    assert.deepEqual(await page.evaluate(() => window.clientQA.chat().messages()), []);
    await input.fill('Carta del segundo restaurante');
    await send.click();
    assert.equal(await page.evaluate(() => {
      const req = window.clientQA.http.expectOne('/api/ia/cliente/chat');
      req.flush({ estado: 'ANSWER', mensaje: 'Carta del segundo local' });
      return req.request.body.restauranteId;
    }), 2);
    console.log('OK respuestas inválidas y cancelación al cambiar de restaurante');
    await page.evaluate(() => window.clientQA.session.set({ subject: 'qa2', role: 'CLIENTE', accessToken: 'qa-refreshed', expiresAt: Date.now() + 3600000 }));
    await page.getByRole('button', { name: 'Abrir asistente', exact: true }).click();
    await select('Restaurante uno');
    await input.fill('Nueva sesión');
    await send.click();
    assert.equal(await page.evaluate(() => {
      window.pendingQA = window.clientQA.http.expectOne('/api/ia/cliente/chat');
      return window.pendingQA.request.headers.get('Authorization');
    }), 'Bearer qa-refreshed');
    await page.evaluate(() => window.clientQA.session.set(null));
    await page.locator('rp-chat-panel').waitFor({ state: 'detached' });
    assert(await page.evaluate(() => window.pendingQA.cancelled));
    const invalid = await page.evaluate(() => {
      const qa = window.clientQA;
      let rejected = 0;
      const send = (mensaje, restauranteId) => qa.service.send({ mensaje, restauranteId }).subscribe({ error: () => rejected++ });
      send('Sin sesión', 1);
      qa.session.set({ subject: 'qa', role: 'CLIENTE', accessToken: 'qa', expiresAt: Date.now() - 1 });
      send('Expirada', 1);
      qa.session.set({ subject: 'qa', role: 'DUENO', accessToken: 'qa', expiresAt: Date.now() + 60000 });
      send('Otro rol', 1);
      qa.session.set({ subject: 'qa', role: 'CLIENTE', accessToken: 'qa', expiresAt: Date.now() + 60000 });
      send('  ', 1); send('a'.repeat(2001), 1); send('Consulta', 0); send('Consulta', 1.5);
      qa.http.verify();
      return rejected;
    });
    assert.equal(invalid, 7);
    assert.deepEqual(errors, []);
    console.log('OK token actualizado, cierre de sesión y solicitudes inválidas sin HTTP');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
