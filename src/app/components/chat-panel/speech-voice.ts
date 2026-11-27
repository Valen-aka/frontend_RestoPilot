/** Prefer a local Spanish voice; es-PE is not installed on every device. */
export function selectSpeechVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find(v => /^es(?:-|_)/i.test(v.lang) && v.localService)
    ?? voices.find(v => /^es(?:-|_|$)/i.test(v.lang))
    ?? voices.find(v => v.default)
    ?? voices.find(v => v.localService)
    ?? voices[0];
}
