# MandaGlow — Project Context

> Authoritative reference for the entire codebase. Update this file when key architecture changes.

---

## App Identity

- **Name**: MandaGlow
- **Bundle ID**: `com.mandaglow.app`
- **Platform**: React Native 0.81.5 / Expo 54 (iOS primary, Android supported)
- **EAS Project**: `5115a894-8dc2-4779-b775-141e092f3548`
- **Entry**: `index.js` → `App.js`

---

## Directory Structure

```
ChineseApp/
├── App.js                    # Root component; all navigation + top-level state
├── app.json                  # Expo config
├── eas.json                  # EAS build profiles
├── screens/                  # 18 screen components
├── components/               # 17 base + 10 exercise components
│   └── exercises/
├── utils/                    # 11 utility modules
├── config/                   # 5 config files
├── constants/
│   └── colors.js
├── hooks/
│   └── useProgress.jsx
├── services/
│   └── RevenueCatService.js  # Subscription / paywall
├── data/                     # 76 lesson JSONs + pinyin + quiz + emotional content
│   ├── hsk1/ … hsk6/
│   ├── pinyin/
│   ├── emotionalContent.js
│   ├── vanGoghMessages.js
│   └── placementQuestions.js
└── assets/
    ├── avatar/               # 16 avatar folders (videos + images)
    └── UI_design_images/     # Van Gogh painting backgrounds (must NOT be gitignored)
```

---

## Navigation & State (App.js)

Navigation is a string enum managed in App.js with ~15 `useState` hooks. There is no React Navigation library — screens are rendered conditionally by `currentScreen`.

### Screen enum values
`onboarding` | `home` | `lesson` | `lessonStages` | `stageExercises` | `roundComplete` | `lessonQuiz` | `levelQuiz` | `badges` | `paywall` | `foundationsPinyin` | `pinyinSystem` | `pinyinLesson` | `pinyinStage` | `pinyinLessonQuiz` | `pinyinFinalQuiz`

### Top-level state
| State var | Type | Purpose |
|-----------|------|---------|
| `userData` | object | Age, placement test result, `recommendedLevel` |
| `levelState` | object | `unlockedLevels`, `completedLevels`, `levelSetBy`, `levelChangedUsed` |
| `lessonProgress` | object | `{ levelId: [lessonIds] }` — which lessons completed |
| `stageProgress` | object | `{ "hsk1_5_r1": [0,1,2,...] }` — stages done per round |
| `roundScores` | object | `{ "hsk1_5_r1": { score, total } }` |
| `sectionProgress` | object | `{ "hsk1_5": { newwords, grammar, sentences, dialogue } }` |
| `pinyinQuizPassed` | array | Pinyin lesson IDs that passed final quiz |
| `pinyinStageProgress` | object | Stages done in pinyin lessons |
| `pinyinLearnDone` | object | Learn sections completed in pinyin lessons |
| `quizPassedLessons` | object | `{ levelId: [lessonIds] }` |

### Lesson navigation flow
```
Home → (tap lesson) → LessonDetail (tabs: Learning / Practice / Pinyin)
  Learning tab: VocabularySection → GrammarSection → SentencesSection → DialogueSection
  Practice tab: LessonStages → StageExercises → RoundComplete → (repeat for rounds 2 & 3)
                                                                 → LessonQuiz (after round 2)
Home → (tap level quiz card) → LevelQuiz → unlocks next level on 60%+ pass
Home → (☰ menu) → FoundationsPinyin → PinyinSystem → PinyinLesson → PinyinStage
                                                                     → PinyinLessonQuiz
                                                                     → PinyinFinalQuiz
```

---

## Screens

