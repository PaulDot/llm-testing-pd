## 🤖 Multi-Tiered AI Application Testing Portfolio Sandbox

A test engineering sandbox designed to demonstrate strategies for validating Large Language Model (LLM) applications. This project separates non-deterministic AI logic evaluations from frontend browser automation testing.

## 🚀 Quick Start 

### Prerequisites
* [Node.js](https://nodejs.org) (LTS version)
* [Groq API Key](https://console.groq.com/keys) (only if you want to test locally against a real AI - will mock responses if not present)

### Setup & Execution
Open your terminal (Linux/MacOS) or PowerShell (Windows) and execute the following commands to clone, install, and run the test suite:

```bash
# 1. Clone the repository and install dependencies
# Note: If you don't have git, click the green "Code" button on the repository on GitHub, select "Download ZIP", extract it, and open your terminal inside that directory.
git clone https://github.com/PaulDot/llm-testing-pd.git && cd llm-testing-pd

# 2. Install project packages and download browser binaries
npm install
npx playwright install --with-deps chromium

# 3. Run the Playwright Browser UI Test Suite
npm run test:ui

# 4. Run the AI Logic Evaluation Suite (Dynamic Mode Auto-Switch)
#    This command automatically runs the live LLM-as-a-Judge suite if GROQ_API_KEY exists in the environment.
#    Otherwise, it falls back to the offline mock suite.
npm run test:eval
#    - To ensure a live run by passing the key inline (Linux/macOS):
GROQ_API_KEY="your_actual_key" npm run test:eval
#    - To ensure a live run by passing the key inline (Windows PowerShell):
$env:GROQ_API_KEY="your_actual_key"; npm run test:eval

# 5. Force the Mock AI Logic Evaluation Suite (Even if an API key is active)
npm run test:eval:mock
```

### Viewing Results
#### Playwright
After a playwright test run completes, you can view results inline in the terminal, or view a more detailed interactive HTML report by running:
```bash
npx playwright show-report
```
#### Promptfoo
Promptfoo automatically logs every evaluation run. To view comprehensive metrics, charts, and side-by-side comparisons in a local visual dashboard, start the web viewer server from your terminal:
```bash
npx promptfoo view
```
or view the specific run directly:
```bash
npx promptfoo view <your_latest_eval_id>
```

## 📐 Architecture & Testing Strategy
This repository implements a dual-tier AI testing architecture:
```text
            [ AI APPLICATION TESTING PYRAMID ]
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                     ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│       FRONTEND UI LAYER       │     │     AI MODEL LOGIC LAYER      │
│      (Playwright + Vite)      │     │          (Promptfoo)          │
├───────────────────────────────┤     ├───────────────────────────────┤
│ • Mocked Network Traffic      │     │ • Automated LLM-as-a-Judge    │
│ • Deterministic UI Assertions │     │ • Semantic Evaluation Rubrics │
│ • Interaction & Layout Checks │     │ • Prompt Injection Defences   │
└───────────────────────────────┘     └───────────────────────────────┘
```
* Frontend UI Layer: Playwright intercepts all outbound traffic to /api/chat. By mocking the backend, browser assertions remain completely deterministic, isolated from model changes, and immune to API rate limits or runtime token costs.
* AI Model Logic Layer: Promptfoo runs automated adversarial injections and semantic evaluations. This layer tests the "intelligence" and safety of the model directly via the API before any UI code is integrated.

## ⚙️ Continuous Integration (GitHub Actions)
Features two decoupled GitHub Actions automation pipelines running independently. These will run on pulls from/pushes to the main branch.
