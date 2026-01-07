import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcularPercentil } from '../percentiles.services';

describe('Percentile Calculations', () => {
  it('should be created', () => {
    assert.strictEqual(true, true);
  });

  it('should calculate the 50th percentile for weight of a newborn boy', () => {
    const percentil = calcularPercentil(0, 3.4, 'niño', 'peso');
    assert.strictEqual(Math.round(percentil!), 50);
  });

  it('should calculate the 50th percentile for height of a newborn boy', () => {
    const percentil = calcularPercentil(0, 50.5, 'niño', 'talla');
    assert.strictEqual(Math.round(percentil!), 50);
  });

  it('should calculate the 50th percentile for weight of a 5-year-old boy (current data)', () => {
    const percentil = calcularPercentil(60, 19.6, 'niño', 'peso');
    assert.strictEqual(Math.round(percentil!), 50);
  });

  it('should calculate the 50th percentile for height of a 12-year-old boy', () => {
    const percentil = calcularPercentil(144, 145.20, 'niño', 'talla');
    assert.strictEqual(Math.round(percentil!), 50);
  });

  it('should calculate the 50th percentile for weight of a 12-year-old boy', () => {
    const percentil = calcularPercentil(144, 38.40, 'niño', 'peso');
    assert.strictEqual(Math.round(percentil!), 50);
  });
});
