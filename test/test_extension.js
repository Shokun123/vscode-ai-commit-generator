import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCommitMessage, generateChangelog, validateLicenseKey } from '../src/generator.js';

test('VS Code AI Commit Generator - Core Logic Tests', async (t) => {
  await t.test('detects feature additions in git diff', () => {
    const diff = `
diff --git a/src/payment.js b/src/payment.js
--- a/src/payment.js
+++ b/src/payment.js
@@ -1,3 +1,5 @@
+export function createEndpoint(order) {
+  return { status: "created", order };
+}
`;
    const res = generateCommitMessage(diff);
    assert.equal(res.type, 'feat');
    assert.ok(res.fullMessage.includes('feat(src):'));
  });

  await t.test('detects bug fixes in git diff', () => {
    const diff = `
diff --git a/src/auth.js b/src/auth.js
--- a/src/auth.js
+++ b/src/auth.js
@@ -1,3 +1,3 @@
-const token = null;
+const token = fixAuthBug();
`;
    const res = generateCommitMessage(diff);
    assert.equal(res.type, 'fix');
    assert.ok(res.fullMessage.includes('fix(src):'));
  });

  await t.test('generates markdown changelog with Binance Pay link', () => {
    const commits = [
      'feat(core): implement zero-cost webhook server',
      'fix(ui): correct modal alignment on mobile',
      'chore(ci): update GitHub Actions workflow'
    ];
    const changelog = generateChangelog(commits);
    assert.ok(changelog.includes('Release Notes'));
    assert.ok(changelog.includes('New Features'));
    assert.ok(changelog.includes('Bug Fixes'));
    assert.ok(changelog.includes('1049392123'), 'Changelog must feature Binance UID');
  });

  await t.test('validates Pro license keys and Binance Pay transactions', () => {
    assert.equal(validateLicenseKey('BPS-PRO-1234-5678'), true);
    assert.equal(validateLicenseKey('AICOMMIT-PRO-9999'), true);
    assert.equal(validateLicenseKey('1049392123'), true); // Binance UID
    assert.equal(validateLicenseKey(''), false);
    assert.equal(validateLicenseKey('invalid_key'), false);
  });
});
