import { spawnSync } from "node:child_process";

const TARGET_HOURS = new Set([0, 6, 12, 18]);
const CHECK_INTERVAL_MS = 60_000;

let lastExecutedKey = "";

function getNowParts() {
	const now = new Date();
	return {
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate(),
		hour: now.getHours(),
		minute: now.getMinutes(),
	};
}

function formatDateTime() {
	return new Date().toLocaleString("ja-JP", { hour12: false });
}

function runScrapeJob() {
	console.log(`[${formatDateTime()}] Starting scheduled scrape job...`);
	const result = spawnSync("npm", ["run", "scrape:job"], {
		stdio: "inherit",
		shell: process.platform === "win32",
	});
	if (result.status !== 0) {
		console.error(
			`[${formatDateTime()}] scrape:job failed with code ${result.status}`,
		);
	} else {
		console.log(`[${formatDateTime()}] scrape:job finished successfully.`);
	}
}

function tick() {
	const { year, month, day, hour, minute } = getNowParts();
	const runKey = `${year}-${month}-${day}-${hour}`;

	if (TARGET_HOURS.has(hour) && runKey !== lastExecutedKey) {
		runScrapeJob();
		lastExecutedKey = runKey;
	} else {
		console.log(
			`[${formatDateTime()}] waiting... (hour=${hour}, minute=${minute})`,
		);
	}
}

console.log("Auto scrape scheduler started.");
console.log("Target times: 00:00 / 06:00 / 12:00 / 18:00");
console.log("Press Ctrl+C to stop.");

tick();
setInterval(tick, CHECK_INTERVAL_MS);
