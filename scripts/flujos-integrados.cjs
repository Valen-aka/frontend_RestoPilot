/* Recorridos locales de muestra. Ejecutar con Angular en modo desarrollo. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let playwright;
try {playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');}
catch {throw new Error('Playwright no está disponible. Define PLAYWRIGHT_MODULE con una instalación existente del paquete playwright.');}

const base = new URL(process.env.RP_QA_URL || 'http://127.0.0.1:4303');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error('Este guion admite únicamente una aplicación local.');
const output = path.resolve(process.env.RP_QA_OUTPUT || 'artifacts/flujos-integrados');
const chrome = process.env.BROWSER_EXECUTABLE || (process.platform === 'win32' ? path.join(process.env.PROGRAMFILES || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe') : undefined);
const launch = {headless: true};
if (chrome && fs.existsSync(chrome)) launch.executablePath = chrome;

async function open(page, route) {
  await page.goto(new URL(route, base).href);
  await page.locator('h1').waitFor();
}
async function fits(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'La página desborda horizontalmente');
}
async function fixture(page, selector, body) {
  await page.evaluate(({selector, body}) => {
    if (!window.ng?.getComponent) throw new Error('Se necesita ng serve en modo desarrollo para configurar las muestras de prueba.');
    const component = ng.getComponent(document.querySelector(selector));
    new Function('v', body)(component);
    ng.applyChanges(component);
  }, {selector, body});
}
async function accept(page) {await page.getByRole('dialog').getByRole('button').last().click();}

async function client(page) {
  // US11 se verifica por HTTP en us11-api-browser.cjs; este caso conserva US12/US13 de muestra.
  await open(page, '/cliente/pedidos');
  assert.equal(await page.locator('tbody tr').count(), 3);
  await page.getByRole('link', {name: 'Ver pedido 1034', exact: true}).click();
  await page.getByRole('heading', {name: 'Pedido #1034', exact: true}).waitFor();
  assert.equal(await page.locator('.current-status').innerText(), 'Entregado');
  assert.match(await page.locator('.selection-total').innerText(), /38.00/);
  await page.getByRole('link', {name: 'Ver registro de pago', exact: true}).click();
  await page.getByRole('heading', {name: 'Pedido #1034', exact: true}).waitFor();
  assert.match(await page.locator('.payment-details').innerText(), /Efectivo/);
  await page.getByRole('link', {name: 'Volver al pedido', exact: true}).click();
  await page.getByRole('heading', {name: 'Pedido #1034', exact: true}).waitFor();
  assert.equal(await page.locator('.current-status').innerText(), 'Entregado');
  await fits(page);
}

async function kitchen(page) {
  await open(page, '/operacion/pedidos');
  await page.getByRole('link', {name: 'Consultar pedido #1042', exact: true}).click();
  await page.getByRole('heading', {name: 'Pedido #1042', exact: true}).waitFor();
  const original = await page.locator('table').innerText();
  await page.getByRole('button', {name: 'Simular inicio de preparación del pedido #1042', exact: true}).click();
  await page.getByRole('dialog').getByRole('button', {name: 'Volver sin cambios'}).click();
  assert.equal(await page.locator('.selection-card .status').innerText(), 'Pendiente');
  await page.getByRole('button', {name: 'Simular inicio de preparación del pedido #1042', exact: true}).click();
  await accept(page);
  await page.getByRole('heading', {name: 'Preparación del pedido #1042', exact: true}).waitFor();
  assert.equal(await page.locator('.selection-card .status').innerText(), 'En preparación');
  await fits(page);
  await page.getByRole('button', {name: 'Simular pedido listo del pedido #1042', exact: true}).click();
  await accept(page);
  await page.getByRole('heading', {name: 'Pedido listo para entregar', exact: true}).waitFor();
  assert.equal(await page.locator('.selection-card .status').innerText(), 'Listo');
  await page.getByRole('button', {name: 'Simular entrega del pedido #1042', exact: true}).click();
  await accept(page);
  await page.getByRole('heading', {name: 'Entrega de muestra', exact: true}).waitFor();
  assert.equal(await page.locator('.selection-card .status').innerText(), 'Entregado');
  assert.equal(await page.locator('table').innerText(), original);
  assert.equal(await page.getByRole('button', {name: /Simular/}).count(), 0);
  await page.getByRole('link', {name: 'Volver a la cola', exact: true}).click();
  await page.getByRole('heading', {name: 'Cola del restaurante', exact: true}).waitFor();
  assert.equal(await page.locator('tbody tr').filter({hasText: '#1042'}).count(), 0);
  await page.getByRole('link', {name: 'Ver tablero de cocina', exact: true}).click();
  await page.getByRole('heading', {name: 'El ritmo de la cocina', exact: true}).waitFor();
  assert.equal(await page.locator('rp-cocina-card[data-order-id="1042"], rp-cocina-card [data-order-id="1042"]').count(), 0);
  await fits(page);
}

async function reservations(page) {
  await open(page, '/operacion/reservas');
  await page.getByRole('link', {name: 'Consultar reserva 208', exact: true}).click();
  await page.getByRole('button', {name: 'Simular llegada de la reserva #208', exact: true}).click();
  await page.getByRole('dialog').getByRole('button', {name: 'Volver sin cambios'}).click();
  assert.equal(await page.locator('.arrival-date').count(), 0);
  await page.getByRole('button', {name: 'Simular llegada de la reserva #208', exact: true}).click();
  await accept(page);
  await page.getByRole('button', {name: 'Simular finalización de la reserva #208', exact: true}).waitFor();
  const arrival = await page.locator('.arrival-date').innerText();
  await fixture(page, 'rp-reserva-atencion-view', "v.store.now.set('2026-10-24T19:30:00-05:00');");
  await page.getByRole('button', {name: 'Simular finalización de la reserva #208', exact: true}).click();
  await accept(page);
  await page.getByRole('heading', {name: 'Una experiencia completada', exact: true}).waitFor();
  assert.equal(await page.locator('.arrival-date').innerText(), arrival);
  assert.match(await page.locator('.completion-date').innerText(), /19:30/);
  await page.getByRole('link', {name: 'Volver a la agenda', exact: true}).click();
  await page.locator('.attendance-summary').waitFor();
  assert.match(await page.locator('.attendance-summary').innerText(), /Completada/);
  assert.match(await page.locator('.attendance-summary').innerText(), /19:05/);
  assert.match(await page.locator('.attendance-summary').innerText(), /19:30/);
  assert.equal(await page.locator('tbody tr').filter({hasText: '#208'}).count(), 0);
  await page.getByRole('link', {name: 'Ver reserva 207', exact: true}).click();
  await page.getByRole('heading', {name: 'Reserva #207', exact: true}).waitFor();
  assert.match(await page.locator('.reservation-card').innerText(), /Expirada/);
  assert.equal(await page.getByRole('button', {name: /Simular/}).count(), 0);
  await page.getByRole('link', {name: 'Ver reservas', exact: true}).click();
  await page.getByRole('link', {name: 'Consultar reserva 208', exact: true}).click();
  await page.getByRole('heading', {name: 'Una experiencia completada', exact: true}).waitFor();
  await fits(page);
}

async function clientErrors(page) {
  await open(page, '/cliente/pedidos');
  await fixture(page, 'rp-cliente-pedidos', "v.store.queryState.set('loading');");
  await page.getByRole('heading', {name: 'Consultando tus pedidos…'}).waitFor();
  assert.equal(await page.locator('table').count(), 0);
  await fixture(page, 'rp-cliente-pedidos', "v.store.queryState.set('error');");
  await page.getByRole('heading', {name: 'No pudimos mostrar tus pedidos'}).waitFor();
  await page.getByRole('button', {name: 'Volver a abrir la muestra'}).click();
  await page.getByRole('link', {name: 'Ver pedido 1042', exact: true}).click();
  await page.getByRole('heading', {name: 'Pedido #1042', exact: true}).waitFor();
  await fixture(page, 'rp-pedido-selection-view', "v.store.records.update(rows => rows.map(r => ({...r,clientId:'otra-cuenta'})));");
  await page.getByRole('heading', {name: 'No se encontró el pedido', exact: true, level: 1}).waitFor();
  assert.equal(await page.locator('table').count(), 0);
  assert.equal(await page.locator('rp-pedido-progress').count(), 0);
  await page.getByRole('link', {name: 'Volver a mis pedidos', exact: true}).click();
  await page.getByRole('heading', {name: 'No tienes pedidos en esta muestra'}).waitFor();
}
async function kitchenErrors(page) {
  await open(page, '/operacion/pedidos');
  await page.getByRole('link', {name: 'Consultar pedido #1042', exact: true}).click();
  await page.getByRole('button', {name: 'Simular inicio de preparación del pedido #1042', exact: true}).click();
  await fixture(page, 'rp-cocina-view', 'v.store.updateFailure.set(true);');
  await accept(page);
  await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('.selection-card .status').innerText(), 'Pendiente');
  await fixture(page, 'rp-cocina-view', 'v.store.updateFailure.set(false);v.store.showRefreshError();');
  assert(await page.getByRole('button', {name: 'Simular inicio de preparación del pedido #1042', exact: true}).isDisabled());
}
async function reservationErrors(page) {
  await open(page, '/operacion/reservas');
  await page.getByRole('link', {name: 'Consultar reserva 208', exact: true}).click();
  await page.getByRole('button', {name: 'Simular llegada de la reserva #208', exact: true}).waitFor();
  await fixture(page, 'rp-reserva-atencion-view', "v.store.now.set('2026-10-24T19:15:00-05:00');");
  assert(await page.getByRole('button', {name: 'Simular llegada de la reserva #208', exact: true}).isDisabled());
  assert.equal(await page.locator('.arrival-date').count(), 0);
  await page.getByRole('link', {name: 'Volver a la agenda', exact: true}).click();
  await page.getByRole('link', {name: 'Consultar reserva 208', exact: true}).waitFor();
  assert.match(await page.locator('.attendance-summary').innerText(), /Confirmada/);
  assert.equal(await page.locator('tbody tr').filter({hasText: '#208'}).count(), 0);
}

(async () => {
  fs.mkdirSync(output, {recursive: true});
  const browser = await playwright.chromium.launch(launch);
  const cases = [];
  try {
    const suite = [];
    for (const width of [320, 390, 768, 1024, 1440]) for (const [name, run] of [['cliente', client], ['cocina', kitchen], ['reservas', reservations]]) suite.push({name, width, run});
    for (const width of [390, 1440]) for (const [name, run] of [['cliente-errores', clientErrors], ['cocina-errores', kitchenErrors], ['reservas-limite', reservationErrors]]) suite.push({name, width, run});
    for (const scenario of suite) {
      const context = await browser.newContext({viewport: {width: scenario.width, height: 1000}});
      const page = await context.newPage();
      const errors = [], requests = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => {
        const request = route.request(), url = new URL(request.url());
        if (url.origin !== base.origin || !['GET', 'HEAD'].includes(request.method()) || /\/api(?:\/|$)/.test(url.pathname)) {
          requests.push({method: request.method(), url: request.url()});return route.abort();
        }
        return route.continue();
      });
      const result = {name: scenario.name, width: scenario.width, status: 'passed'};
      try {
        await scenario.run(page);
        assert.deepEqual(errors, [], 'Errores JavaScript');
        assert.deepEqual(requests, [], 'Se intentaron solicitudes fuera del alcance local de lectura');
        await fits(page);
      } catch (error) {result.status = 'failed';result.error = String(error.stack || error);}
      result.screenshot = `${scenario.name}-${scenario.width}.png`;
      await page.screenshot({path: path.join(output, result.screenshot), fullPage: true}).catch(() => {});
      cases.push(result);
      process.stdout.write(`${result.status.toUpperCase()} ${result.name} ${result.width}\n`);
      if (result.error) process.stdout.write(result.error+'\n');
      await context.close();
    }
  } finally {await browser.close();}
  const report = {finishedAt: new Date().toISOString(), sourceCommit: process.env.RP_QA_SOURCE_COMMIT || 'no indicado',
    scope: 'Tres recorridos locales independientes. No acredita sincronización cliente-cocina ni operaciones reales.',
    passed: cases.filter(c => c.status === 'passed').length, failed: cases.filter(c => c.status === 'failed').length, cases};
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2)+'\n');
  process.stdout.write(`${report.passed}/${cases.length} casos correctos. Resultados: ${path.relative(process.cwd(), output)}\n`);
  if (report.failed) process.exitCode = 1;
})().catch(error => {console.error(error);process.exitCode = 1;});
