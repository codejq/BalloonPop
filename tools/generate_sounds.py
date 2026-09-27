#!/usr/bin/env python3
"""Generate the game's balloon sound effects (pop, heart, evil) as MP3 files.

These are original sounds synthesised from scratch, so they are free to use and publish.
Output: BalloonPop/src/main/assets/www/sounds/{pop,heart,evil}.mp3 (listed in sounds/sounds.js).

Requirements: pip install numpy lameenc
Usage:        python3 tools/generate_sounds.py
"""
import os

import lameenc
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'BalloonPop', 'src', 'main', 'assets', 'www', 'sounds')
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(n, attack, decay):
    """Fast attack, exponential decay envelope over n samples."""
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-4), 0, 1)
    return a * np.exp(-x / decay)


def lowpass(x, cutoff):
    alpha = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def pop():
    n = int(SR * 0.22)
    noise = rng.standard_normal(n)
    crack = highpass(noise, 1800) * env(n, 0.0005, 0.018)          # the sharp "snap"
    body = lowpass(noise, 2500) * env(n, 0.001, 0.045) * 0.6         # the burst of air
    thump = np.sin(2 * np.pi * 95 * t(0.22) * (1 - 0.4 * t(0.22))) * env(n, 0.002, 0.05) * 0.7
    flap = lowpass(rng.standard_normal(n), 900) * env(n, 0.02, 0.06) * 0.25   # rubber flapping
    return crack + body + thump + flap


def bell(freq, dur, decay):
    x = t(dur)
    tone = np.sin(2 * np.pi * freq * x) + 0.35 * np.sin(2 * np.pi * freq * 2.01 * x) + 0.12 * np.sin(2 * np.pi * freq * 3.02 * x)
    return tone * env(len(x), 0.004, decay)


def heart():
    out = np.zeros(int(SR * 1.0))
    p = pop() * 0.6
    out[:len(p)] += p
    for i, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):      # C6 E6 G6 C7
        start = int(SR * (0.05 + i * 0.07))
        b = bell(f, 0.9 - i * 0.07, 0.22) * 0.32
        out[start:start + len(b)] += b[:len(out) - start]
    sparkle = highpass(rng.standard_normal(len(out)), 6000) * env(len(out), 0.05, 0.25) * 0.08
    return out + sparkle


def evil():
    dur = 0.75
    x = t(dur)
    f = 190 * np.exp(-x * 1.4) + 55                                   # sliding down "wah-wah"
    f = f * (1 + 0.06 * np.sin(2 * np.pi * 7 * x))                    # wobble
    phase = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((phase / (2 * np.pi)) % 1) - 1
    growl = lowpass(saw, 1200) * env(len(x), 0.01, 0.4)
    wah = 0.5 + 0.5 * np.sin(2 * np.pi * 2.6 * x - np.pi / 2)         # two "wah"s
    out = growl * (0.35 + 0.65 * wah) * 0.9
    p = pop() * 0.7
    out[:len(p)] += p
    return out


def save(name, samples):
    samples = samples / np.abs(samples).max() * 0.9
    fade = int(SR * 0.01)
    samples[-fade:] *= np.linspace(1, 0, fade)
    pcm = (samples * 32767).astype(np.int16)
    enc = lameenc.Encoder()
    enc.set_bit_rate(96)
    enc.set_in_sample_rate(SR)
    enc.set_channels(1)
    enc.set_quality(2)
    path = os.path.join(OUT, name + '.mp3')
    with open(path, 'wb') as f:
        f.write(enc.encode(pcm.tobytes()) + enc.flush())
    print(path, '%.2fs' % (len(pcm) / SR))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    save('pop', pop())
    save('heart', heart())
    save('evil', evil())
