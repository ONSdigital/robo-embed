<script>
	import { snapdom } from "@zumer/snapdom";
	import { app_url } from "../../app.config.js";
	import { Button, Textarea, Details, List, Li, Icon } from "@onsvisual/svelte-components";
	import { timeFormat, timeParse } from "d3-time-format";

	let { place, section } = $props();

	let el = $state();
	let showEmbed = $state(false);

	function formatData(data) {
		let csv = "";
		const IsDate = data[0].x instanceof Date; //tests to see whether data is a Date object
		const dateFormatString = "%b %Y"; //set the formatting for the date string
		if (data[0].z) {
			const indexed = {};
			for (const d of data) {
				if (!indexed[d.z]) indexed[d.z] = { name: d.z };
				indexed[d.z][d.x] = d.y;
			}
			const xDomain = IsDate
				? Array.from(
						new Set(
							data
								.map((d) => d.x)
								.sort((a, b) => new Date(b.date) - new Date(a.date))
								.map((d) => timeFormat(dateFormatString)(d))
						)
					)
				: Array.from(new Set(data.map((d) => d.x))).sort((a, b) => a.localeCompare(b));
			csv = `"Area name",${xDomain.join(",")}\n`;
			for (const key in indexed) {
				const d = indexed[key];
				csv += IsDate
					? `"${d.name}",${xDomain.map((x) => d[timeParse(dateFormatString)(x)]).join(",")}\n`
					: `"${d.name}",${xDomain.map((x) => d[x]).join(",")}\n`;
			}
		} else {
			csv = IsDate ? '"Date",value\n' : '"Area name",value\n';
			for (const d of data) {
				csv += IsDate
					? `${timeFormat(dateFormatString)(d.x)},"${d.y}"\n`
					: `"${d.y}",${d.x}\n`;
			}
		}
		return csv;
	}

	async function downloadChart(e) {
		e.preventDefault();
		const chart = el?.parentElement?.firstElementChild;
		const result = await snapdom(chart, {
			embedFonts: true,
			backgroundColor: "white",
			scale: 2
		});
		await result.download({
			format: "png",
			filename: `${place.areanm.replaceAll(" ", "-")}_${section.id}.png`
		});
	}

	function downloadData(e) {
		e.preventDefault();
		let csv = "﻿";
		csv += section.title ? `"${section.title}"\n` : "";
		csv += section.subtitle
			? section.xPrefix || section.ySuffix || section.xSuffix
				? `"${section.subtitle}, ${section.xPrefix ? section.xPrefix : ""} ${section.ySuffix ? section.ySuffix : ""} ${section.xSuffix ? section.xSuffix : ""}"\n`
				: `"${section.subtitle}"\n`
			: "";
		if (csv) csv += "\n";
		csv += formatData(section.data);
		csv += section.note ? `\n"Note: ${section.note}"\n` : "";
		csv += section.footer ? `\n"${section.footer}"\n` : "";

		const url = window.URL || window.webkitURL || window;
		const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
		const link = url.createObjectURL(blob);
		const a = document.createElement("a");

		a.download = `${place.areanm.replaceAll(" ", "-")}_${section.id}.csv`;
		a.href = link;
		document.body.appendChild(a);

		a.click();
		document.body.removeChild(a);
	}

	function clip(str, msg) {
		navigator.clipboard.writeText(str).then(() => alert(msg));
	}

	let embedCode = $derived(`<div id="${section.id}"></div>
<scr${""}ipt src="https://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.min.js"></scr${""}ipt>
<scr${""}ipt>var pymParent = new pym.Parent("${section.id}", "${app_url}/embed/?area=${place.areacd}&chart=${section.id}", {name: "${section.id}", title: "Embedded chart"});</scr${""}ipt>`);
</script>

<div class="chart-actions" bind:this={el}>
	<Details title="Download and use this chart">
		<List mode="bare">
			<Li>
				<Icon type="download" marginRight />
				<a href="#0" onclick={downloadChart}>Download chart (PNG)</a>
			</Li>
			<Li>
				<Icon type="download" marginRight />
				<a href="#0" onclick={downloadData}>Download data (CSV)</a>
			</Li>
			<Li>
				<Icon type="code" marginRight />
				<a
					href="#0"
					onclick={(e) => {
						e.preventDefault();
						showEmbed = !showEmbed;
					}}>{showEmbed ? "Hide embed code" : "Show embed code"}</a
				>
			</Li>
		</List>
		{#if showEmbed}
			<Textarea value={embedCode} rows={4} readonly hideLabel />
			<Button small on:click={() => clip(embedCode, "Copied to clipboard!")}
				>Copy to clipboard</Button
			>
		{/if}
	</Details>
</div>

<style>
	.chart-actions {
		display: block;
		width: 100%;
		margin-bottom: 12px;
	}
	.chart-actions :global(.ons-btn) {
		margin: 4px 0 8px;
	}
</style>