| File | Purpose |
|------|---------|
| `OnboardingScreen.jsx` | Age select + placement test → recommended level |
| `HomeScreen.jsx` | Avatar picker, level grid, lesson list, streak/XP stats, Van Gogh greeting |
| `LessonDetailScreen.jsx` | Tabbed lesson: Learning / Practice / Pinyin |
| `LessonStagesScreen.jsx` | 5 stage cards with unlock requirements (grammar/sentences must be done first) |
| `StageExercisesScreen.jsx` | Runs one stage: renders exercises from stageGenerator, tracks score |
| `RoundCompleteScreen.jsx` | Shows accuracy % after round; unlocks round 2 or quiz |
| `LessonQuizScreen.jsx` | 10–15 random exercises; pass → lesson complete + XP award |
| `LevelQuizScreen.jsx` | Level advancement test; 60%+ → unlock next level |
| `ReviewMistakesScreen.jsx` | **Stub** — not wired into navigation |
| `BadgesScreen.jsx` | 9 badge display (first_step, on_fire, week_streak, etc.) |
| `PaywallScreen.jsx` | RevenueCat paywall for lessons 4–15 (lessons 1–3 free) |
| `LessonPinyinScreen.jsx` | Pinyin reference tab within a lesson |
| `FoundationsPinyinScreen.jsx` | Standalone pinyin foundations entry screen |
| `PinyinSystemScreen.jsx` | 10 pinyin lessons list + avatar picker |
| `PinyinLessonScreen.jsx` | Pinyin lesson: Learn + Practice + Quiz tabs |
| `PinyinStageScreen.jsx` | Pinyin exercises (tone/initial/final ID, recording) |
| `PinyinLessonQuizScreen.jsx` | Lesson quiz; pass → unlocks final quiz |
| `PinyinFinalQuizScreen.jsx` | Cumulative pinyin exam across all 10 lessons |

---

## Components

### Base
| File | Purpose |
|------|---------|
| `AvatarCharacter.jsx` | Renders avatar video (idle/happy) or expression image (sad/think/etc.) |
| `AvatarPicker.jsx` | Horizontal scroll of 8 selectable avatars; calls `onSelect(id)` — does NOT write to AsyncStorage (picker is display-only; saving happens at the call site) |
| `ScreenBackground.jsx` | Van Gogh painting backdrop + corner decorations |
| `WaveBackground.jsx` | Animated wave for dialogue screens |
| `DialogueSection.jsx` | Renders dialogue lines with per-speaker avatars; always uses lesson-assigned avatarId (not the favourite override) |
| `VocabularySection.jsx` | Vocab cards: Chinese / pinyin / English; toggle learn/review |
| `GrammarSection.jsx` | Grammar pattern cards with examples |
| `SentencesSection.jsx` | Key sentence display with pinyin/English |
| `Flashcards.jsx` | Swipeable flip-card component |
| `SentenceBuilder.jsx` | Tile-drag sentence arrangement |
| `MatchingGame.jsx` | Matching UI |
| `WordShake.jsx` | Shake animation on wrong answer |
| `UnlockModal.jsx` | Generic unlock popup ("Dialogue Unlocked!", etc.) |
| `RewardModal.jsx` | XP + badge earned display |
| `VanGoghMessageModal.jsx` | Van Gogh motivational message popup |
| `LevelChangeModal.jsx` | Modal to switch difficulty level (one-time allowed) |
| `ProgressBar.jsx` | Simple progress bar |

### Exercise Components (`components/exercises/`)
| File | Exercise type string | Description |
|------|---------------------|-------------|
| `FlashcardExercise.jsx` | `flashcard` | Flip card Chinese → pinyin/English |
| `AudioChoiceExercise.jsx` | `audio_choice` | Hear audio → pick from 4 English choices |
| `FillBlankExercise.jsx` | `fill_blank` | Fill missing word (multiple choice) |
| `ArrangeSentenceExercise.jsx` | `arrange` | Arrange word tiles into sentence |
| `MatchPairsExercise.jsx` | `match_pairs` | Match 4 Chinese words to 4 English definitions |
| `ImageExercise.jsx` | `image_exercise` | 4 subtypes: picture→word, word→picture, sentence→picture, listen→picture |
| `SpeakExercise.jsx` | `speak` | 3 subtypes: repeat, translate, respond |
| `PinyinExercise.jsx` | `pinyin_exercise` | Tone/initial/final identification |
| `PinyinLessonExercise.jsx` | — | Pinyin learn-mode content |
| `PinyinRecordExercise.jsx` | — | Record pinyin pronunciation |

---

## Utils

