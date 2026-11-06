import { readFileSync } from "fs";
import { MagicNumber, csvParse, getCodeKey, getNameKey } from "@onsvisual/robo-utils";
import { source_dir, data_file } from "../src/app.config.js";

// Load data CSV, along with its original text values to show in the messages
const path = `${source_dir}/${data_file}`;
const data_raw = readFileSync(path, { encoding: "utf8", flag: "r" });
const data = csvParse(data_raw);
const text = csvParse(data_raw, (d) => d);

// Row number in a spreadsheet, where the header is row 1
const rowNum = (i) => i + 2;

// Cells with no value are null, or an empty array in "_array" columns
const isEmpty = (val) => val === null || (Array.isArray(val) && val.length === 0);

function getType(val) {
	if (val instanceof MagicNumber) return "number";
	if (val instanceof Date) return "date";
	if (Array.isArray(val)) return "array";
	return typeof val;
}

let problems = 0; // Number of checks that found a problem

function report(title, lines) {
	if (lines.length) problems++;
	console.log(`\n${title}: ${lines.length ? lines.length : "none"}`);
	lines.forEach((line) => console.log(`  ${line}`));
}

console.log(`Checking ${path}: ${data.length} rows, ${data.columns.length} columns`);

if (data.length === 0) {
	console.log("\nNo rows found");
	process.exit(1);
}

// 1. Likely code and name columns
const codeKey = getCodeKey(data[0]);
const nameKey = getNameKey(data[0]);
const hasName = nameKey !== codeKey; // getNameKey falls back to the code column
console.log(`\nLikely code column: ${codeKey}`);
console.log(`Likely name column: ${hasName ? nameKey : "none found"}`);

const indexes = data.map((_, i) => i);
const isBlank = (i) => data.columns.every((col) => isEmpty(data[i][col]));
const describeRow = (i) =>
	`row ${rowNum(i)}${hasName && text[i][nameKey] ? ` (${text[i][nameKey]})` : ""}`;

// 2. Blank rows
const blank = indexes.filter(isBlank);
report(
	"Blank rows",
	blank.map((i) => `row ${rowNum(i)}`)
);

// 3. Rows with data but no code
const noCode = indexes.filter((i) => isEmpty(data[i][codeKey]) && !isBlank(i));
report("Rows with no code", noCode.map(describeRow));

// 4. Duplicate codes
const rowsByCode = new Map();
for (const i of indexes) {
	if (isEmpty(data[i][codeKey])) continue;
	const code = String(data[i][codeKey]).trim();
	rowsByCode.set(code, [...(rowsByCode.get(code) ?? []), i]);
}
const duplicates = [...rowsByCode].filter(([, rows]) => rows.length > 1);
report(
	"Duplicate codes",
	duplicates.map(([code, rows]) => `${code}: ${rows.map(describeRow).join(", ")}`)
);

// 5. Columns with mixed types (empty cells are valid in a column of any type)
const mixed = [];
for (const col of data.columns) {
	const byType = {};
	for (const i of indexes) {
		if (!isEmpty(data[i][col])) (byType[getType(data[i][col])] ??= []).push(i);
	}
	const types = Object.keys(byType);
	if (types.length < 2) continue;

	// The most common type comes first, followed by examples of each of the others
	types.sort((a, b) => byType[b].length - byType[a].length);
	const summary = types.map((type) => `${byType[type].length} ${type}`).join(", ");
	const examples = types.slice(1).map((type) => {
		const shown = byType[type].slice(0, 3).map((i) => `"${text[i][col]}" (row ${rowNum(i)})`);
		const more = byType[type].length - shown.length;
		return `${type}: ${shown.join(", ")}${more ? `, and ${more} more` : ""}`;
	});
	const hint = types.includes("array")
		? ` A column of lists should have a name ending "_array", so a single value is a list too.`
		: "";
	mixed.push(`${col}: ${summary}. ${examples.join("; ")}.${hint}`);
}
report("Columns with mixed types", mixed);

// Summary
if (problems) {
	console.log(`\nFound problems in ${problems} of 4 checks`);
	process.exitCode = 1; // So that eg. `npm run check:data && npm run build:data` stops here
} else {
	console.log("\nAll checks passed");
}
