// Test PLL price extraction
const fs = require('fs');
const Papa = require('papaparse');

const csvContent = fs.readFileSync('public/static/data/Elevra Lithium DRC Stock Price History.csv', 'utf8');

Papa.parse(csvContent, {
    header: true,
    complete: (results) => {
        const data = results.data;
        console.log('Total rows:', data.length);
        console.log('\nFirst 3 rows:');
        data.slice(0, 3).forEach(row => {
            console.log('Date:', row.Date, '| Close:', row.Close, '| Price:', row.Price);
        });
        
        // Test what happens with row.Close || row.Price
        const testRow = data[0];
        const price = parseFloat(testRow.Close || testRow.Price);
        console.log('\nTest row.Close || row.Price:', price);
        console.log('testRow.Close:', testRow.Close);
        console.log('testRow.Price:', testRow.Price);
    }
});
