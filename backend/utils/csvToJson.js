const fs = require('fs');
const csv = require('csv-parser');

/**
 * Convert CSV file to JSON features array
 * Extracts first row and converts to 22 float values
 * 
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<{features: number[]}>} - Object with features array
 */
function csvToJson(filePath) {
  return new Promise((resolve, reject) => {
    const features = [];
    let rowCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (rowCount === 0) {
          // Get first data row (skip header)
          const values = Object.values(row);
          
          // Convert to floats and take first 22 values
          for (let i = 0; i < Math.min(22, values.length); i++) {
            const value = parseFloat(values[i]);
            if (isNaN(value)) {
              reject(new Error(`Invalid numeric value at column ${i + 1}: ${values[i]}`));
              return;
            }
            features.push(value);
          }

          if (features.length !== 22) {
            reject(new Error(`Expected 22 features, found ${features.length} in CSV`));
            return;
          }
        }
        rowCount++;
      })
      .on('end', () => {
        if (features.length === 0) {
          reject(new Error('CSV file is empty or has no data rows'));
          return;
        }

        console.log(`✅ CSV parsed: ${features.length} features extracted from row 1 of ${rowCount} rows`);
        resolve({ features });
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

module.exports = csvToJson;
