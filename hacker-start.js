// hacker-start.js
import chalk from 'chalk';
import boxen from 'boxen';
import qrcode from 'qrcode-terminal';
import ip from 'ip';
import os from 'os';
import { spawn } from 'child_process';

const log = console.log;
const localIp = ip.address();
const port = 5173; 
const networkUrl = `http://${localIp}:${port}`;

// Clear Screen
console.clear();

// 1. TOP HEADER
const headerText = chalk.bold.green('  ★  SYSTEM ONLINE: PROTOCOL ROMEO INITIATED  ★  ');
log(boxen(headerText, {
    padding: 1,
    margin: 0,
    borderStyle: 'double',
    borderColor: 'green',
    float: 'center',
    width: 60,
    textAlignment: 'center'
}));

// 2. STATUS ROW
const statusBox = `
${chalk.cyan('STATUS')}          ${chalk.cyan('ENVIRONMENT')}      ${chalk.cyan('ENGINE')}
${chalk.green('✔ Online')}        ${chalk.white('Termux/Android')}   ${chalk.yellow('Vite v6.0')}
${chalk.dim('Secure')}          ${chalk.dim('Node ' + process.version)}       ${chalk.dim('Esbuild')}
`;

log(boxen(statusBox, {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    width: 60
}));

// 3. QR CODE SECTION
log(chalk.yellow.bold('\n       SCAN QR TO CONNECT'));
log(chalk.dim(`       ${networkUrl}\n`));

qrcode.generate(networkUrl, { small: true }, (qr) => {
    const lines = qr.split('\n');
    lines.forEach(line => {
        log(`          ${line}`);
    });
});

// 4. SYSTEM ANALYTICS (FIXED CRASH HERE)
const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1) + ' GB';
const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1) + ' GB';

// Safe CPU Check: Agar CPU info na mile to crash nahi karega
const cpus = os.cpus();
const cpuModel = (cpus && cpus.length > 0 && cpus[0].model) 
    ? cpus[0].model.split(' ')[0] 
    : 'Android Core';

const analytics = `
${chalk.blue('SYSTEM ANALYTICS')}
──────────────────────────────
CPU Model:   ${chalk.white(cpuModel)}
Total RAM:   ${chalk.white(totalMem)}
Free RAM:    ${chalk.red(freeMem)}
Platform:    ${chalk.magenta(os.platform())}
`;

log(boxen(analytics, {
    padding: 1,
    borderStyle: 'classic',
    borderColor: 'blue',
    width: 60
}));

log(chalk.gray('\nWaiting for server output...'));

// 5. Start Vite Server
const vite = spawn('npm', ['exec', 'vite'], { stdio: 'inherit', shell: true });

