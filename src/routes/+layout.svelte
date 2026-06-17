<script lang="ts">
	import { onMount } from 'svelte';
	import { type Snippet } from 'svelte';
	import { getTheme, applyTheme } from '$lib/theme';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		applyTheme(getTheme());
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => { if (getTheme() === 'auto') applyTheme('auto'); };
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

{@render children()}

<style>
	:global(*, *::before, *::after) { box-sizing: border-box; }

	/* Dark theme */
	:global(:root[data-theme="dark"]) {
		--bg-base:       #1e1f22;
		--bg-surface:    #2b2d31;
		--bg-elevated:   #313338;
		--bg-input:      #1e1f22;
		--bg-row-alt:    #25272a;
		--bg-row-active: #1e2a3a;
		--bg-output:     #36393f;
		--border:        #3f4147;
		--border-active: #2d4a6e;
		--text-primary:  #dcddde;
		--text-secondary:#b5bac1;
		--text-heading:  #e0e1e5;
		--text-strong:   #ffffff;
		color-scheme: dark;
	}

	/* Light theme */
	:global(:root[data-theme="light"]) {
		--bg-base:       #f2f3f5;
		--bg-surface:    #ffffff;
		--bg-elevated:   #e9eaec;
		--bg-input:      #ffffff;
		--bg-row-alt:    #f7f7f8;
		--bg-row-active: #e8f0fb;
		--bg-output:     #ebedef;
		--border:        #d4d6da;
		--border-active: #7289da;
		--text-primary:  #2e3338;
		--text-secondary:#4f5660;
		--text-heading:  #1a1c1e;
		--text-strong:   #1a1c1e;
		color-scheme: light;
	}

	/* Accent — same for both themes */
	:global(:root) {
		--accent:        #5865f2;
		--accent-hover:  #4752c4;
		--color-green:   #3ba55c;
		--color-green-hover: #2d8247;
		--color-red:     #ed4245;
		--color-red-hover: #c03537;
		--color-blue:    #00aff4;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background: var(--bg-base);
		color: var(--text-primary);
	}
</style>
