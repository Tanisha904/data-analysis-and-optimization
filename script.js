/* public/scripts.js */
let chartRef = null;

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();

    // Build summary list
    let summaryHTML = "<h2>Summary (Averages)</h2><ul>";
    for (const key in data.summary) {
      summaryHTML += `<li>${key}: ${data.summary[key].toFixed(2)}</li>`;
    }
    summaryHTML += "</ul>";

    // Build table
    summaryHTML += "<h2>Optimized Data</h2><table border='1'><tr>";
    if (data.optimizedData.length > 0) {
      Object.keys(data.optimizedData[0]).forEach(col => {
        summaryHTML += `<th>${col}</th>`;
      });
      summaryHTML += "</tr>";

      data.optimizedData.forEach(row => {
        summaryHTML += "<tr>";
        Object.values(row).forEach(val => {
          summaryHTML += `<td>${val}</td>`;
        });
        summaryHTML += "</tr>";
      });
    }
    summaryHTML += "</table>";

    document.getElementById("results").innerHTML = summaryHTML;

    // Destroy old chart if exists
    if (chartRef) {
      chartRef.destroy();
    }

    // Create new chart
    const ctx = document.getElementById("chart").getContext("2d");
    chartRef = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data.summary),
        datasets: [{
          label: "Average Values",
          data: Object.values(data.summary),
          backgroundColor: "rgba(75, 192, 192, 0.6)"
        }]
      }
    });

  } catch (err) {
    console.error(err);
  }
});
