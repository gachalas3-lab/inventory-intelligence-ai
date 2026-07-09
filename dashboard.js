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

    // Count products in each department
    const departments = {};

    uniqueProducts.forEach(product => {

        if (!departments[product.department]) {
            departments[product.department] = [];
        }

        departments[product.department].push(product);

    });

    // Build buttons
    content.innerHTML = `
        <h2>Restocking Priority by Department</h2>

        ${Object.entries(departments)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([name, products]) => {

    const avgDemand =
        products.reduce(
            (sum, p) => sum + Number(p.averageSales),
            0
        ) / products.length;

    return `
        <button class="deptButton" data-dept="${name}">

            <div class="deptEmoji">${getDepartmentEmoji(name)}</div>

            <div class="deptTitle">${name}</div>

            <div class="deptDemand">
                Avg Demand: ${avgDemand.toFixed(2)}
            </div>

            <div class="deptCount">
                ${products.length} products to review
            </div>

        </button>
    `;

})
            .join("")}
    `;
    document.querySelectorAll(".deptButton").forEach(button => {

    button.addEventListener("click", () => {

        const department = button.dataset.dept;

        showDepartmentProducts(department);

    });

});

}
function showDepartmentProducts(department) {

    const departmentProducts = uniqueProducts.filter(
        product => product.department === department
    );

    departmentProducts.sort(
        (a, b) => Number(b.averageSales) - Number(a.averageSales)
    );

    content.innerHTML = `
        <button id="backBtn">⬅ Back</button>

        <h2>${department}</h2>

        ${departmentProducts.map(product => `
            <div style="margin-bottom:15px;">
                <b>${product.name}</b><br>
                ${product.pog}<br>
                Avg Sales: ${product.averageSales}
            </div>
        `).join("")}
    `;

    document.getElementById("backBtn")
        .addEventListener("click", showDepartments);

}
function getDepartmentEmoji(name) {

    switch (name) {

        case "OVER THE COUNTER":
            return "💊";

        case "HEALTH & BEAUTY":
            return "🧴";

        case "COSMETICS":
            return "💄";

        case "HAIRCARE":
            return "💇";

        case "BEVERAGE":
            return "🥤";

        case "CONFECTION":
            return "🍫";

        case "HOUSEHOLD":
            return "🧹";

        case "FOOD":
            return "🍽️";

        case "BABY":
            return "👶";

        case "NUTRA":
            return "💚";

        case "PRESTIGE":
            return "✨";

        case "DERM":
            return "🩹";

        case "SEASONAL":
            return "🎁";

        case "FRONT OF STORE":
            return "🛒";

        case "ENTERTAINMENT":
            return "🎮";

        default:
            return "📦";

    }

}
function getDepartmentPriority(products) {

    const sorted = [...products].sort(
        (a, b) => Number(b.averageSales) - Number(a.averageSales)
    );

    const topProducts = sorted.slice(0, 10);

    const average =
        topProducts.reduce(
            (sum, product) => sum + Number(product.averageSales),
            0
        ) / topProducts.length;

    if (average >= 5) {
        return "high";
    }

    if (average >= 3) {
        return "medium";
    }

    return "low";
}
// Button clicks
document.getElementById("priorityBtn")
    .addEventListener("click", showPriority);

document.getElementById("departmentBtn")
    .addEventListener("click", showDepartments);

// Open on Highest Priority by default
showPriority();