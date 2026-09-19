import assert from 'node:assert/strict';
import test from 'node:test';
import { extractPriceFromText } from '../lib/telegramProductPublisher';

test('extractPriceFromText handles various African and standard pricing notations', () => {
  assert.equal(extractPriceFromText('45000'), 45000);
  assert.equal(extractPriceFromText('45 000 FCFA'), 45000);
  assert.equal(extractPriceFromText('45.000 FCFA'), 45000);
  assert.equal(extractPriceFromText('Prix: 25000f'), 25000);
  assert.equal(extractPriceFromText('Superbe robe de soirée, prix 35 000 frs'), 35000);
  assert.equal(extractPriceFromText('Chaussure sneaker Nike 50k pointure 42'), 50000);
  assert.equal(extractPriceFromText('Montre Rolex or 150k'), 150000);
  assert.equal(extractPriceFromText('iPhone 16 Pro Max 950 000 FCFA Dubaï'), 950000);
  assert.equal(extractPriceFromText('Sans prix précisé ici'), null);
});
