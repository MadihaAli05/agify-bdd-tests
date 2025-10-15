# Agify.io BDD API Tests (Cucumber + TypeScript)

Behavior-Driven Development (BDD) test suite for the public [Agify API](https://agify.io).  
These automated tests validate the **functionality and structure** of the API — not the accuracy of the predicted ages.

---

##  Features Tested

-  Single-name prediction (`/api.agify.io?name=...`)
-  Localization via `country_id`
-  Batch requests (up to 10 names)
-  Input fallbacks (diacritics and full-name parsing)
-  Error handling (missing or empty `name`)
-  Response headers & content type validation

---

##  Tech Stack

- **Cucumber.js** (v11+)
- **TypeScript + ts-node**
- **Axios** for HTTP
- **Dotenv** for environment variables
- **Node.js** ≥ 18 (tested on 20)

---

##  Quick Start

```bash
# Clone your fork or repo
git clone https://github.com/MadihaAli05/agify-bdd-tests.git
cd agify-bdd-tests

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# (edit .env if you have an API key or custom base URL)

Run tests:

# Default: runs all except @optional
npm test

# Smoke only
npm run test:smoke

# Negative/error cases
npm run test:negative

# Batch endpoint
npm run test:batch

# Generate HTML report
npm run test:report
# -> open reports/cucumber-report.html

Tags Overview
Tag	Description
@smoke	Happy-path test
@localization	Country-specific lookup
@batch	Multiple names (array)
@fallbacks	Diacritics & full names
@negative	Invalid / missing params
@optional	Non-critical checks (excluded by default)
Project Structure

.
├─ features/
│  ├─ agify.feature
│  ├─ step_definitions/
│  │  └─ agify.steps.ts
│  └─ support/
│     ├─ world.ts
│     └─ hooks.ts
├─ src/
│  └─ api/
│     └─ agifyClient.ts
├─ cucumber.mjs
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ README.md

Configuration

Environment variables (optional):

# .env
AGIFY_API_KEY=           # Optional (for >100 requests/day)
AGIFY_BASE_URL=https://api.agify.io

Cucumber configuration (cucumber.mjs):

export default {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'features/support/world.ts',
      'features/support/hooks.ts',
      'features/step_definitions/**/*.ts'
    ],
    paths: ['features/**/*.feature'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    publishQuiet: true,
    parallel: 0,
    tags: 'not @optional'
  }
};

Known Behavior Differences (as of Oct 2025)
Case	Request	Expected (docs)	Actual (live API)
Missing name param	GET /?	422 + "Missing 'name' parameter"	✅ Matches
Empty name (name=)	GET /?name=	422 error	⚠️ Returns 200 with { count:0, name:"", age:null }
Name with diacritics	GET /?name=José	normalized “jose”	⚠️ Returns "name": "José"
Full name	GET /?name=Michael%20Jordan	parsed to “michael”	⚠️ Returns "name": "Michael Jordan"

Tests account for these differences by using case- and diacritic-insensitive equality and substring matching where needed.
Example Output

8 scenarios (8 passed)
40 steps (40 passed)

Troubleshooting
Problem	Fix
 Undefined steps	Ensure ts-node is registered; see cucumber.mjs config
 “Too many requests”	API free limit: 100 names/day — use fewer tags or add an API key
 Type errors	Run npm install again to sync typings
 Network issues	Test your connection: curl https://api.agify.io?name=michael
 NPM Scripts

"scripts": {
  "test": "cucumber-js",
  "test:all": "cucumber-js --tags 'not @none'",
  "test:smoke": "cucumber-js --tags '@smoke'",
  "test:negative": "cucumber-js --tags '@negative'",
  "test:batch": "cucumber-js --tags '@batch'",
  "test:report": "cucumber-js --format html:reports/cucumber-report.html",
  "clean": "rm -rf dist node_modules reports"
}

 CI Setup (Optional)

Create .github/workflows/ci.yml:

name: CI
on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci || npm i
      - run: npm test
      - name: Upload Cucumber HTML report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cucumber-report
          path: reports/cucumber-report.html
