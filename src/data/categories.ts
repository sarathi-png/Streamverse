export interface CategoryOption {
  label: string;
  value: string;
}

export interface CategoryGroup {
  section: 'genre' | 'language' | 'year' | 'dubbed' | 'adult';
  label: string;
  items: CategoryOption[];
}

export const GENRE_OPTIONS: CategoryOption[] = [
  { label: 'Action', value: '28' },
  { label: 'Adventure', value: '12' },
  { label: 'Animation', value: '16' },
  { label: 'Comedy', value: '35' },
  { label: 'Crime', value: '80' },
  { label: 'Documentary', value: '99' },
  { label: 'Drama', value: '18' },
  { label: 'Family', value: '10751' },
  { label: 'Fantasy', value: '14' },
  { label: 'History', value: '36' },
  { label: 'Horror', value: '27' },
  { label: 'Music', value: '10402' },
  { label: 'Mystery', value: '9648' },
  { label: 'Romance', value: '10749' },
  { label: 'Science Fiction', value: '878' },
  { label: 'Thriller', value: '53' },
  { label: 'War', value: '10752' },
  { label: 'Western', value: '37' },
];

export const LANGUAGE_OPTIONS: CategoryOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
];

export const YEAR_OPTIONS: CategoryOption[] = [
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2020s', value: '2020' },
  { label: '2010s', value: '2010' },
  { label: '2000s', value: '2000' },
  { label: '1990s', value: '1990' },
  { label: '1980s', value: '1980' },
];

export const ADULT_OPTIONS: CategoryOption[] = [
  { label: 'Show 18+', value: 'true' },
  { label: 'Hide 18+', value: 'false' },
];

export const DUBBED_OPTIONS: CategoryOption[] = [
  { label: 'English Dubbed', value: 'en' },
  { label: 'Hindi Dubbed', value: 'hi' },
  { label: 'Spanish Dubbed', value: 'es' },
  { label: 'French Dubbed', value: 'fr' },
  { label: 'Japanese Dubbed', value: 'ja' },
  { label: 'Korean Dubbed', value: 'ko' },
  { label: 'German Dubbed', value: 'de' },
  { label: 'Italian Dubbed', value: 'it' },
  { label: 'Portuguese Dubbed', value: 'pt' },
  { label: 'Russian Dubbed', value: 'ru' },
  { label: 'Arabic Dubbed', value: 'ar' },
  { label: 'Tamil Dubbed', value: 'ta' },
  { label: 'Telugu Dubbed', value: 'te' },
  { label: 'Turkish Dubbed', value: 'tr' },
  { label: 'Chinese Dubbed', value: 'zh' },
];

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { section: 'genre', label: 'Genres', items: GENRE_OPTIONS },
  { section: 'language', label: 'Language', items: LANGUAGE_OPTIONS },
  { section: 'dubbed', label: 'Dubbed In', items: DUBBED_OPTIONS },
  { section: 'year', label: 'Year', items: YEAR_OPTIONS },
  { section: 'adult', label: '18+', items: ADULT_OPTIONS },
];

export function buildBrowseURL(
  section: string,
  value: string,
  type: string = 'movie',
  currentParams?: URLSearchParams
): string {
  const params = currentParams
    ? new URLSearchParams(currentParams)
    : new URLSearchParams();
  params.set('type', type);
  if (section === 'genre') params.set('genre', value);
  else if (section === 'language') params.set('language', value);
  else if (section === 'year') params.set('year', value);
  else if (section === 'dubbed') params.set('dubbed', value);
  else if (section === 'adult') params.set('adult', value);
  params.set('page', '1');
  return `/browse?${params.toString()}`;
}
