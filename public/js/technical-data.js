// Single source of truth for technical event details, shared by the
// listing page and the detail page. Icons are hand-authored line-art SVGs
// (no external assets, no copyright risk) themed to the site's gold/navy palette.
const TECH_EVENTS = [
  {
    slug: 'code-sprint', name: 'Code Sprint', sub: 'Solo', max: 1,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="12" width="48" height="30" rx="2"/>
      <path d="M4 48h56l-4 6H8z"/>
      <path d="M20 21l-7 6 7 6M32 21l7 6-7 6M28 19l-4 16"/>
    </svg>`,
    tagline: 'Showcase your coding and logic skills against the clock.',
    date: '21st Aug 2025', time: '10:00 AM &ndash; 12:00 PM', venue: 'Digital Lab', fee: '&#8377;150 / Participant',
    rules: [
      'Individual participation only &mdash; no teams.',
      'Allowed languages: C, C++, Java, Python.',
      'Duration: 90 minutes across 2&ndash;3 problems.',
      'Only offline/official language documentation is allowed &mdash; no internet access.',
      'Any form of plagiarism leads to immediate disqualification.',
      'Participants must bring their own laptop with the required compiler/IDE installed.'
    ]
  },
  {
    slug: 'debug-olympiad', name: 'Debug Olympiad', sub: 'Solo', max: 1,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="28" cy="36" rx="10" ry="14"/>
      <path d="M28 22v-6M20 26l-6-6M36 26l6-6M16 36h-8M48 36h-8M20 46l-6 6M36 46l6 6"/>
      <circle cx="46" cy="18" r="8"/>
      <path d="M52 24l6 6"/>
    </svg>`,
    tagline: 'Test your debugging and problem-solving speed.',
    date: '21st Aug 2025', time: '01:00 PM &ndash; 03:00 PM', venue: 'Digital Lab', fee: '&#8377;150 / Participant',
    rules: [
      'Individual participation only &mdash; no teams.',
      'Fix bugs in given code snippets against the clock.',
      'Multiple rounds with increasing difficulty.',
      'Fastest correct submissions win.',
      'Calculators and AI coding assistants are not allowed.',
      'Judges&rsquo; decisions on scoring are final.'
    ]
  },
  {
    slug: 'pair-programming', name: 'Pair Programming', sub: 'Duo', max: 2,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="16" r="6"/>
      <path d="M10 34c0-8 6-12 10-12s10 4 10 12"/>
      <circle cx="44" cy="16" r="6"/>
      <path d="M34 34c0-8 6-12 10-12s10 4 10 12"/>
      <rect x="12" y="40" width="40" height="14" rx="2"/>
    </svg>`,
    tagline: 'Team up and build a working feature under pressure.',
    date: '21st Aug 2025', time: '10:00 AM &ndash; 01:00 PM', venue: 'Digital Lab', fee: '&#8377;250 / Team',
    rules: [
      'Team size: exactly 2 participants.',
      'One shared system, driver&ndash;navigator format &mdash; swap roles every 15 minutes.',
      'Build a working feature from a given spec within the time limit.',
      'Judged on functionality, code quality, and collaboration.',
      'Both teammates must be present at check-in.'
    ]
  },
  {
    slug: 'uiux-sprint', name: 'UI/UX Design Sprint', sub: 'Duo', max: 2,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="8" width="34" height="34" rx="2"/>
      <path d="M8 20h34M20 8v34"/>
      <path d="M40 40l14 14M54 54l-3 7-4-4z"/>
    </svg>`,
    tagline: 'Design a polished screen against a real-world brief.',
    date: '21st Aug 2025', time: '02:00 PM &ndash; 05:00 PM', venue: 'Digital Lab', fee: '&#8377;250 / Team',
    rules: [
      'Team size: exactly 2 participants.',
      'Design a mobile or web app screen for a given brief.',
      'Tools allowed: Figma, Adobe XD, or Canva.',
      'Submit a shareable prototype link before time runs out.',
      'Judged on usability, visual design, and creativity.'
    ]
  },
  {
    slug: 'data-duel', name: 'Data Duel', sub: 'Duo', max: 2,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 54V30M24 54V18M38 54V38M52 54V24"/>
      <path d="M8 54h48"/>
    </svg>`,
    tagline: 'Crunch a dataset and defend your insights.',
    date: '22nd Aug 2025', time: '10:00 AM &ndash; 12:30 PM', venue: 'Digital Lab', fee: '&#8377;250 / Team',
    rules: [
      'Team size: exactly 2 participants.',
      'Analyze a provided dataset and answer challenge questions.',
      'Tools allowed: Excel, Python, or SQL.',
      'Submit findings as a short written report.',
      'Judged on accuracy, depth of insight, and clarity of presentation.'
    ]
  },
  {
    slug: 'project-expo', name: 'Project Expo', sub: 'Team', max: 4,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="20" r="12"/>
      <path d="M26 32h12M28 38h8M24 8l-4-4M40 8l4-4M12 20H6M58 20h-6"/>
      <path d="M20 54h24l-4-10H24z"/>
    </svg>`,
    tagline: 'Present your innovative project to a panel of experts.',
    date: '22nd Aug 2025', time: '10:00 AM &ndash; 04:00 PM', venue: 'Seminar Hall', fee: '&#8377;400 / Team',
    rules: [
      'Team size: up to 4 participants.',
      'Present a working project or prototype (hardware or software).',
      '5-minute pitch followed by a 3-minute Q&amp;A with judges.',
      'Teams must bring their own display/demo setup.',
      'Judged on innovation, execution, and presentation.'
    ]
  },
  {
    slug: 'hackathon', name: 'Hackathon', sub: 'Team', max: 4,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="12" width="48" height="30" rx="2"/>
      <path d="M4 48h56l-4 6H8z"/>
      <path d="M36 18L24 32h8l-4 12 14-16h-8z"/>
    </svg>`,
    tagline: 'Build a solution to a live problem statement.',
    date: '22nd Aug 2025', time: '09:00 AM &ndash; 03:00 PM', venue: 'Innovation Lab', fee: '&#8377;500 / Team',
    rules: [
      'Team size: up to 4 participants.',
      'Problem statements are revealed on the day of the event.',
      'Any tech stack is allowed.',
      'Submit your code repository and a short demo video at the end.',
      'Judged on innovation, technical execution, and real-world impact.'
    ]
  },
  {
    slug: 'tech-quiz', name: 'Tech Quiz', sub: 'Team', max: 4,
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="22"/>
      <path d="M25 24a7 7 0 1 1 10 6c-3 2-3 4-3 7"/>
      <circle cx="32" cy="45" r="1" fill="currentColor" stroke="none"/>
    </svg>`,
    tagline: 'Race through rounds of CS fundamentals and current tech.',
    date: '22nd Aug 2025', time: '04:30 PM &ndash; 06:00 PM', venue: 'Seminar Hall', fee: '&#8377;200 / Team',
    rules: [
      'Team size: up to 4 participants.',
      'Multiple rounds: CS fundamentals, current tech, and rapid fire.',
      'No electronic devices allowed during the quiz.',
      'Top 3 teams qualify for the final round.',
      'Quizmaster&rsquo;s decision is final in case of a dispute.'
    ]
  }
];
