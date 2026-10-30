import {existsSync, readFileSync, readdirSync} from 'node:fs';

const frames = JSON.parse(readFileSync('src/app/screen-manifest.json', 'utf8'));
if (frames.length !== 120 || new Set(frames.map(frame => frame.slug)).size !== 120) {
  throw Error('El inventario debe conservar 120 pantallas con slugs únicos');
}
for (const frame of frames) {
  for (const path of frame.files) {
    if (!existsSync(path)) throw Error('Falta ' + path);
  }
  if (typeof frame.contenidoImplementado !== 'boolean') {
    throw Error('contenidoImplementado debe ser booleano: ' + frame.slug);
  }
}

const expectedDialogs = [
  'cliente-reserva-cancelar', 'op-categoria-eliminar', 'op-mesa-desactivar',
  'op-pedido-cancelar', 'op-plato-disponibilidad', 'op-plato-eliminar',
  'op-reserva-cancelar', 'op-reservas-modulo-confirmar',
];
const dialogFolders = readdirSync('src/app/dialogs', {withFileTypes: true})
  .filter(entry => entry.isDirectory()).map(entry => entry.name);
if (dialogFolders.length !== expectedDialogs.length) {
  throw Error('Deben conservarse las ocho carpetas de modales');
}
for (const dialog of expectedDialogs) {
  for (const extension of ['ts', 'html', 'css']) {
    const path = `src/app/dialogs/${dialog}/${dialog}-dialog.${extension}`;
    if (!existsSync(path)) throw Error('Falta ' + path);
  }
}

const implemented = frames.filter(frame => frame.contenidoImplementado).length;
console.log(`120 pantallas y 8 modales verificados. ${implemented} pantallas con contenido visual declarado; la integración y aceptación funcional se verifican por separado.`);
