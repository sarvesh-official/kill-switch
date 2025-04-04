import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "kill-switch" is now active!');

	const disposable = vscode.commands.registerCommand('kill-switch.killProcessInPort', async () => {
		const port = await vscode.window.showInputBox({
			placeHolder: 'Enter port number (e.g. 3000)',
			validateInput: (value) => /^\d+$/.test(value) ? null : 'Please enter a valid number',
		});

		if (!port) {
			vscode.window.showErrorMessage('No port number provided');
			return;
		}

		const platform = process.platform;
		let command: string;

		if (platform === 'win32') {
			// PowerShell 
			command = `powershell -NoProfile -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $p = (Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess; if ($p) { Stop-Process -Id $p -Force; Write-Output \\"Killed process on port ${port} (PID: $p) ✅🔥 \\" } else { Write-Output \\"No process found on port ${port}\\" }"`;
		} else {
			// Unix/macOS
			command = `lsof -ti:${port} | xargs kill -9 && echo '✅ Killed process on port ${port}' || echo 'No process found on port ${port}'`;
		}

		exec(command, { encoding: 'utf8' }, (err, stdout, stderr) => {
			const output = stdout.trim().split('\n').pop() ?? '';
			vscode.window.showInformationMessage(output || `✅ Port ${port} cleared`);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
6