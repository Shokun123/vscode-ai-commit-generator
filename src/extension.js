import { generateCommitMessage, generateChangelog, validateLicenseKey } from './generator.js';

let vscode;
try {
  vscode = await import('vscode');
} catch (e) {
  // Graceful fallback when running in Node.js test environment
}

export function activate(context) {
  if (!vscode) return;

  console.log('⚡ AI Commit & Changelog Generator extension activated.');

  // Command 1: Generate Commit Message
  const generateCmd = vscode.commands.registerCommand('aiCommit.generate', async () => {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        vscode.window.showErrorMessage('Git extension not found in VS Code.');
        return;
      }

      const git = gitExtension.exports.getAPI(1);
      const repo = git.repositories[0];
      if (!repo) {
        vscode.window.showWarningMessage('No active Git repository detected.');
        return;
      }

      const diff = await repo.diff(true); // Get staged changes diff
      if (!diff || diff.trim().length === 0) {
        vscode.window.showInformationMessage('No staged changes found. Stage files with "git add" first.');
        return;
      }

      const config = vscode.workspace.getConfiguration('aiCommit');
      const licenseKey = config.get('licenseKey', '');
      const isPro = validateLicenseKey(licenseKey);
      const style = config.get('conventionalStyle', 'angular');

      const result = generateCommitMessage(diff, { style, isPro });
      repo.inputBox.value = result.fullMessage;

      vscode.window.showInformationMessage(`✓ Commit generado: "${result.fullMessage.split('\n')[0]}"`);
    } catch (err) {
      vscode.window.showErrorMessage(`Error generando commit: ${err.message}`);
    }
  });

  // Command 2: Generate Changelog
  const changelogCmd = vscode.commands.registerCommand('aiCommit.changelog', async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: generateChangelog([
        'feat(auth): add Binance Pay direct checkout modal',
        'fix(api): handle network timeout on webhook signature verification',
        'chore(deps): update Node 24 runtime support'
      ]),
      language: 'markdown'
    });
    await vscode.window.showTextDocument(doc);
  });

  // Command 3: Activate Pro License
  const activateProCmd = vscode.commands.registerCommand('aiCommit.activatePro', async () => {
    const key = await vscode.window.showInputBox({
      prompt: 'Introduce tu Clave Pro o TxID de Binance (Transferencia a Binance UID: 1049392123 | $15 USDT)',
      placeHolder: 'ej. 1049392123 o BPS-PRO-XXXX-XXXX'
    });

    if (key && validateLicenseKey(key)) {
      const config = vscode.workspace.getConfiguration('aiCommit');
      await config.update('licenseKey', key, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('🎉 ¡Licencia Pro Activada de por vida! Gracias por tu apoyo en Binance.');
    } else if (key) {
      vscode.window.showErrorMessage('Clave o TxID no válido. Envía $15 USDT a Binance UID: 1049392123.');
    }
  });

  context.subscriptions.push(generateCmd, changelogCmd, activateProCmd);
}

export function deactivate() {}