| File | Purpose |
|------|---------|
| `stageGenerator.js` | **Core exercise engine** (1325 lines). `generateRounds(lessonData)` → `[round1, round2, round3]`, each an array of 5 stages, each stage an array of ~10 exercises. See Stage Generator section. |
| `tts.js` | **TTS system** (691 lines). Google Cloud TTS primary; ElevenLabs wired but disabled; local MP3 fallback for pinyin. SSML phoneme overrides for 40+ polyphonic characters. |
| `speechRecognition.js` | Speech-to-text via platform native API |
| `pinyinAudio.js` | Map pinyin syllables → bundled MP3 assets |
| `pinyinLessonGenerator.js` | Generate exercises for pinyin lessons |
| `favouriteAvatar.js` | `getFavouriteAvatar()` / `applyFavouriteAvatarOverride(lessonAvatar)` — reads AsyncStorage key `avatarId` |
| `applyAvatarNames.js` | Substitute avatar names into dialogue speaker fields |
| `notifications.js` | Expo push notification setup |
| `quizProgressStorage.js` | Store/retrieve quiz history by quiz ID |
| `replaceAudio.js` | Exact-string → pre-recorded MP3 overrides |
| `exerciseImages.js` | Map image IDs → `require()` modules |

---

## Config

| File | Purpose |
|------|---------|
| `avatarConfig.js` | Array of 16 avatar objects. Each has `id`, `chineseName`, `englishName`, `gender`, `videos.idle`, `videos.happy`, `images.{sad,think,encourage,surprised,neutral}`. Dialogue-only avatars (vangogh, beauvoir, woolf, picasso, sartre, yangjiang, sushi) have images only, no videos. |
| `avatarVoices.js` | ElevenLabs voice ID map — **all entries are `null`** (disabled). Falls through to Google TTS. |
| `lessonAvatarMap.js` | Maps lesson topic → default avatar ID |
| `googleApiKey.js` | Google Cloud TTS API key (read from `EXPO_PUBLIC_GOOGLE_TTS_API_KEY` env var) |
| `vanGoghTheme.js` | Per-level color palettes, wave colors, background images |

---

## Data

### Lesson JSON schema
```json
{
  "lesson": 1,
  "topic": "Greetings and Basic Introductions",
  "topic_chinese": "你好！",
  "age_group": "Adults and 10+",
  "objectives": ["listening", "speaking", "reading", "writing"],
  "vocabulary": [
    {
      "id": "hsk1_l1_01",
      "chinese": "你",
      "pinyin": "nǐ",
      "tones": [3],
      "english": "You",
      "part_of_speech": "pronoun",
      "example": "你好！",
      "translation": "Hello!"
    }
  ],
  "key_sentences": [
    { "id": "...", "chinese": "你好。", "pinyin": "nǐ hǎo。", "english": "Hello.", "level_difficulty": 1 }
  ],
  "dialogues": [
    {
      "id": "dialogue_1",
      "title": "First Meeting",
      "speakers": ["eileen", "libai"],
      "lines": [
        { "speaker": "eileen", "chinese": "你好！", "pinyin": "nǐ hǎo!", "english": "Hello!", "avatar": "eileen", "emotion": "neutral" }
      ]
    }
  ],
  "grammar_points": [
    {
      "id": "grammar_1",
      "pattern": "Subj + 是 + Noun",
      "explanation": "...",
      "examples": [
        { "chinese": "我是学生。", "pinyin": "wǒ shì xuésheng.", "english": "I am a student." }
      ]
    }
  ],
  "culture_notes": [
    { "id": "...", "title": "...", "content": "...", "idioms": [] }
  ],
  "pinyin_focus": {
    "tone_practice": ["nǐ", "hǎo"],
    "initials_focus": ["n", "h"],
    "finals_focus": ["i", "ao"],
    "initials_review": [],
    "finals_review": []
  }
}
```

### Content counts
- HSK 1–6: 76 lesson JSONs (15 per level, except HSK 6 has 14) + 6 level quiz JSONs
- Pinyin: 10 lesson JSONs + pinyin_final_quiz
- Other: `emotionalContent.js` (avatar daily quotes), `vanGoghMessages.js` (daily/streak/welcome-back messages), `placementQuestions.js` (40-question placement test)

