// ── Streak Reminder Notifications ────────────────────────────────────────────
//
// scheduleStreakReminder() — call this whenever the user completes a lesson.
//   It (re)schedules the nightly Van Gogh nudge so the reminder is always
//   based on the most recent practice session.
//
// cancelStreakReminder() — call this when a streak is broken (user missed a
//   day and the app has detected it) OR when the app confirms the user has
//   already practiced today (so the reminder doesn't fire needlessly).
//
// ─────────────────────────────────────────────────────────────────────────────

import * as Notifications from 'expo-notifications';
import { getVanGoghMessage } from '../data/vanGoghMessages';

const REMINDER_ID = 'vangogh_streak_reminder';

export async function scheduleStreakReminder() {
  // 1. Request permission — bail silently if denied
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // 2. Cancel any existing scheduled reminder
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);

  // 3. Pick a random streak-at-risk message
  const msg = getVanGoghMessage('streakAtRisk');

  // 4. Schedule a repeating daily notification at 20:30 local time
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'MandaGlow',
      body: msg?.text ?? 'The day is not yet finished. Neither are you.',
    },
    trigger: {
      hour: 20,
      minute: 30,
      repeats: true,
    },
  });
}

export async function cancelStreakReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
}
