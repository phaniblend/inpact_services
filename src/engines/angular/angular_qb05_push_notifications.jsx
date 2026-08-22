/**
 * QB05 — Push Notifications (QuickBite)
 * Placeholder when AI lesson is not loaded.
 */
import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "QB05 — PUSH NOTIFICATIONS",
      title: "Push Notifications",
      body: `Simulate: "Your order is ready!" push notification that deep-links to the order detail page.

You will register for push, handle registration and tap events, and deep-link using Angular Router — only on Capacitor (not browser).`,
      usecase: "Push notifications drive re-engagement; deep-linking from a tap to a specific screen is essential for UX.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Register the app for push notifications using PushNotifications.register() and retrieve the device token",
      "Explain the full push flow: device token → your backend → Firebase Cloud Messaging → APNs/FCM → device",
      "Handle three distinct notification events: registration, pushNotificationReceived (app open), and pushNotificationActionPerformed (user taps)",
      "Deep-link from a notification tap to a specific route using Angular Router.navigate()",
      "Guard push registration using platform.is('capacitor') so it only runs on real devices, not the browser",
      "Distinguish between Firebase App Distribution (test build delivery) and Firebase Cloud Messaging (push notifications) — two different Firebase products",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 1",
    paal: "Register for push with PushNotifications.register(), handle pushNotificationActionPerformed, and navigate to order detail.",
    hint: "Use @capacitor/push-notifications and guard with Capacitor.isNativePlatform().",
    answer_keywords: ["PushNotifications", "register", "pushNotificationActionPerformed", "Router"],
    seed_code: "// PushNotifications.register(); handle events; Router.navigate for deep link\n",
    feedback_correct: "✅ Push flow complete.",
    feedback_partial: "Register for push and handle tap to navigate.",
    feedback_wrong: "Add push registration and deep-link on notification tap.",
    expected: "Push registration and deep-link",
    evaluation: { mode: "keyword_match", required: ["PushNotifications"], partialThreshold: 0.5, correctThreshold: 0.8 },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 5,
  title: "Push Notifications",
  shortName: "QB05",
  answerShape: "angular-tabs",
});