---

## AsyncStorage Keys

| Key | Format | Purpose |
|-----|--------|---------|
| `@chineseapp:userData` | JSON object | User profile: age, test result, `recommendedLevel` |
| `@chineseapp:levelState` | JSON object | `{ unlockedLevels, completedLevels, levelSetBy, levelChangedUsed }` |
| `@chineseapp:lessonProgress` | JSON object | `{ levelId: [lessonId, ...] }` |
| `@chineseapp:stageProgress` | JSON object | `{ "hsk1_5_r1": [0,1,2,...] }` |
| `@chineseapp:roundScores` | JSON object | `{ "hsk1_5_r1": { score, total } }` |
| `@chineseapp:pinyinQuizPassed` | JSON array | `[1, 3, 5, ...]` lesson IDs |
| `@chineseapp:pinyinStageProgress` | JSON object | `{ "pinyin_1": [0,1,2,3,4] }` |
| `@chineseapp:pinyinLearnDone` | JSON object | `{ "pinyin_1": true }` |
| `@chineseapp:quizPassedLessons` | JSON object | `{ "hsk1": [1,2,...] }` |
| `@chineseapp:sectionProgress` | JSON object | `{ "hsk1_5": { newwords, grammar, sentences, dialogue } }` |
| `avatarId` | String | Favourite avatar ID ("eileen", "libai", …); absence = use lesson-assigned |
| `last_active_date` | String YYYY-MM-DD | Streak tracking |
| `chineseapp_progress_v1` | JSON object | XP, streak, badges, rank (from `useProgress` hook) |
| `quiz_progress_${quizId}` | JSON object | Per-quiz attempt history |

---

## Avatar System

### 16 Avatars in `config/avatarConfig.js`

**Full avatars** (video idle/happy + all expression images) — selectable in `AvatarPicker`:
| ID | Chinese | English | Gender |
|----|---------|---------|--------|
| `eileen` | 张爱玲 | Eileen Chang | F |
| `libai` | 李白 | Li Bai | M |
| `luxun` | 鲁迅 | Lu Xun | M |
| `dante` | 但丁 | Dante Alighieri | M |
| `camus` | 加缪 | Albert Camus | M |
| `jane` | 简奥斯汀 | Jane Austen | F |
| `elena` | 费兰特 | Elena Ferrante | F |
| `liucixin` | 刘慈欣 | Liu Cixin | M |

**Dialogue-only avatars** (images only, not selectable in picker):
`vangogh`, `beauvoir`, `woolf`, `picasso`, `sartre`, `yangjiang`, `sushi`

### Favourite Override System

**Intent**: User picks a preferred guide; that guide's voice and image appear in lesson exercises instead of the lesson-assigned avatar. Dialogue scenes always keep the lesson-assigned avatars.

**Flow**:
1. `AvatarPicker` (in `HomeScreen`) calls `onSelect(id)` → sets `avatarId` state display only, **no AsyncStorage write**
2. User taps the big avatar → `showFavouritePrompt` card appears
3. Card shows current avatar + "Choose [Name] as my Favourite Guide" button → writes `avatarId` to AsyncStorage + sets `favouriteSet = true`
4. "Use lesson-assigned guide instead" → removes from AsyncStorage + sets `favouriteSet = false` (home display stays as-is)
5. On app mount: AsyncStorage load → if found, set `avatarId` state + `favouriteSet = true`

**Lesson screens apply the override**:
```js
// In LessonDetailScreen and StageExercisesScreen:
const avatarId = getAvatarForLesson(...);               // lesson-assigned
const [displayAvatarId, setDisplayAvatarId] = useState(avatarId);
useEffect(() => {
  applyFavouriteAvatarOverride(avatarId).then(setDisplayAvatarId);
}, []);
// displayAvatarId used for: AvatarCharacter, VocabularySection, SentencesSection,
//   AudioChoiceExercise, SpeakExercise, ImageExercise
// avatarId (original) used for: DialogueSection, applyAvatarNames()
```

---

## TTS / Audio System

