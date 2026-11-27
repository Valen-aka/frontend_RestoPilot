const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const out = path.resolve('artifacts/speech-unit');
fs.mkdirSync(out, { recursive: true });
for (const name of ['speech-voice', 'speech-playback']) {
  const source = fs.readFileSync(`src/app/components/chat-panel/${name}.ts`, 'utf8');
  fs.writeFileSync(path.join(out, name + '.js'), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
}
const { SpeechPlayback } = require(path.join(out, 'speech-playback.js'));
const { selectSpeechVoice } = require(path.join(out, 'speech-voice.js'));
const spanish = { name: 'Español', lang: 'es-ES', localService: true };
function fixture() {
  const states = [], errors = [], utterances = [];
  let listener;
  const synth = {
    voices: [spanish], paused: false, cancelled: 0, resumed: 0,
    getVoices() { return this.voices; },
    cancel() { this.cancelled++; },
    resume() { this.resumed++; this.paused = false; },
    speak(speech) { utterances.push(speech); },
    addEventListener(name, callback) { listener = callback; },
    removeEventListener(name, callback) { if (listener === callback) listener = undefined; },
    voicesChanged() { listener?.(); },
  };
  const playback = new SpeechPlayback(synth, text => ({ text }), s => states.push(s), e => errors.push(e));
  return { playback, synth, states, errors, utterances };
}
test('elige español local sin exigir es-PE y admite voz predeterminada', () => {
  const english = { lang: 'en-US', default: true };
  assert.equal(selectSpeechVoice([english, spanish]), spanish);
  assert.equal(selectSpeechVoice([english]), english);
  assert.equal(selectSpeechVoice([]), undefined);
});
test('no anuncia reproducción hasta onstart y usa volumen audible', () => {
  const f = fixture(); f.playback.play('Hola');
  const speech = f.utterances[0];
  assert.equal(f.states.at(-1), 'loading');
  assert.equal(speech.voice, spanish); assert.equal(speech.lang, 'es-ES'); assert.equal(speech.volume, 1);
  speech.onstart(); assert.equal(f.states.at(-1), 'speaking');
  speech.onend(); assert.equal(f.states.at(-1), 'idle');
});
test('reanuda un sintetizador pausado antes de hablar', () => {
  const f = fixture(); f.synth.paused = true; f.playback.play('Hola');
  assert.equal(f.synth.resumed, 1); f.playback.stop();
});
test('espera voces cargadas tarde y no duplica el envío', () => {
  const f = fixture(); f.synth.voices = []; f.playback.play('Hola');
  assert.equal(f.utterances.length, 0);
  f.synth.voices = [spanish]; f.synth.voicesChanged(); f.synth.voicesChanged();
  assert.equal(f.utterances.length, 1); f.playback.stop();
});
test('detener antes de cargar voces impide reproducción tardía', () => {
  const f = fixture(); f.synth.voices = []; f.playback.play('Hola'); f.playback.stop();
  f.synth.voices = [spanish]; f.synth.voicesChanged(); assert.equal(f.utterances.length, 0);
});
test('eventos de una respuesta anterior no alteran la actual', () => {
  const f = fixture(); f.playback.play('Uno'); const old = f.utterances[0]; f.playback.play('Dos');
  old.onstart(); old.onend(); old.onerror({ error: 'canceled' });
  assert.equal(f.states.at(-1), 'loading'); assert.equal(f.errors.at(-1), ''); f.playback.stop();
});
test('informa si no hay voces al finalizar la espera', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(); f.synth.voices = []; f.playback.play('Hola'); t.mock.timers.tick(5000);
  assert.match(f.errors.at(-1), /No hay una voz/); assert.equal(f.states.at(-1), 'idle');
});
test('detecta silencio si Chrome nunca emite onstart', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(); f.playback.play('Hola'); t.mock.timers.tick(8000);
  assert.match(f.errors.at(-1), /no llegó a iniciarse/); assert.equal(f.states.at(-1), 'idle');
});
test('onstart elimina el límite de inicio para respuestas largas', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(); f.playback.play('Hola'); f.utterances[0].onstart(); t.mock.timers.tick(20000);
  assert.equal(f.states.at(-1), 'speaking'); assert.equal(f.errors.at(-1), ''); f.playback.stop();
});
test('explica bloqueo de sonido y permite volver a intentar', () => {
  const f = fixture(); f.playback.play('Hola'); f.utterances[0].onerror({ error: 'not-allowed' });
  assert.match(f.errors.at(-1), /bloqueó/); f.playback.play('Otra'); assert.equal(f.errors.at(-1), ''); f.playback.stop();
});
test('captura fallo síncrono del motor de voz', () => {
  const f = fixture(); f.synth.speak = () => { throw Error('unavailable'); }; f.playback.play('Hola');
  assert.equal(f.states.at(-1), 'idle'); assert.match(f.errors.at(-1), /No se pudo iniciar/);
});
