// Browser integration against the Angular HTTP test backend. Uses synthetic data and voice.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve('artifacts/admin-chat-app/browser');
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, url.pathname === '/operacion/asistente' ? 'index.html' : '.' + url.pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

const period = { fechaInicio: '2026-11-01', fechaFin: '2026-11-30', moneda: null };
const reports = [
  { suggestion: /platos se vendieron/, data: { tipo: 'PLATOS', platosMasVendidos: ['Lomo saltado (8 unidades)'] },
    target: page => page.getByRole('table', { name: 'Platos más vendidos' }).getByRole('cell', { name: '8 uds.' }) },
  { suggestion: /fueron los pagos/, data: { tipo: 'PAGOS', moneda: 'PEN', estadoPagos: {
    montoTotal: 120, pedidosPagados: 4, pagosPendientes: 2, metodosPagoUtilizados: { TARJETA: 4 },
  } }, target: page => page.getByRole('table', { name: 'Métodos de pago', exact: true }).getByRole('cell', { name: 'TARJETA' }) },
  { suggestion: /volumen de atención/, data: { tipo: 'ATENCIONES', pedidosAtendidos: 14, reservasCompletadas: 12, volumenAtenciones: 26 },
    target: page => page.getByText('26', { exact: true }) },
  { suggestion: /horas de mayor demanda/, data: { tipo: 'DEMANDA', horariosMayorDemanda: { '12:00 - 13:00': 3, '13:00 - 14:00': 7 } },
    target: page => page.getByRole('region', { name: 'Gráfico de horarios de mayor demanda' }).getByText('13:00 - 14:00', { exact: true }) },
];

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-11-25T17:00:00Z'));
    await page.addInitScript(() => {
      window.SpeechRecognition = class {
        start() { window.reportRecognition = this; }
        stop() { this.onend(); }
        abort() {}
      };
      Object.defineProperty(window, 'speechSynthesis', { value: { speak(phrase) { window.reportSpeech = phrase.text; }, cancel() {} } });
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/operacion/asistente`);
    await page.getByRole('heading', { name: 'Una pregunta. Una mejor perspectiva.' }).waitFor();
    await page.getByRole('heading', { name: 'Tu asistente de reportes' }).waitFor();
    await page.evaluate(() => window.adminChatHttp.expectOne('/restopilot-api/restaurantes/21').flush({
      id: 21, nombre: 'Local activo QA', direccion: '', activo: true, abierto: true,
      aceptaDelivery: true, tieneAtencionFisica: true, horaApertura: null, horaCierre: null
    }));
    await page.getByText('Local activo QA', { exact: true }).first().waitFor();
    assert.equal(await page.locator('rp-chat-panel').count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Abrir asistente' }).count(), 0);
    const input = page.getByRole('textbox', { name: 'Mensaje para el asistente' });
    const send = page.getByRole('button', { name: 'Enviar mensaje' });

    for (const [index, report] of reports.entries()) {
      if (index === 2) await page.setViewportSize({ width: 390, height: 844 });
      const suggestion = page.getByRole('button', { name: report.suggestion });
      const question = (await suggestion.innerText()).trim();
      assert.match(question, /noviembre de 2026/i);
      await suggestion.click();
      assert.equal(await input.inputValue(), question);
      await send.click();
      const request = await page.evaluate(datos => {
        const matched = window.adminChatHttp.expectOne({ method: 'POST', url: '/api/ia/admin/chat' });
        matched.flush({ estado: 'ANSWER', mensaje: 'Consulta completada.', datos });
        return { body: matched.request.body, token: matched.request.headers.get('Authorization') };
      }, { ...period, ...report.data });
      assert.deepEqual(request, { body: { mensaje: question, restauranteId: 21 }, token: 'Bearer test-not-a-credential' });
      await page.getByText('Período consultado: 2026-11-01 a 2026-11-30').waitFor();
      await report.target(page).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.getByRole('button', { name: 'Escuchar respuesta' }).click();
      assert.match(await page.evaluate(() => window.reportSpeech), /Consulta completada/);
      await page.getByRole('button', { name: /Nueva consulta/ }).click();
      console.log(`OK ${report.data.tipo}: sugerencia, POST, período y resultado`);
    }

    await page.getByRole('button', { name: 'Voz', exact: true }).click();
    await page.getByRole('button', { name: 'Hablar con el asistente' }).click();
    await page.evaluate(() => window.reportRecognition.onresult({ results: [[{ transcript: 'Pagos de noviembre 2026' }]] }));
    await page.getByRole('button', { name: 'Detener dictado' }).click();
    await page.waitForFunction(() => document.querySelector('textarea').value === 'Pagos de noviembre 2026');
    await input.fill('Pagos de octubre 2026');
    await send.click();
    assert.equal(await page.evaluate(() => {
      const request = window.adminChatHttp.expectOne('/api/ia/admin/chat');
      request.flush({ estado: 'NO_DATA', mensaje: 'No hay registros.' });
      window.adminChatHttp.verify();
      return request.request.body.mensaje;
    }), 'Pagos de octubre 2026');
    await page.getByText('No hay registros.', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log('OK dictado editable y respuesta sin datos');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
