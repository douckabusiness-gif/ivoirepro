import assert from 'node:assert/strict';
import test from 'node:test';

const enabled = process.env.RUN_INTEGRATION_TESTS === 'true';
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function getCookie(path: string, body: Record<string, unknown>, name: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const setCookie = response.headers.get('set-cookie') || '';
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  assert.equal(response.status, 200, `${path} doit accepter la session démo`);
  assert.ok(match?.[1], `cookie ${name} absent`);
  return match[1];
}

test('les sessions démo et les permissions de commandes fonctionnent', { skip: !enabled }, async () => {
  const adminCookie = await getCookie('/api/auth/login', { isDemo: true }, 'admin_session');
  await getCookie('/api/customer/login', { isDemo: true }, 'customer_session');
  await getCookie('/api/partners/login', { isDemo: true }, 'partner_session');

  const publicSettings = await fetch(`${baseUrl}/api/settings`);
  assert.equal(publicSettings.status, 200);
  const publicBody = await publicSettings.json() as Record<string, unknown>;
  assert.equal('smtpPass' in publicBody, false);

  const privateSettings = await fetch(`${baseUrl}/api/settings`, {
    headers: { cookie: `admin_session=${adminCookie}` },
  });
  assert.equal(privateSettings.status, 200);
  assert.equal('smtpPass' in await privateSettings.json(), true);

  const orders = await fetch(`${baseUrl}/api/orders`, {
    headers: { cookie: `admin_session=${adminCookie}` },
  });
  assert.equal(orders.status, 200);
  const orderList = await orders.json() as Array<{ id: string }>;
  assert.ok(orderList.length > 0, 'la base démo doit contenir une commande');

  const withoutSession = await fetch(`${baseUrl}/api/orders/${orderList[0].id}`);
  assert.equal(withoutSession.status, 401);
  const withSession = await fetch(`${baseUrl}/api/orders/${orderList[0].id}`, {
    headers: { cookie: `admin_session=${adminCookie}` },
  });
  assert.equal(withSession.status, 200);
});

test('deux commandes concurrentes ne peuvent pas dépasser le stock', { skip: !enabled }, async () => {
  const { prisma } = await import('../lib/prisma');
  const product = await prisma.product.findFirst({
    select: { id: true, price: true, stockCount: true, inStock: true },
  });
  assert.ok(product, 'un produit est nécessaire pour le test de stock');

  const testEmail = 'codex-stock-test@example.invalid';
  const originalStock = { stockCount: product.stockCount, inStock: product.inStock };
  try {
    await prisma.order.deleteMany({ where: { customerEmail: testEmail } });
    await prisma.product.update({ where: { id: product.id }, data: { stockCount: 1, inStock: true } });
    const payload = {
      customerName: 'Test concurrence',
      customerPhone: '+221770000000',
      customerEmail: testEmail,
      customerAddress: 'Adresse de test',
      customerCity: 'Dakar',
      paymentMethod: 'cod',
      totalAmount: 1,
      items: [{ productId: product.id, quantity: 1 }],
    };
    const responses = await Promise.all([
      fetch(`${baseUrl}/api/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
      fetch(`${baseUrl}/api/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    ]);
    assert.equal(responses.filter((response) => response.status === 201).length, 1);
  } finally {
    await prisma.order.deleteMany({ where: { customerEmail: testEmail } });
    await prisma.product.update({ where: { id: product.id }, data: originalStock });
    await prisma.$disconnect();
  }
});
