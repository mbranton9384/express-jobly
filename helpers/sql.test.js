const { sqlForPartialUpdate } = require('../helpers/sql');
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', () => {
    test('should generate correct SQL components and values', () => {
      const dataToUpdate = {
        name: 'New Name',
        description: 'New Description',
        numEmployees: 100
      };
  
      const expectedOutput = {
        setCols: 'name=$1, description=$2, num_employees=$3',
        values: ['New Name', 'New Description', 100]
      };
  
      const result = sqlForPartialUpdate(dataToUpdate, { numEmployees: 'num_employees' });
      expect(result).toEqual(expectedOutput);
    });
  
    test('should throw BadRequestError if no data is provided', () => {
      try {
        sqlForPartialUpdate({});
        fail('Expected BadRequestError');
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        expect(err.message).toBe('No data');
      }
    });
  });
  