// script.js

let entries = JSON.parse(localStorage.getItem("glucoseData")) || [];

const addBtn = document.getElementById("addBtn");
const glucoseInput = document.getElementById("glucose");
const testTypeSelect = document.getElementById("testType");
const insulinInput = document.getElementById("insulin");
const glargineInput = document.getElementById("glargine");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const downloadBtn = document.getElementById("downloadBtn");
const reportSection = document.getElementById("report");

function updateLocalStorage() {
  localStorage.setItem("glucoseData", JSON.stringify(entries));
}

function addEntry() {
  const glucose = parseInt(glucoseInput.value);
  const testType = testTypeSelect.value;
  const insulin = insulinInput.value;
  const glargine = glargineInput.value;
  const date = dateInput.value;
  const time = testType === "Random" ? timeInput.value : getDefaultTime(testType);

  const entry = { glucose, testType, insulin, glargine, date, time };
  entries.push(entry);
  updateLocalStorage();
  renderEntries();
}

function renderEntries() {
  reportSection.innerHTML = "";
  entries.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "p-2 border-b";
    div.innerHTML = `${entry.date} - ${entry.time} | ${entry.testType} - Glucose: ${entry.glucose} - Insulin: ${entry.insulin} - Glargine: ${entry.glargine}`;
    reportSection.appendChild(div);
  });
}

function getDefaultTime(testType) {
  const defaults = {
    Fasting: "08:00",
    "Post-Breakfast": "10:00",
    "Pre-Lunch": "13:00",
    "Post-Lunch": "15:00",
    "Pre-Dinner": "19:00",
    "Post-Dinner": "21:00",
    "3AM": "03:00",
  };
  return defaults[testType] || "";
}

function downloadPDF() {
  if (entries.length === 0) {
    alert("No data to export.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Glucose & Insulin Report", 14, 15);
  doc.autoTable({
    startY: 20,
    head: [["Date", "Time", "Test Type", "Glucose", "Insulin", "Glargine"]],
    body: entries.map(e => [e.date, e.time, e.testType, e.glucose, e.insulin, e.glargine]),
  });
  doc.save("glucose_report.pdf");

  // Clear data from localStorage and reload entries
  localStorage.removeItem("glucoseData");
  entries = [];
  renderEntries();
}

addBtn.addEventListener("click", addEntry);
downloadBtn.addEventListener("click", downloadPDF);

renderEntries();
