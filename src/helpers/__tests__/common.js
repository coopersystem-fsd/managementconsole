import * as helpers from '../common';

describe('helpers/common', () => {
  describe('getPaginationInfo fn', () => {
    it('should return pagin info', () => {
      const pagin = helpers.getPaginationInfo({ currentPage: 1, totalItems: 50, pageSize: 25 });
      expect(pagin).toBe('Showing 1 - 25 of 50 items');
    });
    it('should return pagin info', () => {
      const pagin = helpers.getPaginationInfo({ currentPage: 1, totalItems: 25, pageSize: 25 });
      expect(pagin).toBe('Showing 25 items');
    });
    it('should return false', () => {
      const pagin = helpers.getPaginationInfo({});
      expect(pagin).toBe(false);
    });
  });
});
