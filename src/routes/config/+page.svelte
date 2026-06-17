<script lang="ts">
	import { onMount } from 'svelte';
	import {
		TIME_FORMATS,
		DEFAULT_CONFIG,
		getConfig,
		generateDiscordLine,
		nextMonday
	} from '$lib/constants';
	import { getTheme, saveTheme, type Theme } from '$lib/theme';

	let titleTemplate = $state(DEFAULT_CONFIG.titleTemplate);
	let streamTemplate = $state(DEFAULT_CONFIG.streamTemplate);
	let saveMessage = $state('');
	let theme = $state<Theme>('auto');

	const PREVIEW_CATEGORIES = ['Gaming', 'Just Chatting', 'Music', 'Art'];
	const PREVIEW_BASE = (() => { const d = nextMonday(); d.setHours(9, 0, 0, 0); return d; })();

	function previewLines(): string[] {
		if (!titleTemplate && !streamTemplate) return [];
		const lines = [titleTemplate || '**Schedule**'];
		for (let i = 0; i < 4; i++) {
			const day = new Date(PREVIEW_BASE);
			day.setDate(day.getDate() + i);
			const tmpl = streamTemplate || DEFAULT_CONFIG.streamTemplate;
			lines.push(generateDiscordLine(day, i + 1, PREVIEW_CATEGORIES[i], tmpl));
		}
		return lines;
	}

	function appendToken(token: string) {
		streamTemplate = streamTemplate + ` <<${token}>>`;
	}

	function removeToken(token: string) {
		const tag = `<<${token}>>`;
		const idx = streamTemplate.lastIndexOf(tag);
		if (idx !== -1) {
			streamTemplate = streamTemplate.slice(0, idx) + streamTemplate.slice(idx + tag.length);
		}
	}

	function save() {
		try {
			const config: Record<string, string> = {};
			if (titleTemplate) config.titleTemplate = titleTemplate;
			if (streamTemplate) config.streamTemplate = streamTemplate;
			localStorage.setItem('userConfigs', JSON.stringify(config));
			saveMessage = 'Saved!';
		} catch {
			saveMessage = 'Failed to save.';
		}
		setTimeout(() => (saveMessage = ''), 2500);
	}

	function reset() {
		titleTemplate = DEFAULT_CONFIG.titleTemplate;
		streamTemplate = DEFAULT_CONFIG.streamTemplate;
		try { localStorage.removeItem('userConfigs'); } catch { /* ignore */ }
		saveMessage = 'Reset to defaults.';
		setTimeout(() => (saveMessage = ''), 2500);
	}

	function setTheme(t: Theme) {
		theme = t;
		saveTheme(t);
	}

	onMount(() => {
		const cfg = getConfig();
		titleTemplate = cfg.titleTemplate;
		streamTemplate = cfg.streamTemplate;
		theme = getTheme();
	});

	const displayFormats = TIME_FORMATS.filter(
		(f) => f.name !== 'counter' && f.name !== 'category'
	);

	function formatEpoch(epoch: number, char: string): string {
		const d = new Date(epoch * 1000);
		switch (char) {
			case 't': return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
			case 'T': return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
			case 'd': return d.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
			case 'D': return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
			case 'f': return d.toLocaleString([], { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
			case 'F': return d.toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
			case 'R': {
				const diff = Math.round((d.getTime() - Date.now()) / 1000);
				const abs = Math.abs(diff);
				const future = diff > 0;
				if (abs < 60) return future ? 'in a few seconds' : 'a few seconds ago';
				if (abs < 3600) return future ? `in ${Math.round(abs/60)} minutes` : `${Math.round(abs/60)} minutes ago`;
				if (abs < 86400) return future ? `in ${Math.round(abs/3600)} hours` : `${Math.round(abs/3600)} hours ago`;
				return future ? `in ${Math.round(abs/86400)} days` : `${Math.round(abs/86400)} days ago`;
			}
			default: return d.toLocaleString();
		}
	}

	function renderForPreview(line: string): string {
		let html = line.replace(/<t:(\d+):([tTdDfFR])>/g, (_, epoch, char) => {
			const text = formatEpoch(Number(epoch), char);
			return `<span class="ts-chip">${text}</span>`;
		});
		html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		return html;
	}

	const THEMES: { value: Theme; label: string; icon: string }[] = [
		{ value: 'dark',  label: 'Dark',  icon: '🌙' },
		{ value: 'light', label: 'Light', icon: '☀️' },
		{ value: 'auto',  label: 'Auto',  icon: '💻' }
	];
</script>

<svelte:head>
	<title>Configurations — Discord Schedule Generator</title>
</svelte:head>

<div class="page">
	<header>
		<h1>Configurations and Customizations</h1>
	</header>

	<main>
		<!-- Theme toggle -->
		<section class="card theme-card">
			<h2>Appearance</h2>
			<div class="theme-toggle">
				{#each THEMES as t}
					<button
						class="theme-btn"
						class:active={theme === t.value}
						onclick={() => setTheme(t.value)}
					>
						<span class="theme-icon">{t.icon}</span>
						{t.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Template customization -->
		<section class="card">
			<h2>Output Template Customization</h2>

			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Add / Remove</th>
							<th>Type</th>
							<th>12 hr Example</th>
							<th>24 hr Example</th>
							<th>Token</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="action-cell">
								<span class="tag">title only</span>
							</td>
							<td>Title</td>
							<td colspan={2}>Use markdown in the Title field below.</td>
							<td><code>N/A</code></td>
						</tr>
						<tr>
							<td class="action-cell">
								<button class="btn-add" onclick={() => appendToken('counter')} title="Add">+</button>
								<button class="btn-remove" onclick={() => removeToken('counter')} title="Remove">−</button>
							</td>
							<td>Counter (#)</td>
							<td colspan={2}>Incrementing number per stream entry</td>
							<td><code>&lt;&lt;counter&gt;&gt;</code></td>
						</tr>
						<tr>
							<td class="action-cell">
								<button class="btn-add" onclick={() => appendToken('category')} title="Add">+</button>
								<button class="btn-remove" onclick={() => removeToken('category')} title="Remove">−</button>
							</td>
							<td>Category</td>
							<td colspan={2}>Stream description / category text</td>
							<td><code>&lt;&lt;category&gt;&gt;</code></td>
						</tr>
						{#each displayFormats as fmt}
							<tr>
								<td class="action-cell">
									<button class="btn-add" onclick={() => appendToken(fmt.name)} title="Add">+</button>
									<button class="btn-remove" onclick={() => removeToken(fmt.name)} title="Remove">−</button>
								</td>
								<td>{fmt.label}</td>
								<td class="mono">{fmt.example12hr}</td>
								<td class="mono">{fmt.example24hr}</td>
								<td><code>&lt;&lt;{fmt.name}&gt;&gt;</code></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="template-fields">
				<div class="field">
					<label for="title-template">Title Template</label>
					<input id="title-template" type="text" bind:value={titleTemplate} placeholder={DEFAULT_CONFIG.titleTemplate} />
				</div>
				<div class="field">
					<label for="stream-template">Stream Template</label>
					<input id="stream-template" type="text" bind:value={streamTemplate} placeholder={DEFAULT_CONFIG.streamTemplate} />
				</div>
			</div>

			<div class="button-row">
				<button class="btn-primary" onclick={save}>Save</button>
				<button class="btn-secondary" onclick={reset}>Reset to Defaults</button>
				{#if saveMessage}
					<span class="save-msg">{saveMessage}</span>
				{/if}
			</div>
		</section>

		<!-- Preview -->
		<section class="card preview-card">
			<h2>Preview</h2>
			<div class="discord-preview">
				{#each previewLines() as line}
					<div class="preview-line">{@html renderForPreview(line)}</div>
				{/each}
				{#if previewLines().length === 0}
					<div class="preview-empty">Fill in the templates above to see a preview.</div>
				{/if}
			</div>
		</section>
	</main>

	<footer>
		<a href="/" class="btn-footer">Generator</a>
		<a href="/config" class="btn-footer active">⚙ Configurations</a>
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

	h2 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-heading);
		margin: 0 0 1rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
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

	/* Theme toggle */
	.theme-card { padding: 1rem 1.25rem; }

	.theme-toggle {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.theme-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--bg-elevated);
		color: var(--text-secondary);
		border: 2px solid transparent;
		border-radius: 8px;
		padding: 0.45rem 1.1rem;
		font-size: 0.92rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
	}

	.theme-btn:hover {
		background: var(--bg-row-alt);
		color: var(--text-primary);
	}

	.theme-btn.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--bg-row-active);
	}

	.theme-icon { font-size: 1rem; }

	/* Table */
	.table-wrap {
		overflow-x: auto;
		margin-bottom: 1.25rem;
	}

	table { width: 100%; border-collapse: collapse; }

	thead th {
		background: var(--bg-elevated);
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.6rem 0.75rem;
		text-align: left;
		border-bottom: 2px solid var(--border);
	}

	tbody tr { border-bottom: 1px solid var(--border); }
	tbody tr:nth-child(odd) { background: var(--bg-row-alt); }

	tbody td {
		padding: 0.5rem 0.75rem;
		vertical-align: middle;
		font-size: 0.9rem;
	}

	.action-cell {
		white-space: nowrap;
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	.tag {
		font-size: 0.75rem;
		color: var(--text-secondary);
		background: var(--bg-elevated);
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
	}

	.btn-add, .btn-remove {
		border: none;
		border-radius: 4px;
		width: 1.6rem;
		height: 1.6rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		line-height: 1;
	}

	.btn-add { background: var(--color-green); color: #fff; }
	.btn-add:hover { background: var(--color-green-hover); }
	.btn-remove { background: var(--color-red); color: #fff; }
	.btn-remove:hover { background: var(--color-red-hover); }

	.mono {
		font-family: 'Consolas', monospace;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	code {
		background: var(--bg-input);
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
		font-family: 'Consolas', monospace;
		font-size: 0.85rem;
		color: var(--accent);
	}

	/* Template fields */
	.template-fields {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.field { display: flex; flex-direction: column; gap: 0.3rem; }

	.field label {
		font-size: 0.82rem;
		color: var(--text-secondary);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.field input {
		background: var(--bg-input);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.4rem 0.7rem;
		font-size: 0.95rem;
		font-family: 'Consolas', monospace;
		width: 100%;
		box-sizing: border-box;
	}

	.field input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }

	.button-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-primary:hover { background: var(--accent-hover); }

	.btn-secondary {
		background: var(--bg-elevated);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.5rem 1.5rem;
		font-size: 0.95rem;
		cursor: pointer;
	}

	.btn-secondary:hover { background: var(--border); }

	.save-msg { color: var(--color-green); font-size: 0.9rem; }

	/* Discord preview — always dark to mimic Discord */
	.discord-preview {
		background: #36393f;
		border-radius: 6px;
		padding: 1rem;
		font-family: 'Consolas', monospace;
		font-size: 0.9rem;
		color: #dcddde;
		line-height: 1.6;
	}

	.preview-line { white-space: pre-wrap; word-break: break-word; }
	.preview-empty { color: #878d96; font-style: italic; }

	:global(.ts-chip) {
		background: #42464c;
		color: var(--color-blue);
		border-radius: 3px;
		padding: 0.05rem 0.35rem;
		font-size: 0.88em;
	}

	/* Footer */
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
