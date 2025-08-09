let glucoseData = JSON.parse(localStorage.getItem("glucoseData")) || [];
let chart;

const testTimes = {
    "Fasting Glucose": "",
    "Post-breakfast": "",
    "Pre-lunch": "",
    "Post-lunch": "",
    "Pre-dinner": "",
    "Post-dinner": "",
    "Random": ""
};

document.addEventListener("DOMContentLoaded", () => {
    updateList();
    updateChart();
    checkWeeklyReminder();
    loadTheme();
});

function addGlucose() {
    const glucose = parseInt(document.getElementById("glucoseInput").value);
    const date = document.getElementById("dateInput").value;
    const testType = document.getElementById("testTypeInput").value;
    const insulin = parseFloat(document.getElementById("insulinInput").value) || 0;
    const glargine = parseFloat(document.getElementById("glargineInput").value) || 0;

    const hour = document.getElementById("hourSelect").value;
    const minute = document.getElementById("minuteSelect").value;
    const ampm = document.getElementById("ampmSelect").value;

    if (!hour || !minute || !ampm) {
        alert("Please select full time (hour, minute, AM/PM).");
        return;
    }

    // Convert to 24-hour format
    let hr = parseInt(hour);
    if (ampm === "PM" && hr !== 12) {
        hr += 12;
    } else if (ampm === "AM" && hr === 12) {
        hr = 0;
    }
    const time = `${String(hr).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    if (!glucose || !date) {
        alert("Please enter valid glucose and date.");
        return;
    }

    const timestamp = `${date} ${time} ${ampm}`;
    const entry = { glucose, timestamp, testType, insulin, glargine };
    glucoseData.push(entry);
    localStorage.setItem("glucoseData", JSON.stringify(glucoseData));

    updateList();
    updateChart();
    clearInputs();
}


function updateList() {
    const list = document.getElementById("entryList");
    list.innerHTML = "";

    glucoseData.slice().reverse().forEach((entry, index) => {
        const item = document.createElement("div");
        item.className = `rounded shadow transition transform ${
      entry.glucose > 350
        ? "alert-high"
        : entry.glucose < 70
        ? "alert-low"
        : "bg-white dark:bg-gray-700"
    }`;

        item.innerHTML = `
      <strong>${entry.timestamp}</strong> – ${entry.testType}<br/>
      Glucose: <strong>${entry.glucose} mg/dL</strong><br/>
      Insulin: ${entry.insulin || 0} u, Glargine: ${entry.glargine || 0} u
      <span class="material-symbols-outlined" onclick"></span>
    `;
        list.appendChild(item);
    });
}

function updateChart() {
    const ctx = document.getElementById("glucoseChart").getContext("2d");
    if (chart) chart.destroy();

    const labels = glucoseData.map(e => e.timestamp);
    const data = glucoseData.map(e => e.glucose);
    const insulinData = glucoseData.map(e => e.insulin || 0);
    const glargineData = glucoseData.map(e => e.glargine || 0);

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Glucose (mg/dL)",
                data,
                borderColor: "rgb(255, 99, 132)",
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: (ctx) => {
                            const i = ctx.dataIndex;
                            return `Insulin: ${insulinData[i]} u, Glargine: ${glargineData[i]} u`;
                        }
                    }
                }
            }
        }
    });
}

function clearInputs() {
    document.getElementById("glucoseInput").value = "";
    document.getElementById("dateInput").value = "";
    document.getElementById("timeOnlyInput").value = "";
    document.getElementById("insulinInput").value = "";
    document.getElementById("glargineInput").value = "";
    document.getElementById("testTypeInput").selectedIndex = 0;
    document.getElementById("timePickerDiv").classList.add("hidden");
}



async function downloadReport() {
    if (glucoseData.length === 0) {
        alert("No data to download!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableData = glucoseData.map(entry => [
        entry.timestamp,
        entry.testType,
        `${entry.glucose} mg/dL`,
        `${entry.insulin || 0} u`,
        `${entry.glargine || 0} u`
    ]);

    doc.text("Glucose Tracker Report", 14, 14);
    doc.autoTable({
        head: [
            ["Timestamp", "Type", "Glucose", "Insulin", "Glargine"]
        ],
        body: tableData,
        startY: 20,
    });

    doc.save("glucose_report.pdf");

    // Clear data after download
    glucoseData = [];
    localStorage.removeItem("glucoseData");
    updateList();
    updateChart();
}

function loadTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    document.getElementById("darkModeToggle").addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        const isDark = document.documentElement.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

function checkWeeklyReminder() {
    const lastReminder = localStorage.getItem("lastReminder") || 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (glucoseData.length >= 10 && now - lastReminder > oneWeek) {
        setTimeout(() => {
            alert("📝 You have not downloaded your glucose report in a while. Consider exporting it!");
            localStorage.setItem("lastReminder", now);
        }, 2000);
    }
}
