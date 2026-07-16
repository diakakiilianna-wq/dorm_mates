// 21-question compatibility quiz across 6 axes. Order interleaved so no two
// consecutive questions share an axis (question 8 lands on "noise", matching
// the reference mockup's "Question 8 of 21 — Noise tolerance" screen).

// `low`/`high` describe what a small vs. large score on each axis means, shown
// as an at-a-glance bubble under the weight sliders so people understand what
// they're prioritizing. Directions match the quiz option values (5 = high).
export const AXES = [
  { key: 'clean', label: 'Cleaning', low: 'Relaxed about mess', high: 'Very tidy', defaultWeight: 0.25 },
  { key: 'sleep', label: 'Sleep', low: 'Erratic is fine', high: 'Consistent schedule', defaultWeight: 0.20 },
  { key: 'noise', label: 'Noise', low: 'Needs quiet', high: 'Fine with noise', defaultWeight: 0.20 },
  { key: 'social', label: 'Socializing', low: 'Keeps to themselves', high: 'Very social', defaultWeight: 0.15 },
  { key: 'conflict', label: 'Conflict', low: 'Avoids confrontation', high: 'Addresses head-on', defaultWeight: 0.10 },
  { key: 'structure', label: 'Household rules', low: 'Go with the flow', high: 'Likes clear systems', defaultWeight: 0.10 },
];

export const DEFAULT_WEIGHTS = Object.fromEntries(AXES.map(a => [a.key, a.defaultWeight]));

