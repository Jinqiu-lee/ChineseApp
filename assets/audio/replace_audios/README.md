# Replace Audios

Drop corrected pronunciation MP3 files here when you find a word that sounds wrong.

## How to use

1. Record the correct pronunciation as an MP3 file.
2. Name it using numbered pinyin (e.g. `bei1bao1.mp3`, `huan2shu1.mp3`).
3. Save it in this folder: `assets/audio/replace_audios/`
4. Open `utils/replaceAudio.js` and add a `require()` entry:

```js
export const REPLACE_AUDIO = {
  '背包': require('../assets/audio/replace_audios/bei1bao1.mp3'),
  '还书': require('../assets/audio/replace_audios/huan2shu1.mp3'),
};
```

The key must be the **exact Chinese text** that the app passes to `speakChinese()` —
usually the `chinese` field of a vocabulary item.

## Known pronunciations already fixed via SSML override (in `utils/tts.js`)

### Global character overrides (`PHONEME_OVERRIDES`)
Applied to every instance of the character, regardless of context.

| Character | Wrong | Correct | Context |
|-----------|-------|---------|---------|
| 背 | bèi (tone 4) | bēi (tone 1) | carry on back — 背包, 背着 |

### Compound-word overrides (`COMPOUND_PHONEME_OVERRIDES`)
Applied only when the character appears inside a specific word. Used for polyphonic characters.

| Word | Pinyin | Meaning |
|------|--------|---------|
| 还书 | huán shū | return a book |
| 还钱 | huán qián | return money |
| 还给 | huán gěi | give back to |
| 还回 | huán huí | return/give back |
| 归还 | guī huán | to return (formal) |
| 偿还 | cháng huán | to repay |
| 还款 | huán kuǎn | repay a loan |

All other uses of 还 (meaning "still / also / even more") default to hái — no override needed.

## Notes

- Replacements are **exact-match only** — the Chinese text in the JSON must match the map key exactly.
- For single characters that appear inside longer phrases, the PHONEME_OVERRIDES approach in `tts.js` is better (it applies mid-sentence).
- After adding files, **reload the app** (Expo requires a restart to pick up new assets).
