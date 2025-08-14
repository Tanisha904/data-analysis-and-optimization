// app.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Papa = require("papaparse");
const path = require("path");

const app = express();
const PORT = 3000;

// Ensure uploads folder exists
fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("csvFile"), (req, res) => {
  try {
    const filePath = req.file.path;
    const csvData = fs.readFileSync(filePath, "utf8");

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const numericCols = {};

        data.forEach((row) => {
          for (const key in row) {
            const val = parseFloat(String(row[key]).replace(/,/g, "")); // handle "1,234"
            if (!isNaN(val) && isFinite(val)) {
              if (!numericCols[key]) numericCols[key] = [];
              numericCols[key].push(val);
            }
          }
        });

        // Compute averages
        const averages = {};
        for (const col in numericCols) {
          const arr = numericCols[col];
          averages[col] = arr.reduce((a, b) => a + b, 0) / arr.length;
        }

        // "Optimize": sort by first numeric column if exists
        const firstNumeric = Object.keys(numericCols)[0];
        if (firstNumeric) {
          data.sort(
            (a, b) =>
              parseFloat((a[firstNumeric] || "").toString().replace(/,/g, "")) -
              parseFloat((b[firstNumeric] || "").toString().replace(/,/g, ""))
          );
        }

        res.json({ summary: averages, optimizedData: data });
      },
      error: (err) => {
        console.error(err);
        res.status(400).json({ error: "Failed to parse CSV." });
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error processing file." });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
// Serve the frontend