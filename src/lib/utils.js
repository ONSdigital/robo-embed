import { csvParse, autoType } from "d3-dsv";

// CORE FUNCTIONS
export function setColors(themes, theme) {
	for (let color in themes[theme]) {
		document.documentElement.style.setProperty("--" + color, themes[theme][color]);
	}
}

export function getMotion() {
	let mediaQuery = true; // window.matchMedia("(prefers-reduced-motion: reduce)"); // Check if browser prefers reduced motion
	return !mediaQuery || mediaQuery.matches ? false : true; // return true for motion, false for no motion
}

export default async function loadJson(url) {
	const response = await fetch(url);
	const data = await response.json();
	return data;
}

export function getColor(value, breaks, colors) {
	let color;
	let found = false;
	let i = 1;
	while (found == false) {
		if (value <= breaks[i]) {
			color = colors[i - 1];
			found = true;
		} else {
			i++;
		}
	}
	return color ? color : "lightgrey";
}

// DEMO-SPECIFIC FUNCTIONS
export async function getData(url, fetch = window.fetch) {
	let response = await fetch(url);
	let string = await response.text();
	let data = csvParse(string, autoType);
	return data.sort((a, b) => a.areanm.localeCompare(b.areanm));
}

export async function getPlace(url, fetch = window.fetch) {
	let response = await fetch(url);
	return await response.json();
}

export function makeDatasets(data, colors, geo) {
	let metadata = {};
	let dataset = {};

	let meta = data.map((d) => ({
		code: d.code,
		name: d.name,
		parent: d.parent ? d.parent : null
	}));
	meta.sort((a, b) => a.name.localeCompare(b.name));

	let lookup = {};
	meta.forEach((d) => {
		lookup[d.code] = d;
	});
	metadata.array = meta;
	metadata.lookup = lookup;

	let indicators = data.map((d, i) => ({
		...meta[i],
		area: d.area,
		pop: d["2020"],
		density: d.density,
		age_med: d.age_med
	}));

	if (geo == "district") {
		["density", "age_med"].forEach((key) => {
			let values = indicators.map((d) => d[key]).sort((a, b) => a - b);
			let breaks = getBreaks(values);
			indicators.forEach(
				(d, i) => (indicators[i][key + "_color"] = getColor(d[key], breaks, colors.seq))
			);
		});
	}
	dataset.indicators = indicators;

	let years = [
		2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
		2016, 2017, 2018, 2019, 2020
	];

	let timeseries = [];
	data.forEach((d) => {
		years.forEach((year) => {
			timeseries.push({
				code: d.code,
				name: d.name,
				value: d[year],
				year
			});
		});
	});
	dataset.timeseries = timeseries;

	return { dataset, metadata };
}
