document.getElementById("uploadForm").addEventListener("submit", function(e) {
  e.preventDefault();
  let formData = new FormData(this);

  fetch("/upload", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
    
      let summaryHTML = "<h2>Summary (Averages)</h2><ul>";
      for (let key in data.summary) {
        summaryHTML += <li>${key}: ${data.summary[key].toFixed(2)}</li>;
      }
      summaryHTML += "</ul>";

      summaryHTML += "<h2>Optimized Data</h2><table border='1'><tr>";
      if (data.optimizedData.length > 0) {
        Object.keys(data.optimizedData[0]).forEach(col => {
          summaryHTML += <th>${col}</th>;
        });
        summaryHTML += "</tr>";

        data.optimizedData.forEach(row => {
          summaryHTML += "<tr>";
          Object.values(row).forEach(val => {
            summaryHTML += <td>${val}</td>;
          });
          summaryHTML += "</tr>";
        });
      }
      summaryHTML += "</table>";

      document.getElementById("results").innerHTML = summaryHTML;

      let firstCol = Object.keys(data.summary)[0];
      let ctx = document.getElementById("chart").getContext("2d");
      new Chart(ctx, {
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
    })
    .catch(err => console.error(err));
});