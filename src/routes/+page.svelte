<script lang="ts">
	import { onMount } from 'svelte';
	import {
		WEEKDAYS,
		getConfig,
		setToLastMonday,
		addDaysToDate,
		getInputFormattedDate,
		nextMonday,
		generateDiscordLine
	} from '$lib/constants';

	interface Slot {
		time: string;
		category: string;
		editing?: boolean;
	}

	interface Day {
		name: string;
		slots: Slot[];
	}

	function emptyDay(name: string): Day {
		return { name, slots: [{ time: '', category: '' }] };
	}

	let weekDate = $state(nextMonday());
	let weekDateStr = $state(getInputFormattedDate(nextMonday()));
	let days: Day[] = $state(WEEKDAYS.map(emptyDay));
	let output = $state('');
	let copyHint = $state('');
	let showOutput = $state(false);

	function addSlot(dayIndex: number) {
		const slots = days[dayIndex].slots;
		// Search: current day first, then backwards, then wrap to end of week
		let last: Slot | undefined;
		const searchOrder = [
			dayIndex,
			...Array.from({ length: days.length - 1 }, (_, i) => (dayIndex - 1 - i + days.length) % days.length)
		];
		for (const di of searchOrder) {
			last = [...days[di].slots].reverse().find(s => s.time);
			if (last) break;
		}
		days[dayIndex].slots = [...slots, { time: last?.time ?? '', category: last?.category ?? '', editing: true }];
	}

	function removeSlot(dayIndex: number, slotIndex: number) {
		days[dayIndex].slots = days[dayIndex].slots.filter((_, i) => i !== slotIndex);
	}

	function setSlotTime(dayIndex: number, slotIndex: number, value: string) {
		days[dayIndex].slots[slotIndex] = { ...days[dayIndex].slots[slotIndex], time: value, editing: false };
	}

	function setSlotCategory(dayIndex: number, slotIndex: number, value: string) {
		days[dayIndex].slots[slotIndex] = { ...days[dayIndex].slots[slotIndex], category: value };
	}

	function onWeekDateChange(value: string) {
		if (!value) {
			weekDate = nextMonday();
			weekDateStr = getInputFormattedDate(weekDate);
			return;
		}
		const parts = value.split('-').map(Number);
		const raw = new Date(parts[0], parts[1] - 1, parts[2]);
		const monday = setToLastMonday(raw);
		weekDate = monday;
		weekDateStr = getInputFormattedDate(monday);
	}

	async function generate() {
		const config = getConfig();
		const lines: string[] = [config.titleTemplate];
		let counter = 1;

		for (let di = 0; di < days.length; di++) {
			const day = days[di];
			const activeSlots = day.slots.filter((s) => s.time);
			if (activeSlots.length === 0) continue;

			const baseDay = addDaysToDate(weekDate, di);

			for (const slot of activeSlots) {
				const [hours, minutes] = slot.time.split(':').map(Number);
				const slotDate = new Date(baseDay);
				slotDate.setHours(hours, minutes, 0, 0);
				lines.push(generateDiscordLine(slotDate, counter++, slot.category, config.streamTemplate));
			}
		}

		output = lines.join('\n');
		showOutput = true;

		try {
			await navigator.clipboard.writeText(output);
			copyHint = 'Copied to clipboard!';
		} catch {
			copyHint = 'Could not auto-copy — please copy manually.';
		}

		setTimeout(() => (copyHint = ''), 3000);
		saveSchedule();
	}

	function saveSchedule() {
		try {
			localStorage.setItem(
				'schedule',
				JSON.stringify(days.map((d) => ({ name: d.name, slots: d.slots })))
			);
		} catch {
			// ignore
		}
	}

	onMount(() => {
		try {
			const stored = localStorage.getItem('schedule');
			if (stored) {
				const saved = JSON.parse(stored) as { name: string; slots?: Slot[]; time?: string; category?: string }[];
				days = WEEKDAYS.map((name, i) => {
					const entry = saved[i];
					if (!entry) return emptyDay(name);
					if (entry.slots) return { name, slots: entry.slots.length ? entry.slots : [{ time: '', category: '' }] };
					if (entry.time) return { name, slots: [{ time: entry.time, category: entry.category ?? '' }] };
					return emptyDay(name);
				});
			}
		} catch {
			// ignore
		}
	});
</script>

<svelte:head>
	<title>Discord Schedule Generator</title>
</svelte:head>

