// netlify/functions/gym-reminder.js
//
// Sends a real SMS directly to the iPhone / Android Messages app via TextBelt.
//
// ── Free tier (zero setup) ────────────────────────────────────────────────────
//   Use key "textbelt" — completely free, 1 SMS per day, no account needed.
//
// ── Paid (more sends) ─────────────────────────────────────────────────────────
//   Buy a TextBelt API key at textbelt.com — $0.01/text, no monthly fees.
//   Set TEXTBELT_KEY to your paid key; quota resets as you buy more credits.
//
// ── Required env vars ─────────────────────────────────────────────────────────
//   GYM_PHONE           – phone number with country code, e.g. +15551234567
//   GYM_REMINDER_TIMES  – comma-separated 24h UTC times, e.g. "12:00,23:00"
//   TEXTBELT_KEY        – (optional) paid key; defaults to free "textbelt" key
//
// ── Optional AI messages (free tier available) ─────────────────────────────
//   GEMINI_API_KEY      – Google Gemini free tier (1500 req/day, gemini-1.5-flash)
//                         Get one free at aistudio.google.com
//
// ── Scheduled via netlify.toml ────────────────────────────────────────────────
//   Runs every minute; fires only when current UTC time matches a reminder time.

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// 40 motivational messages — used when no AI key is set (always free)
const MESSAGES = [
  "Time to get moving! Every rep brings you closer to your goal. 💪",
  "Your gym session is waiting — show up and make it count! 🏋️",
  "No excuses today. Lace up and let's go! 🏃",
  "The only workout you'll regret is the one you skip. Get after it! 🔥",
  "Your body can do it. It's your mind you have to convince. Let's go! 💥",
  "Champions are built in moments they don't feel like showing up. Be one! 🏆",
  "One session closer to the version of yourself you're working toward. Go! ⚡",
  "Gym time! 30 minutes from now you'll be glad you went. 🎯",
  "Today's workout is a gift to your future self. Time to deliver! 🎁",
  "Sweat now, shine later. Hit the gym! 🌟",
  "Progress, not perfection. Every session adds up — let's go! 📈",
  "Energy creates energy. Get to the gym and you'll feel amazing after! ⚡",
  "You always feel better after a workout. Go make it happen! 🙌",
  "Your gym is calling. Time to answer! 🏃‍♂️",
  "Consistency beats intensity. Show up today and keep the streak alive! 🔑",
  "Hard work now = results later. The gym is waiting for you! 💪",
  "Get up, show up, never give up. Today's session — go! 🗓️",
  "Stronger with every session. Time to add another one to the books! 📚",
  "Your future self is counting on you right now. Don't let them down! 🚀",
  "It's gym o'clock! Movement is medicine — get your dose! 💊",
  "Push past the comfort zone — that's where the magic happens. Go! ✨",
  "Cardio time! Heart health is wealth. Run, ride, or climb! ❤️",
  "Small steps lead to big results. Get moving today! 👟",
  "You've done it before, you can do it again. Gym time! 🔄",
  "The hardest part is getting there. You're already reading this — just go! 🏁",
  "Turn today's effort into tomorrow's strength. Hit the gym! 💫",
  "Burn it, earn it! Time for your workout. 🔥",
  "Your health is your greatest investment. Make a deposit today! 💰",
  "Don't wait for motivation — just start. It'll come once you're moving! 🎬",
  "You're one workout away from a better mood. Let's fix that! 😤",
  "Beast mode: activated. Get to the gym! 🦁",
  "Cardio check-in time! Even 20 minutes counts. Let's go! ✅",
  "Showing up is 80% of the battle. You've already won — just get there! 🥇",
  "Move your body, clear your mind. Gym time is self-care! 🧘",
  "Another day, another chance to be stronger than yesterday. Go! 💪",
  "You signed up for this — now go claim your results! 🎯",
  "Sweat is just fat crying. Time to make it cry! 😤",
  "Today's pain is tomorrow's power. Let's build that power! ⚡",
  "Momentum is everything. Keep it going — gym time! 🚂",
  "One session at a time. Today's is ready and waiting for you! ⏰",
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const isTest = event?.queryStringParameters?.test === 'true';

  // ── Resolve phone number ──────────────────────────────────────────────────
  let phone = process.env.GYM_PHONE || '';

  if (isTest && event.body) {
    try {
      const body = JSON.parse(event.body);
      if (body.phone) phone = body.phone;
    } catch { /* ignore */ }
  }

  if (!phone) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: 'GYM_PHONE is not set. Add it in Netlify environment variables.' }),
    };
  }

  // ── Check schedule (cron mode only) ──────────────────────────────────────
  if (!isTest) {
    const times = (process.env.GYM_REMINDER_TIMES || '')
      .split(',').map(t => t.trim()).filter(Boolean);

    if (!times.length) {
      return { statusCode: 200, body: 'GYM_REMINDER_TIMES not configured.' };
    }

    const now  = new Date();
    const hhmm = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

    if (!times.includes(hhmm)) {
      return { statusCode: 200, body: `No reminder at ${hhmm} UTC.` };
    }
  }

  // ── Build message ─────────────────────────────────────────────────────────
  let message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  if (process.env.GEMINI_API_KEY) {
    try {
      const res  = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text:
              'Write a short gym reminder text message (1-2 sentences, max 100 characters). '
            + 'Be energetic and motivating. Include one fitness emoji. No quotation marks.',
            }] }],
            generationConfig: { maxOutputTokens: 80 },
          }),
        }
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) message = text;
    } catch (err) {
      console.error('Gemini failed, using built-in message:', err.message);
    }
  }

  // ── Send SMS via TextBelt ─────────────────────────────────────────────────
  // Free key "textbelt" = 1 SMS/day at no cost, no account required.
  // Set TEXTBELT_KEY to a purchased key for unlimited sends ($0.01/text).
  const key = process.env.TEXTBELT_KEY || 'textbelt';

  const tbRes  = await fetch('https://textbelt.com/text', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message, key }),
  });
  const tbData = await tbRes.json();

  if (!tbData.success) {
    const hint = tbData.quotaRemaining === 0
      ? 'Daily free quota used up. Buy a TextBelt key at textbelt.com for $0.01/text.'
      : tbData.error || 'TextBelt returned an error.';
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: hint }),
    };
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      sent:           true,
      message,
      quotaRemaining: tbData.quotaRemaining,
    }),
  };
};
