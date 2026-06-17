export type Theme = 'dark' | 'light' | 'auto';

export function getTheme(): Theme {
	if (typeof localStorage === 'undefined') return 'auto';
	return (localStorage.getItem('theme') as Theme) ?? 'auto';
}

export function applyTheme(theme: Theme) {
	const root = document.documentElement;
	if (theme === 'auto') {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
	} else {
		root.setAttribute('data-theme', theme);
	}
}

export function saveTheme(theme: Theme) {
	try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
	applyTheme(theme);
}