<div class="page">
	<header>
		<h1>Schedule Generator for Discord</h1>
	</header>

	<main>
		<section class="week-selector card">
			<label for="week-date">Select the week you want to generate the schedule for</label>
			<input
				id="week-date"
				type="date"
				value={weekDateStr}
				oninput={(e) => onWeekDateChange((e.target as HTMLInputElement).value)}
			/>
		</section>

		<div class="days-grid">
			{#each days as day, di}
				<div class="day-card card">
					<div class="day-header">
						<span class="day-name">{day.name}</span>
						<button class="btn-add-slot" onclick={() => addSlot(di)}>+ Add Slot</button>
					</div>
					<div class="slots">
						{#each day.slots as slot, si}
							{#if slot.time || slot.editing}
								<div class="slot-row" class:has-time={!!slot.time}>
									<span class="slot-num">#{si + 1}</span>
									<input
										type="time"
										value={slot.time}
										oninput={(e) => setSlotTime(di, si, (e.target as HTMLInputElement).value)}
										onblur={(e) => { if (!(e.target as HTMLInputElement).value) removeSlot(di, si); }}
										onfocus={(e) => { try { (e.target as HTMLInputElement).showPicker?.(); } catch { /* ignore */ } }}
									/>
									<input
										type="text"
										placeholder="Category / Description"
										value={slot.category}
										disabled={!slot.time}
										oninput={(e) => setSlotCategory(di, si, (e.target as HTMLInputElement).value)}
									/>
									<button class="btn-remove-slot" onclick={() => removeSlot(di, si)} title="Remove slot" aria-label="Remove slot">✕</button>
								</div>
							{/if}
						{/each}
						{#if !day.slots.some(s => s.time || s.editing)}
							<p class="no-slots">No slots — click <strong>+ Add Slot</strong> to schedule.</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<section class="generate-section">
			<button class="btn-primary" onclick={generate}>Generate Discord Message</button>
			{#if copyHint}
				<p class="copy-hint">{copyHint}</p>
			{/if}
		</section>

		{#if showOutput}
			<section class="output-card card">
				<label for="output">Generated Message</label>
				<textarea id="output" rows={10} readonly>{output}</textarea>
			</section>
		{/if}
	</main>

	<footer>
		<a href="/" class="btn-footer active">Generator</a>
		<a href="/config" class="btn-footer">⚙ Configurations</a>
		<a href="https://github.com/bogdevil13/discord-schedule-generator" target="_blank" rel="noopener noreferrer" class="btn-footer">Source</a>
	</footer>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-base);
		color: var(--text-primary);
		font-family: 'Segoe UI', system-ui, sans-serif;
	}

	header {
		background: var(--bg-surface);
		padding: 1.25rem 2rem;
		border-bottom: 1px solid var(--border);
	}

	h1 {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--text-strong);
		text-align: center;
		border: 2px solid var(--accent);
		display: inline-block;
		padding: 0.4rem 1.5rem;
		border-radius: 999px;
		width: 100%;
		box-sizing: border-box;
	}

	main {
		flex: 1;
		padding: 1.5rem 1rem;
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.card {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.25rem;
	}

	.week-selector {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.week-selector label {
		flex: 1;
		min-width: 200px;
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	.week-selector input[type='date'] {
		background: var(--bg-input);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.4rem 0.75rem;
		font-size: 0.95rem;
	}

	.days-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 0.85rem;
	}

	.day-card {
		padding: 0.85rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.day-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.day-name {
		font-weight: 700;
		font-size: 1rem;
		color: var(--text-heading);
		letter-spacing: 0.02em;
	}

	.btn-add-slot {
		background: var(--color-green);
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.25rem 0.65rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-add-slot:hover { background: var(--color-green-hover); }

	.slots {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.no-slots {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin: 0.15rem 0 0;
		font-style: italic;
	}

	.slot-row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.35rem 0.5rem;
		border-radius: 5px;
		background: var(--bg-row-alt);
		border: 1px solid transparent;
		transition: border-color 0.15s, background 0.15s;
	}

	.slot-row.has-time {
		background: var(--bg-row-active);
		border-color: var(--border-active);
	}

	.slot-num {
		font-size: 0.75rem;
		color: var(--accent);
		font-weight: 700;
		min-width: 1.4rem;
		text-align: center;
	}

	input[type='time'],
	input[type='text'] {
		background: var(--bg-input);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 5px;
		padding: 0.3rem 0.5rem;
		font-size: 0.88rem;
	}

	input[type='time'] { flex-shrink: 0; }

	input[type='text'] {
		flex: 1;
		min-width: 0;
	}

	input:disabled { opacity: 0.35; cursor: not-allowed; }
	input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }

	.btn-remove-slot {
		background: transparent;
		color: var(--text-secondary);
		border: none;
		border-radius: 4px;
		width: 1.5rem;
		height: 1.5rem;
		font-size: 0.75rem;
		cursor: pointer;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, color 0.15s;
	}

	.btn-remove-slot:hover { background: var(--color-red); color: #fff; }

	.generate-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 6px;
		padding: 0.65rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary:hover { background: var(--accent-hover); }

	.copy-hint { color: var(--color-green); font-size: 0.9rem; margin: 0; }

	.output-card { display: flex; flex-direction: column; gap: 0.5rem; }

	.output-card label {
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	textarea {
		background: var(--bg-output);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.75rem;
		font-family: 'Consolas', 'Courier New', monospace;
		font-size: 0.9rem;
		width: 100%;
		box-sizing: border-box;
		resize: vertical;
	}

	footer {
		background: var(--bg-surface);
		border-top: 1px solid var(--border);
		padding: 0.75rem 1rem;
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.btn-footer {
		background: var(--bg-elevated);
		color: var(--text-secondary);
		text-decoration: none;
		border-radius: 6px;
		padding: 0.4rem 1rem;
		font-size: 0.9rem;
		transition: background 0.15s;
	}

	.btn-footer:hover,
	.btn-footer.active {
		background: var(--accent);
		color: #fff;
	}
</style>