### Provider priority
1. **`replaceAudio.js`** — exact-string match → pre-recorded local MP3 (highest priority)
2. **ElevenLabs** — wired but disabled (all `voiceId: null`); would provide per-avatar high-quality voice
3. **Google Cloud TTS** — primary active provider; SSML with phoneme overrides
4. **Local pinyin MP3s** — `pinyinAudio.js` for individual syllables

### Google TTS voice config (`AVATAR_VOICE_CONFIG` in `utils/tts.js`)

Each avatar entry:
```js
{
  ssmlGender: 'MALE' | 'FEMALE',
  voiceName?: 'cmn-CN-Wavenet-A|B|C|D|E',  // optional; defaults to gender-based
  pitch: number,        // semitones, −20 to +20
  speakingRate: number, // 0.25–4.0
  volumeGainDb?: number
}
```

Selected profiles:
| Avatar | voiceName | pitch | rate | Character |
|--------|-----------|-------|------|-----------|
| libai | Wavenet-B | -1 | 0.90 | Mature, resonant, unhurried |
| luxun | Wavenet-B | -9 | 0.80 | Stern, blunt, low |
| jane | — | +2 | 0.85 | Bright, witty |
| yangjiang | Wavenet-A | -15 | 0.79 | Elderly, very slow |
| eileen | Wavenet-A | +4 | 0.87 | Clear, literary |

Generic roles: `grandma`, `grandpa`, `auntie`, `uncle`, `teacher_f`, `teacher_m` — each with tuned pitch/rate.

### Polyphonic character handling

`buildSSML()` applies SSML `<phoneme alphabet="pinyin">` tags:

- **PHONEME_OVERRIDES** — single-char overrides (e.g., 谁 → shei2, 说 → shuo1)
- **COMPOUND_PHONEME_OVERRIDES** — substring match (40+ entries): 还书/还钱 → huan2, 背包 → bei1, 背景 → bei4, 大夫 → dai4 fu0, 体重 → ti3 zhong4, 旅行 → xing2, etc.
- **POLYPHONIC_RULES** — context-aware rules:
  - 还: followed by 他/她/你/我 → huan2 (return), otherwise hai2 (still)
  - 长: followed by 大/高/胖 → zhang3 (grow), otherwise chang2 (long)
  - 行: preceded by 银/商/同 → hang2 (row), otherwise xing2 (OK)
  - 重: followed by 新/复/来 → chong2 (again), otherwise zhong4 (heavy)

### ElevenLabs (disabled)
- Config: `config/avatarVoices.js` — all `voiceId: null`
- To enable: set real ElevenLabs voice IDs + `EXPO_PUBLIC_ELEVENLABS_API_KEY` in EAS env

### Fish Audio (removed)
- Was a third TTS provider; fully removed from codebase

---

## Stage Generator (`utils/stageGenerator.js`)

`generateRounds(lessonData)` → array of 3 rounds, each an array of 5 stages.

Each stage is an array of exercise objects `{ type, ... }`.

### Round structure

| Round | Focus | Stage distribution |
|-------|-------|--------------------|
| **Round 1 — Learn** | Recognition, introduction | Flashcards + image→word + audio choice + match |
| **Round 2 — Practice** | Sentence production | Fill-blank + arrange + speak (translate/respond) |
| **Round 3 — Master** | Speaking & output | Speak-heavy (repeat/translate/respond) + sentence-to-image |

### Stage names
1. First Look · 2. Listen & Choose · 3. Build Sentences · 4. Match & Review · 5. Final Challenge

### Key features
- **Soft deduplication** — sentence picker cycles pool without repeating within a stage
- **Grammar guarantee** — each grammar point's first valid example distributed as fill-blank/arrange across stages 3–5
- **Level-aware sentence length** — HSK1 capped at 20 chars; HSK5–6 allow longer sentences with commas
- **Polyphonic tokenization** — stageGenerator handles multi-char vocab and structural particles (的/了/过/着)
- **Speak pool** — built from multi-char vocab + level-filtered sentences

---

## Progress & XP System (`hooks/useProgress.jsx`)

AsyncStorage key: `chineseapp_progress_v1`

