const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Papa = require("papaparse");
const path = require("path");

const app = express();
const PORT = 3000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(express.static("public"));

app.post("/upload", upload.single("csvFile"), (req, res) => {
  const filePath = req.file.path;
  const csvData = fs.readFileSync(filePath, "utf8");

  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      let data = results.data;

      let numericCols = {};
      let rowCount = data.length;

      data.forEach(row => {
        for (let key in row) {
          let val = parseFloat(row[key]);
          if (!isNaN(val)) {
            if (!numericCols[key]) numericCols[key] = [];
            numericCols[key].push(val);
          }
        }
      });

      let averages = {};
      for (let col in numericCols) {
        averages[col] =
          numericCols[col].reduce((a, b) => a + b, 0) / numericCols[col].length;
      }

      let firstNumeric = Object.keys(numericCols)[0];
      if (firstNumeric) {
        data.sort((a, b) => parseFloat(a[firstNumeric]) - parseFloat(b[firstNumeric]));
      }

      res.json({ summary: averages, optimizedData: data });
    }
  });
});

app.listen(PORT, () => console.log(Server running at http://localhost:${PORT}));
