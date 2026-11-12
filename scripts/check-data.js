import { readFileSync } from "fs";
import { validateCSV } from "@onsvisual/robo-utils";
import { source_dir, data_file } from "../src/app.config.js";

// Check the data CSV with robo-utils' validateCSV, and print its report
const path = `${source_dir}/${data_file}`;
const report = validateCSV(readFileSync(path, { encoding: "utf8", flag: "r" }));

console.log(`Checking ${path}: ${report.rows} rows, ${report.columns.length} columns`);

const removed = report.removedBlankRows;
if (removed)
	console.log(`Ignored ${removed} blank row${removed > 1 ? "s" : ""} at the end of the file`);

if (report.error) {
	console.log(`\n${report.error}`);
	process.exit(1);
}

console.log(`\nLikely code column: ${report.codeKey}`);
console.log(`Likely name column: ${report.nameKey ?? "none found"}`);

for (const check of report.checks) {
	console.log(`\n${check.title}: ${check.problems.length || "none"}`);
	check.problems.forEach((problem) => console.log(`  ${problem.message}`));
}

// Summary
if (report.problems) {
	console.log(`\nFound problems in ${report.problems} of ${report.checks.length} checks`);
	process.exitCode = 1; // So that eg. `npm run check:data && npm run build:data` stops here
} else {
	console.log("\nAll checks passed");
}
