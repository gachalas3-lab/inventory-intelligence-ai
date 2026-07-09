import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Get every report
const snapshot = await getDocs(collection(db, "reports"));

const reports = snapshot.docs.map(doc => doc.data());
console.log("Reports found:", reports.length);

reports.forEach((report, index) => {
    console.log(
        `Report ${index + 1}:`,
        report.reportId,
        report.productCount
    );
});

// Sort newest first
reports.sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
);

// Combine products from every report
const products = reports.flatMap(report => report.products);

// Remove duplicate UPCs
const seen = new Set();

const uniqueProducts = products.filter(product => {
    if (seen.has(product.upc)) {
        return false;
    }
    seen.add(product.upc);
    return true;
});

// Sort highest average sales first
uniqueProducts.sort(
    (a, b) => Number(b.averageSales) - Number(a.averageSales)
);

// Take the top 20
const top20 = uniqueProducts.slice(0, 20);

const content = document.getElementById("content");
console.log(content);

// Show Highest Priority page
function showPriority() {

    content.innerHTML =
        top20.map(p => `
            <div style="margin-bottom:15px;">
                <b>${p.name}</b><br>
                ${p.department} | ${p.pog}<br>
                Avg Sales: ${p.averageSales}
            </div>
        `).join("");

}

// Show Department page (placeholder for now)
function showDepartments() {

    content.innerHTML = `
        <h2>Restocking Priority by Department</h2>

        <p>Department buttons will go here.</p>
    `;

}

// Button clicks
document.getElementById("priorityBtn")
    .addEventListener("click", showPriority);

document.getElementById("departmentBtn")
    .addEventListener("click", showDepartments);

// Open on Highest Priority by default
showPriority();