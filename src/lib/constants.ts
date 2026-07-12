export const WORKOUT_TYPES = ['strength', 'cardio', 'flexibility', 'calisthenics', 'other'] as const;
export const WORKOUT_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'other'] as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[number];
export type WorkoutDifficulty = (typeof WORKOUT_DIFFICULTIES)[number];

export const WORKOUT_TYPE_OPTIONS: ReadonlyArray<{ value: WorkoutType; label: string }> = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'calisthenics', label: 'Calisthenics' },
  { value: 'other', label: 'Other' },
];

export const WORKOUT_DIFFICULTY_OPTIONS: ReadonlyArray<{ value: WorkoutDifficulty; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'other', label: 'Other' },
];

export const WORKOUT_TYPE_FILTER_OPTIONS: ReadonlyArray<{ value: WorkoutType | null; label: string }> = [
  { value: null, label: 'All' },
  ...WORKOUT_TYPE_OPTIONS,
];

export const WORKOUT_DIFFICULTY_FILTER_OPTIONS: ReadonlyArray<{ value: WorkoutDifficulty | null; label: string }> = [
  { value: null, label: 'All' },
  ...WORKOUT_DIFFICULTY_OPTIONS,
];

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const ESTIMATED_MINUTES_PER_EXERCISE = 12;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Usernames map to top-level `/[username]` routes, so any of these would either
// shadow (or be shadowed by) a real route or a reserved system path. Keep this
// list in sync with the `profiles_username_check` DB constraint in
// supabase/migrations/*_expand_reserved_usernames.sql.
export const RESERVED_USERNAMES: readonly string[] = [
  // Current top-level routes
  'account', 'api', 'auth', 'browse', 'login', 'new', 'privacy', 'terms',
  // Auth & session flows
  'signup', 'signin', 'signout', 'logout', 'register', 'callback', 'oauth',
  'sso', 'verify', 'reset', 'password',
  // Admin & system
  'admin', 'settings', 'config', 'dashboard', 'dev', 'internal', 'system', 'root',
  // Static & infrastructure
  'static', 'assets', 'public', 'www', 'cdn', 'media', 'files', 'images', 'img',
  'favicon', 'robots', 'sitemap',
  // Product & marketing
  'about', 'help', 'support', 'contact', 'faq', 'pricing', 'blog', 'docs',
  'status', 'home', 'index', 'explore', 'search', 'feed', 'discover',
  // User-space aliases
  'me', 'user', 'users', 'profile', 'profiles',
  // Legal & meta
  'legal', 'cookies', 'security',
] as const;

export const isReservedUsername = (value: string): boolean =>
  RESERVED_USERNAMES.includes(value.toLowerCase());

export const isWorkoutType = (value: string): value is WorkoutType => WORKOUT_TYPES.includes(value as WorkoutType);

export const isWorkoutDifficulty = (value: string): value is WorkoutDifficulty =>
  WORKOUT_DIFFICULTIES.includes(value as WorkoutDifficulty);