export const QUESTIONS = [
  { id: 'q1', axis: 'clean', prompt: 'How do you feel about doing dishes right after you use them?', options: [
    { label: 'I wash immediately, always', value: 5 },
    { label: 'Same day, usually', value: 4 },
    { label: 'They can sit for a day or two', value: 2 },
    { label: 'Whenever I get around to it', value: 1 },
  ]},
  { id: 'q2', axis: 'social', prompt: 'How much do you want to hang out with your roommate day-to-day?', options: [
    { label: 'Best friends, doing lots together', value: 5 },
    { label: 'Friendly and social, but with our own lives too', value: 4 },
    { label: 'Friendly in passing, mostly separate lives', value: 2 },
    { label: 'Cordial roommates, that’s it', value: 1 },
  ]},
  { id: 'q3', axis: 'sleep', prompt: 'What time do you usually wake up on a typical weekday?', options: [
    { label: 'Before 7:00 AM', value: 5 },
    { label: '7:00 – 9:00 AM', value: 4 },
    { label: '9:00 – 11:00 AM', value: 3 },
    { label: 'After 11:00 AM', value: 1 },
  ]},
  { id: 'q4', axis: 'conflict', prompt: 'A roommate does something that bugs you. What’s your instinct?', options: [
    { label: 'Bring it up right away, directly', value: 5 },
    { label: 'Mention it soon, but gently', value: 4 },
    { label: 'Let it go unless it happens a lot', value: 2 },
    { label: 'Avoid the conversation and hope it stops', value: 1 },
  ]},
  { id: 'q5', axis: 'social', prompt: 'How often do you like having guests over?', options: [
    { label: 'Often — my place is a hangout spot', value: 5 },
    { label: 'Sometimes, a few times a month', value: 4 },
    { label: 'Rarely, I prefer it quiet', value: 2 },
    { label: 'Basically never', value: 1 },
  ]},
  { id: 'q6', axis: 'structure', prompt: 'How do you feel about a written roommate agreement (chores, guests, quiet hours)?', options: [
    { label: 'Love it, clear expectations are great', value: 5 },
    { label: 'Fine with a simple one', value: 4 },
    { label: 'Prefer to just wing it', value: 2 },
    { label: 'Rules like that feel unnecessary', value: 1 },
  ]},
  { id: 'q7', axis: 'clean', prompt: 'It’s been a week and your room hasn’t been tidied. How does that sit with you?', options: [
    { label: 'Unbearable — I’d have cleaned days ago', value: 5 },
    { label: 'A little uncomfortable', value: 4 },
    { label: 'Doesn’t really bother me', value: 2 },
    { label: 'A week is nothing, I barely notice', value: 1 },
  ]},
  { id: 'q8', axis: 'noise', prompt: 'Your roommate blasts music while you’re trying to focus. You…', options: [
    { label: 'Put in headphones, it’s not a big deal', value: 5 },
    { label: 'Ask them nicely to turn it down', value: 3 },
    { label: 'Feel annoyed but say nothing', value: 2 },
    { label: 'It genuinely ruins my focus for the day', value: 1 },
  ]},
  { id: 'q9', axis: 'social', prompt: 'Would you want to grab meals or cook together regularly?', options: [
    { label: 'Yes, that sounds great', value: 5 },
    { label: 'Occasionally, sure', value: 4 },
    { label: 'Not really my thing', value: 2 },
    { label: 'I keep meals totally separate', value: 1 },
  ]},
  { id: 'q10', axis: 'sleep', prompt: 'Your roommate comes home and gets ready for bed while you’re already asleep. How big a deal is this?', options: [
    { label: 'No big deal, I sleep through anything', value: 5 },
    { label: 'A little disruptive but I fall back asleep fine', value: 4 },
    { label: 'Wakes me up and it’s hard to get back to sleep', value: 2 },
    { label: 'This would seriously mess with my sleep', value: 1 },
  ]},
  { id: 'q11', axis: 'structure', prompt: 'How do you like splitting shared costs (utilities, supplies)?', options: [
    { label: 'A clear system, tracked and split evenly', value: 5 },
    { label: 'Roughly even, doesn’t need to be exact', value: 4 },
    { label: 'We’ll figure it out as it comes up', value: 2 },
    { label: 'Prefer to keep it loose and informal', value: 1 },
  ]},
  { id: 'q12', axis: 'social', prompt: 'How do you feel about sharing things like snacks, kitchen supplies, or a TV?', options: [
    { label: 'Happy to share almost everything', value: 5 },
    { label: 'Some shared stuff is fine', value: 4 },
    { label: 'I’d rather keep most things separate', value: 2 },
    { label: 'Everything separate, please', value: 1 },
  ]},
  { id: 'q13', axis: 'clean', prompt: 'Shared spaces (kitchen, bathroom) after a long day — what’s realistic for you?', options: [
    { label: 'Wipe down and reset before bed, no exceptions', value: 5 },
    { label: 'Clean up most of it, might leave small things', value: 4 },
    { label: 'I’ll get to it eventually', value: 2 },
    { label: 'Honestly, it can wait until it’s really bad', value: 1 },
  ]},
  { id: 'q14', axis: 'conflict', prompt: 'How do you handle it when you’re the one who messed up (broke something, forgot a chore)?', options: [
    { label: 'Own it immediately and fix it', value: 5 },
    { label: 'Apologize and sort it out soon', value: 4 },
    { label: 'Feel bad about it but might not bring it up', value: 2 },
    { label: 'Tend to avoid addressing it directly', value: 1 },
  ]},
  { id: 'q15', axis: 'noise', prompt: 'How do you feel about background noise (TV, music, calls) while you’re trying to relax at home?', options: [
    { label: 'Doesn’t bother me at all', value: 5 },
    { label: 'Fine in moderation', value: 4 },
    { label: 'I need it pretty quiet to relax', value: 2 },
    { label: 'I need near-silence to unwind', value: 1 },
  ]},
  { id: 'q16', axis: 'social', prompt: 'If your roommate is going through something hard, how involved do you want to be?', options: [
    { label: 'Very — I want to be there for them', value: 5 },
    { label: 'Supportive, but I’d give them space too', value: 4 },
    { label: 'I’d check in but keep some distance', value: 2 },
    { label: 'I’d rather keep things light and separate', value: 1 },
  ]},
  { id: 'q17', axis: 'sleep', prompt: 'How do you feel about a roommate whose sleep schedule is the total opposite of yours?', options: [
    { label: 'Totally fine, we just work around it', value: 5 },
    { label: 'Manageable with a little communication', value: 4 },
    { label: 'Would create real friction', value: 2 },
    { label: 'Dealbreaker for me', value: 1 },
  ]},
  { id: 'q18', axis: 'clean', prompt: 'How do you feel about a roommate who leaves dishes in the sink overnight?', options: [
    { label: 'It would genuinely stress me out', value: 5 },
    { label: 'Mildly annoying, but I’d let it go once', value: 4 },
    { label: 'Wouldn’t really register for me', value: 2 },
    { label: 'Totally fine, we all get busy', value: 1 },
  ]},
  { id: 'q19', axis: 'structure', prompt: 'Chores — what’s your style?', options: [
    { label: 'A set schedule or rotation we stick to', value: 5 },
    { label: 'General understanding of who does what', value: 4 },
    { label: 'Whoever notices it needs doing, does it', value: 2 },
    { label: 'No real system, it works out', value: 1 },
  ]},
  { id: 'q20', axis: 'conflict', prompt: 'In a disagreement, what’s more you?', options: [
    { label: 'Talk it through until it’s actually resolved', value: 5 },
    { label: 'Find a practical compromise quickly', value: 4 },
    { label: 'Let it cool off before saying anything', value: 2 },
    { label: 'Avoid confrontation as much as possible', value: 1 },
  ]},
  { id: 'q21', axis: 'noise', prompt: 'A roommate wants to have friends over who’ll be loud until late on a weeknight. Your honest reaction?', options: [
    { label: 'No problem, more the merrier', value: 5 },
    { label: 'Fine occasionally, with a heads up', value: 4 },
    { label: 'I’d be pretty bothered on a weeknight', value: 2 },
    { label: 'That would really upset me', value: 1 },
  ]},
];
