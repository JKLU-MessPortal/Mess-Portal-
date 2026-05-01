describe('Sample Test Suite', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true);
  });

  it('should test simple math', () => {
    const sum = 1 + 2;
    expect(sum).toEqual(3);
  });
});
