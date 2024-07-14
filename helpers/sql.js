const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
 * Creates SQL `UPDATE` statement components from an object of data to update.
 * Throws a BadRequestError if no data is provided.
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql = {}) {
  // Get keys from the dataToUpdate object
  const keys = Object.keys(dataToUpdate);

  // Check if there are keys; throw error if not
  if (keys.length === 0) throw new BadRequestError("No data");

  // Map keys to SQL column=value format
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  // Return setCols and values for SQL statement
  return {
    setCols: cols.join(", "),  // Comma-separated list of SQL column=value pairs
    values: Object.values(dataToUpdate),  // Array of values to substitute in SQL statement
  };
}


module.exports = { sqlForPartialUpdate };
