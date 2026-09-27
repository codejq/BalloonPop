#!/usr/bin/env python3
"""Pre-render every word the game speaks into small MP3 clips.

The game plays these clips instantly (and caches them offline) instead of asking the
device's text-to-speech engine to render the same words again and again. Languages
without clips fall back to live device speech.

Words come from BalloonPop/src/main/assets/www/js/i18n.js, so re-run this after
editing words there.

Requirements:  pip install piper-tts lameenc ; node on PATH
Voices:        downloaded automatically from https://huggingface.co/rhasspy/piper-voices
Usage:         python3 tools/generate_voices.py [--voices-dir DIR] [--only en,fr]
"""
import argparse
import json
import os
import subprocess
import urllib.request

import lameenc
import numpy as np
from piper import PiperVoice

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WWW = os.path.join(ROOT, 'BalloonPop', 'src', 'main', 'assets', 'www')
OUT = os.path.join(WWW, 'voices')
HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/'

# Only voices whose model card states an open licence. Indonesian and Arabic have no
# clearly licensed Piper voice yet, so they use live device speech.
VOICES = {
    'en': ('en/en_US/ljspeech/medium', 'Public domain (LJ Speech dataset)'),
    'es': ('es/es_ES/davefx/medium', 'CC0'),
    'fr': ('fr/fr_FR/siwis/medium', 'CC BY 4.0 (SIWIS French Speech Synthesis Database)'),
    'de': ('de/de_DE/thorsten/medium', 'CC0 (Thorsten Müller)'),
    'it': ('it/it_IT/serena/medium', 'CC BY 4.0'),
    'pt': ('pt/pt_BR/faber/medium', 'CC0'),
    'nl': ('nl/nl_BE/nathalie/medium', 'CC0'),
    'sv': ('sv/sv_SE/nst/medium', 'CC0 (NST dataset)'),
    'ru': ('ru/ru_RU/denis/medium', 'CC0'),
}


def load_words():
    js = open(os.path.join(WWW, 'js', 'i18n.js'), encoding='utf-8').read()
    code = 'const window={};' + js + ';const I=window.I18N;const o={};' \
        'for(const k in I.LANGS){const L=I.LANGS[k];o[k]={colors:L.colors,shapes:L.shapes,praise:L.praise,letters:I.alphabet(k)}};' \
        'o.__keys={colors:I.COLOR_KEYS,shapes:I.SHAPE_KEYS};process.stdout.write(JSON.stringify(o))'
    return json.loads(subprocess.check_output(['node', '-e', code]))


def clips_for(lang, words):
    """Yield (relative path without extension, text) for one language."""
    for key, text in zip(words['__keys']['colors'], words[lang]['colors']):
        yield 'colors/' + key, text
    for key, text in zip(words['__keys']['shapes'], words[lang]['shapes']):
        yield 'shapes/' + key, text
    for n in range(1, 21):
        yield 'numbers/%d' % n, str(n)
    for i, letter in enumerate(words[lang]['letters']):
        yield 'letters/%d' % i, letter
    for i, text in enumerate(words[lang]['praise']):
        yield 'praise/%d' % i, text


def voice_path(voices_dir, spec):
    name = '-'.join(spec.split('/')[1:])
    base = os.path.join(voices_dir, name)
    for ext in ('.onnx', '.onnx.json'):
        if not os.path.exists(base + ext):
            print('  downloading', name + ext)
            urllib.request.urlretrieve(HF + spec + '/' + name + ext, base + ext)
    return base + '.onnx'


def render(voice, text):
    audio = np.concatenate([c.audio_int16_array for c in voice.synthesize(text)]).astype(np.float32)
    # Trim silence, normalise, and add tiny fades so clips start instantly without clicks.
    loud = np.where(np.abs(audio) > 400)[0]
    if len(loud):
        sr = voice.config.sample_rate
        audio = audio[max(0, loud[0] - int(0.01 * sr)):loud[-1] + int(0.05 * sr)]
    audio *= 0.89 * 32767 / max(1.0, np.abs(audio).max())
    fade = min(len(audio) // 4, int(0.008 * voice.config.sample_rate))
    if fade:
        audio[:fade] *= np.linspace(0, 1, fade)
        audio[-fade:] *= np.linspace(1, 0, fade)
    return audio.astype(np.int16)


def to_mp3(samples, sample_rate):
    enc = lameenc.Encoder()
    enc.set_bit_rate(48)
    enc.set_in_sample_rate(sample_rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(samples.tobytes()) + enc.flush()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voices-dir', default=os.path.join(ROOT, '.piper-voices'))
    ap.add_argument('--only', help='comma-separated language codes')
    args = ap.parse_args()
    os.makedirs(args.voices_dir, exist_ok=True)

    words = load_words()
    langs = args.only.split(',') if args.only else list(VOICES)
    manifest_path = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {'langs': {}}

    for lang in langs:
        spec, licence = VOICES[lang]
        print(lang, spec)
        voice = PiperVoice.load(voice_path(args.voices_dir, spec))
        files = []
        for rel, text in clips_for(lang, words):
            path = os.path.join(OUT, lang, rel + '.mp3')
            os.makedirs(os.path.dirname(path), exist_ok=True)
            samples = render(voice, text)
            seconds = len(samples) / voice.config.sample_rate
            if seconds > 2.0:  # some voices babble on single words; listen before shipping
                print('  WARNING: %s/%s %r is %.1fs long' % (lang, rel, text, seconds))
            with open(path, 'wb') as f:
                f.write(to_mp3(samples, voice.config.sample_rate))
            files.append(rel)
        manifest['langs'][lang] = {'voice': 'piper:' + spec, 'license': licence, 'clips': len(files)}

    manifest['version'] = int(manifest.get('version', 0)) + 1
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    # Same data as a script, for pages opened from file:// (the Android app) where fetch() is blocked.
    with open(os.path.join(OUT, 'manifest.js'), 'w') as f:
        f.write('window.VOICE_MANIFEST = ' + json.dumps(manifest, ensure_ascii=False) + ';\n')
    print('done ->', OUT)


if __name__ == '__main__':
    main()
