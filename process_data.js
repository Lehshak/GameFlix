const csvtojson = require("csvtojson");
const fs = require('fs');

// Convert CSV to JSON
csvtojson()
  .fromFile("steam_games.csv")  // Replace with your CSV file
  .then((jsonObj) => {
    // Write JSON output to a file
    fs.writeFileSync('steam_games.json', JSON.stringify(jsonObj, null, 2)); // Save as JSON
    console.log("CSV data saved as steam_games.json");
  })
  .catch((err) => {
    console.error("Error:", err);
  });