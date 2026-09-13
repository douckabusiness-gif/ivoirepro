import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import {
  isDemoModeEnabled,
  signAdminToken,
  signCustomerToken,
  signPartnerToken,
  signVisitorChatToken,
  verifyAdminToken,
  verifyCustomerToken,
  verifyPartnerToken,
  verifyVisitorChatToken,
} from '../lib/auth';
import { calculateOrderTotals } from '../lib/orderPricing';
import { canViewPrivateSettings, toPublicSettings } from '../lib/settingsSecurity';
import { escapeHtml } from '../lib/email';
import { validateAdminPassword } from '../lib/passwordSecurity';

test('recalcule le sous-total et la livraison côté serveur', () => {
  assert.deepEqual(
    calculateOrderTotals(
      [{ price: 1234.4, quantity: 2 }, { price: 5000, quantity: 1 }],
      2000,
      10000
    ),
    { subtotal: 7469, shippingFee: 2000, totalAmount: 9469 }
  );

  assert.deepEqual(calculateOrderTotals([{ price: 10000, quantity: 1 }], 2000, 10000), {
    subtotal: 10000,
    shippingFee: 0,
    totalAmount: 10000,
  });
});

test('les sessions signées admin, client et partenaire sont vérifiables', () => {
  const admin = signAdminToken({ userId: 'u1', email: 'admin@example.test', role: 'admin' });
  const customer = signCustomerToken({ customerId: 'c1' });
  const partner = signPartnerToken({ partnerId: 'p1', email: 'p@example.test', slug: 'p1' });

  assert.equal(verifyAdminToken(admin)?.role, 'admin');
  assert.equal(verifyCustomerToken(customer)?.customerId, 'c1');
  assert.equal(verifyPartnerToken(partner)?.partnerId, 'p1');
  assert.equal(verifyAdminToken(`${admin}tampered`), null);
});

test('le jeton visiteur du chat est signé, lié à un visiteur et expire', () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-32-characters';

  try {
    const token = signVisitorChatToken('v_test_123', 1);
    assert.equal(verifyVisitorChatToken(token)?.visitorId, 'v_test_123');
    assert.equal(verifyVisitorChatToken(`${token}tampered`), null);

    const expired = signVisitorChatToken('v_test_123', -1);
    assert.equal(verifyVisitorChatToken(expired), null);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('les jetons signés sans expiration numérique sont refusés', () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-32-characters';

  const signRawPayload = (payload: object) => {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET as string)
      .update(data)
      .digest('base64url');
    return `${data}.${signature}`;
  };

  try {
    assert.equal(
      verifyAdminToken(signRawPayload({ userId: 'u1', email: 'admin@example.test', role: 'admin' })),
      null,
    );
    assert.equal(
      verifyPartnerToken(signRawPayload({ partnerId: 'p1', email: 'p@example.test', slug: 'p1', exp: 'demain' })),
      null,
    );
    assert.equal(
      verifyCustomerToken(signRawPayload({ customerId: 'c1', exp: Date.now() - 1 })),
      null,
    );
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('les secrets de paramètres sont réservés au rôle admin', () => {
  const settings = {
    storeName: 'Boutique',
    geminiApiKey: 'secret',
    aiProvider: 'openai',
    aiModel: 'gpt-4.1',
    aiCustomInstructions: 'private instructions',
    customAgents: [{ name: 'private agent' }],
    smtpPass: 'password',
    smtpHost: 'smtp.example.test',
  };
  const publicSettings = toPublicSettings(settings);

  assert.equal(publicSettings.storeName, 'Boutique');
  assert.equal('geminiApiKey' in publicSettings, false);
  assert.equal('aiProvider' in publicSettings, false);
  assert.equal('aiModel' in publicSettings, false);
  assert.equal('aiCustomInstructions' in publicSettings, false);
  assert.equal('customAgents' in publicSettings, false);
  assert.equal('smtpPass' in publicSettings, false);
  assert.equal(canViewPrivateSettings({ userId: 'u', email: 'a', role: 'admin', exp: Date.now() + 1000 }), true);
  assert.equal(canViewPrivateSettings({ userId: 'u', email: 'a', role: 'vendeur', exp: Date.now() + 1000 }), false);
  assert.equal(canViewPrivateSettings({ userId: 'u', email: 'a', role: 'admin', isDemo: true, exp: Date.now() + 1000 }), true);
});

test('les valeurs HTML des emails sont échappées', () => {
  assert.equal(escapeHtml(`<script>alert('x')</script>`), '&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;');
});

test('le mode démo reste actif hors production', () => {
  const env = process.env as Record<string, string | undefined>;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDemo = process.env.ENABLE_DEMO_MODE;
  env.NODE_ENV = 'development';
  env.ENABLE_DEMO_MODE = 'true';
  assert.equal(isDemoModeEnabled(), true);
  env.ENABLE_DEMO_MODE = 'false';
  assert.equal(isDemoModeEnabled(), false);
  env.NODE_ENV = 'production';
  assert.equal(isDemoModeEnabled(), false);
  env.NODE_ENV = previousNodeEnv;
  if (previousDemo === undefined) delete process.env.ENABLE_DEMO_MODE;
  else process.env.ENABLE_DEMO_MODE = previousDemo;
});

test('la politique de mot de passe administrateur impose une valeur robuste', () => {
  assert.equal(validateAdminPassword('IvoireciAdmin2026!').valid, true);
  assert.equal(validateAdminPassword('court1!').valid, false);
  assert.equal(validateAdminPassword('motdepasseadmin').valid, false);
  assert.equal(validateAdminPassword('AdminPassword').valid, false);
  assert.equal(validateAdminPassword('A'.repeat(73) + '1!a').valid, false);
});

// --- Sécurité des intégrations Telegram / cron (fix/security-week1) ---
import { getTelegramWebhookSecret, verifyTelegramWebhookSecret } from '../lib/telegram';

test('Telegram webhook secret: dérivé de JWT_SECRET, stable et vérifiable', () => {
  process.env.JWT_SECRET = 'test-secret-for-webhook';
  const a = getTelegramWebhookSecret('123456:AAA-bot-token');
  const b = getTelegramWebhookSecret('123456:AAA-bot-token');
  assert.equal(a, b);
  assert.equal(a.length, 64);
  assert.ok(verifyTelegramWebhookSecret('123456:AAA-bot-token', a));
  assert.equal(verifyTelegramWebhookSecret('123456:AAA-bot-token', null), false);
  assert.equal(verifyTelegramWebhookSecret('123456:AAA-bot-token', 'wrong'), false);
  assert.equal(verifyTelegramWebhookSecret('other:token', a), false);
});

test('Telegram webhook secret: refuse de fonctionner sans JWT_SECRET', () => {
  const saved = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  assert.throws(() => getTelegramWebhookSecret('123456:AAA'));
  process.env.JWT_SECRET = saved;
});
