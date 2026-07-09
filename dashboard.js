import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Get every report
const snapshot = await getDocs(collection(db, "reports"));

const reports = snapshot.docs.map(doc => doc.data());

// Sort newest first
reports.sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
);

// Get newest report
const latestReport = reports[0];

// Get its products
const products = latestReport.products;

// Sort highest average sales first
products.sort(
    (a, b) => Number(b.averageSales) - Number(a.averageSales)
);

// Take the top 20
const top20 = products.slice(0, 20);

// Display them
document.getElementById("priorityList").innerHTML =
    top20.map(p => `
        <div style="margin-bottom:15px;">
            <b>${p.name}</b><br>
            ${p.department} | ${p.pog}<br>
            Avg Sales: ${p.averageSales}
        </div>
    `).join("");