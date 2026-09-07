import { spawn } from 'child_process';

const forceMock = process.argv.includes('--force-mock');
const hasApiKey = !!process.env.GROQ_API_KEY;

let configTarget = 'promptfooconfig.yaml';

if (hasApiKey && !forceMock) {
    configTarget = 'promptfooconfig.live.yaml';
    console.log('🚀 GROQ_API_KEY detected. Launching Live LLM-as-a-Judge Evaluation Suite...');
} else if (forceMock) {
    console.log('🔒 Force-mock flag active. Launching Local Mocked Evaluation Suite...');
} else {
    console.log('📴 No API key found. Launching Local Mocked Evaluation Suite...');
}

// Windows needs 'npx.cmd' instead of 'npx' when spawning sub-shells
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const promptfoo = spawn(command, ['promptfoo', 'eval', '-c', configTarget], {
    stdio: 'inherit',
    shell: true,
    env: process.env 
});

promptfoo.on('close', (code) => {
    process.exit(code);
});
