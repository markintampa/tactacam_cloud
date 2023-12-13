import { handler } from '../lambda-fns/orderPizza';

describe('Pizza Order Lambda Function', () => {
  const validOrder = {
    flavour: 'pepperoni',
    size: 'large',
    toppings: ['cheese', 'pepperoni'],
    address: '1234 Smith St',
    delivery: true,
  };

  const invalidOrder = {
    flavour: 'pineapple',
    size: 'small',
    toppings: ['pineapple', 'ham'],
    address: '5678 Main St',
    delivery: true,
  };

  it('should handle a valid pizza order', async () => {
    const result = await handler(validOrder);
    expect(result.containsPineapple).toBe(false);
    expect(result.errors).toEqual([]);
  });

  it('should handle an invalid pizza order with pineapple', async () => {
    const result = await handler(invalidOrder);
    expect(result.containsPineapple).toBe(true);
    expect(result.errors).toContain('Missing/invalid address');
  });

  it('should handle an invalid pizza order with missing address', async () => {
    const invalidOrderWithoutAddress = { ...invalidOrder, address: '' };
    const result = await handler(invalidOrderWithoutAddress);
    expect(result.containsPineapple).toBe(true);
    expect(result.errors).toContain('Missing/invalid address');
  });
});
