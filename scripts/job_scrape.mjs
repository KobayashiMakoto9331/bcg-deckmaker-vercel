import { execSync } from "node:child_process";
import fs from "node:fs";

const CARDS_PATH = "./public/cards.json";
const LOG_BASE_NAME = "update.log";
const MAX_LOG_SIZE = 2 * 1024 * 1024;

function getNextLogFile() {
	let index = 1;
	let fileName = LOG_BASE_NAME;
	while (fs.existsSync(fileName)) {
		const stats = fs.statSync(fileName);
		if (stats.size < MAX_LOG_SIZE) return fileName;
		index++;
		fileName = `update_${index}.log`;
	}
	return fileName;
}

function formatDate(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	return `${y}${m}${d} ${hh}:${mm}`;
}

async function run() {
	console.log("--- Starting Job Scrape ---");
	let oldCards = [];
	if (fs.existsSync(CARDS_PATH)) {
		oldCards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf-8"));
	}
	const oldIds = new Set(oldCards.map((c) => c.id));

	try {
		console.log("Running npm run scrape...");
		execSync("npm run scrape", { stdio: "inherit" });
	} catch (e) {
		console.error("Scrape failed:", e);
	}

	const newCardsData = JSON.parse(fs.readFileSync(CARDS_PATH, "utf-8"));
	const newCards = newCardsData.filter((c) => !oldIds.has(c.id));

	const now = new Date();
	let logContent = "------------------------------------\n";
	logContent += `${formatDate(now)}\n`;
	logContent += "・Result\n";

	if (newCards.length === 0) {
		logContent += "No new cards found. Data is up to date.\n";
	} else {
		newCards.forEach((c) => {
			logContent += `"id": "${c.id}", "name": "${c.name}"\n`;
		});
	}
	logContent += "------------------------------------\n";

	const logFile = getNextLogFile();
	fs.appendFileSync(logFile, logContent);
	console.log(`Log written to ${logFile}`);
}

run();
