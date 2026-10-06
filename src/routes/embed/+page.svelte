<script>
	// A single chart for the embed codes from ChartActions.svelte, chosen with ?area=<areacd>&chart=<section id>
	import { onMount } from "svelte";
	import { asset } from "$app/paths";
	import { Embed, Grid } from "@onsvisual/svelte-components";
	import { Chart } from "@onsvisual/svelte-charts";
	import { getPlace } from "$lib/utils";

	let { data } = $props();

	let section = $state();

	onMount(async () => {
		const params = new URLSearchParams(document.location.search);
		const code = params.get("area");
		const id = params.get("chart");

		if (code && id && data.places.some((p) => p.areacd === code)) {
			const place = await getPlace(asset(`/data/json/${code}.json`));
			const chart = place.sections.find((s) => s.id === id);
			// Time series data needs dates, as on the main page
			if (chart?.chartType === "line" && chart.xScale === "time") {
				chart.data.forEach((d) => (d.x = new Date(d.x)));
			}
			section = chart;
		}
	});
</script>

<svelte:head>
	{#if section?.title}
		<title>{section.title}</title>
	{/if}
	<meta name="robots" content="noindex" />
	<meta name="googlebot" content="indexifembedded" />
</svelte:head>

<Embed>
	{#if section}
		<Grid width="narrow" colwidth="full">
			<div class="chart-outer">
				<Chart {section} />
				{#if section.note}
					<div class="chart-note">{section.note}</div>
				{/if}
			</div>
		</Grid>
	{/if}
</Embed>