```js
{
  totalXP: number,
  streak: number,
  lastPlayedDate: 'YYYY-MM-DD',
  earnedBadges: ['first_step', 'on_fire', ...],
  levelProgress: { hsk1: [...], ... },
  gamesPlayed: number,
  hasCompletedOnboarding: boolean,
  userAge: number,
  placementResult: object
}
```

**Rank thresholds**: Beginner 0 · Explorer 100 · Scholar 300 · Master 600 · Legend 1000

**9 Badges**: `first_step`, `on_fire`, `week_streak`, `vocab_master`, `sentence_builder`, `dialogue_pro`, `quiz_ace`, `level_up`, `perfect_round`

---

## EAS Build Config

```json
// eas.json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "autoIncrement": true, "distribution": "internal", "ios": { "simulator": false } },
    "production":  { "autoIncrement": true }
  }
}
```

**Environment variables** (must be set in EAS dashboard, not `.env`):
- `EXPO_PUBLIC_GOOGLE_TTS_API_KEY`
- `EXPO_PUBLIC_ELEVENLABS_API_KEY` (disabled but key present)
- `EXPO_PUBLIC_FISH_AUDIO_API_KEY` (legacy, unused)

**Important**: `assets/UI_design_images/` must NOT be in `.gitignore` — all images are `require()`'d in `config/vanGoghTheme.js` and EAS excludes gitignored files from the build.

---

## Color Constants (`constants/colors.js`)

| Name | Hex | Role |
|------|-----|------|
| `DEEP_NAVY` | #1C2A44 | Primary text on light backgrounds |
| `WARM_ORANGE` | #E8522A | CTA buttons, highlights |
| `SLATE_TEAL` | #374950 | Secondary surfaces, dark headers |
| `WARM_BROWN` | #9B6846 | Secondary accent, muted text |
| `SOFT_SALMON` | #BE7A62 | Gentle borders/accent |
| `CARD_WHITE` | #FFFFFF | Card backgrounds |
| `TEXT_LIGHT` | #F7F0E8 | Text on dark painting backgrounds |
| `MUTED_LIGHT` | #C5B8A8 | Secondary text on dark |
| `SUCCESS` | #2D7A4A | Correct / completed states |
| `ERROR` | #C4503A | Wrong answer / error states |

---

## Disabled / Stub Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Fish Audio TTS** | Removed | Was a third TTS provider; key still in EAS env but no code |
| **ElevenLabs TTS** | Wired, disabled | All `voiceId: null`; set real IDs in `avatarVoices.js` to enable |
| **Characters Section** | Stub | `foundationModal('characters')` shows "Coming Soon" sheet |
| **ReviewMistakesScreen** | File exists, not wired | Not in navigation enum |
| **Games feature** | Alert stub | `handlePlayGame()` in App.js shows "Game coming soon!" |
| **DEV_UNLOCK_ALL** | `true` in dev | Set to `false` before release; bypasses grammar/sentences unlock gates |

---

## Subscription (RevenueCat)

- Lessons 1–3: free
- Lessons 4–15: gated behind paywall
- `services/RevenueCatService.js` handles entitlement check
- `PaywallScreen.jsx` shown when locked lesson is tapped

---

## Key Architectural Patterns

1. **Monolithic App.js** — all navigation state + persistence in one file; no React Navigation or Context API
2. **Prop drilling** — data flows down from App.js to screens; callbacks bubble up
3. **Static JSON data** — all lesson content in bundled JSON files (not fetched from API)
4. **Exercise generation is dynamic** — `stageGenerator` randomises exercise order/content each session for variety
5. **Layered audio fallback** — local MP3 → ElevenLabs (off) → Google TTS; never silent
6. **Avatar favourite is opt-in** — picker changes home display only; button in prompt card commits to AsyncStorage; dialogue scenes always use lesson-assigned avatar
7. **Unlock gates** — Stage 3 unlocks after grammar + sentences sections complete; dialogue unlocks after stage 3; round 2 unlocks after round 1 completes; quiz unlocks after round 2
8. **Confetti** — conditionally mounted (`confettiActive` state); unmounted after animation ends to prevent 80 opaque particles sitting at `bottom: 0` when idle
