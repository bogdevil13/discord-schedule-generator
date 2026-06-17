export interface TimeFormat {
	name: string;
	label: string;
	example12hr: string;
	example24hr: string;
	formatCharacter: string;
}

export interface DayConfig {
	name: string;
	time: string;
	category: string;
}

export interface UserConfig {
	titleTemplate: string;
	streamTemplate: string;
}

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TIME_FORMATS: TimeFormat[] = [
	{ name: 'shortTime', label: 'Short Time', example12hr: '9:01 AM', example24hr: '09:01', formatCharacter: 't' },
	{ name: 'longTime', label: 'Long Time', example12hr: '9:01:00 AM', example24hr: '09:01:00', formatCharacter: 'T' },
	{ name: 'shortDate', label: 'Short Date', example12hr: '20/04/2021', example24hr: '20/04/2021', formatCharacter: 'd' },
	{ name: 'longDate', label: 'Long Date', example12hr: 'April 20, 2021', example24hr: '20 April 2021', formatCharacter: 'D' },
	{ name: 'shortDateTime', label: 'Short Date/Time', example12hr: 'April 20, 2021 9:01 AM', example24hr: '20 April 2021 09:01', formatCharacter: 'f' },
	{ name: 'longDateTime', label: 'Long Date/Time', example12hr: 'Tuesday, April 20, 2021 9:01 AM', example24hr: 'Tuesday, 20 April 2021 09:01', formatCharacter: 'F' },
	{ name: 'relativeTime', label: 'Relative Time', example12hr: '2 months ago', example24hr: '2 months ago', formatCharacter: 'R' },
	{ name: 'counter', label: 'Counter (#)', example12hr: '', example24hr: '', formatCharacter: '' },
	{ name: 'category', label: 'Category', example12hr: '', example24hr: '', formatCharacter: '' }
];

export const DEFAULT_CONFIG: UserConfig = {
	titleTemplate: '**Schedule**',
	streamTemplate: '#<<counter>>. <<longDateTime>> (<<relativeTime>>) : <<category>>'
};

export function getConfig(): UserConfig {
	if (typeof localStorage === 'undefined') return DEFAULT_CONFIG;
	try {
		const stored = localStorage.getItem('userConfigs');
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				titleTemplate: parsed.titleTemplate || DEFAULT_CONFIG.titleTemplate,
				streamTemplate: parsed.streamTemplate || DEFAULT_CONFIG.streamTemplate
			};
		}
	} catch {
		// ignore
	}
	return DEFAULT_CONFIG;
}

export function setToLastMonday(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay(); // 0=Sun, 1=Mon...
	const diff = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function addDaysToDate(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

export function getInputFormattedDate(date: Date): string {
	const offset = date.getTimezoneOffset();
	const adjusted = new Date(date.getTime() - offset * 60 * 1000);
	return adjusted.toISOString().split('T')[0];
}

export function nextMonday(): Date {
	const today = new Date();
	const day = today.getDay();
	const daysUntilMonday = day === 0 ? 1 : 8 - day;
	const next = new Date(today);
	next.setDate(today.getDate() + daysUntilMonday);
	next.setHours(0, 0, 0, 0);
	return next;
}

export function generateDiscordLine(date: Date, counter: number, category: string, template: string): string {
	const epoch = Math.floor(date.getTime() / 1000);

	let line = template;
	for (const fmt of TIME_FORMATS) {
		if (fmt.formatCharacter) {
			line = line.replaceAll(`<<${fmt.name}>>`, `<t:${epoch}:${fmt.formatCharacter}>`);
		}
	}
	line = line.replaceAll('<<counter>>', String(counter));
	line = line.replaceAll('<<category>>', category);
	return line;
}
