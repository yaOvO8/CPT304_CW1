const path = require("node:path");

const testFiles = [
  "./core.test.js",
  "./feedback.test.js",
  "./cookie-banner.test.js",
];

let failures = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error && error.stack ? error.stack : error);
  }
}

async function main() {
  for (const relativeFile of testFiles) {
    const filePath = path.join(__dirname, relativeFile);
    const testModule = require(filePath);
    const tests = Array.isArray(testModule) ? testModule : [];

    for (const entry of tests) {
      await runTest(entry.name, entry.fn);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(`All tests passed: ${testFiles.length} files`);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
