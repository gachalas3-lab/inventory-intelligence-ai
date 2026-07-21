import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
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
const lastUpdated = document.getElementById("lastUpdated");
console.log(content);
const newestReport = reports[0];

const date = new Date(newestReport.uploadedAt);

lastUpdated.innerHTML =
    `🕒 Last Updated: ${date.toLocaleString()}`;

// Show Highest Priority page
function showPriority() {

    content.innerHTML = `

<h2>Highest Priority Reorders</h2>

<input
    id="prioritySearch"
    type="text"
    placeholder="🔍 Search priority reorders..."
>

<label><b>Show:</b></label>

<select id="priorityLimit">

    <option value="10">Top 10</option>

    <option value="25">Top 25</option>

    <option value="50" selected>Top 50</option>

    <option value="100">Top 100</option>

    <option value="99999">Show All</option>

</select>

<div class="priorityList">

${uniqueProducts
    .slice(
        0,
        Number(sessionStorage.getItem("priorityLimit") || 50)
    )
    .map((product, index) => `
<div class="priorityItem">

    <div class="priorityRank">
        #${index + 1}
    </div>

    <div class="priorityInfo">

        <div class="priorityName">
            ${product.name}
        </div>

        <div class="priorityUPC">
            UPC: ${product.upc}
        </div>

        <button class="barcodeBtn" data-upc="${product.upc}">
            📦 Show Barcode
        </button>

        <div class="barcodeContainer"></div>

        <div class="priorityDetails">
            📂 ${product.department} • 📍 ${product.pog}
        </div>

    </div>

    <div class="priorityAvg">

        <div class="avgLabel">
            Avg Sales
        </div>

        <div class="avgNumber">
            ${product.averageSales}
        </div>

    </div>

</div>

`).join("")}

</div>

`;


const prioritySearch = document.getElementById("prioritySearch");

prioritySearch.addEventListener("input", () => {

    const search = prioritySearch.value.toLowerCase();

    document.querySelectorAll(".priorityItem").forEach(item => {

        const text = item.innerText.toLowerCase();

        if (text.includes(search)) {
            item.style.display = "";
        }
        else {
            item.style.display = "none";
        }

    });

});

const priorityLimit = document.getElementById("priorityLimit");

priorityLimit.value =
    sessionStorage.getItem("priorityLimit") || "50";

priorityLimit.addEventListener("change", () => {

    sessionStorage.setItem(
        "priorityLimit",
        priorityLimit.value
    );

    showPriority();

});

document.querySelectorAll(".barcodeBtn").forEach(button => {

    button.addEventListener("click", () => {

        const container = button.nextElementSibling;

        if (container.innerHTML !== "") {
            container.innerHTML = "";
            button.textContent = "📦 Show Barcode";
            return;
        }

        container.innerHTML = `<svg></svg>`;

        JsBarcode(
            container.querySelector("svg"),
            button.dataset.upc,
            {
                format: "CODE128",
                displayValue: true,
                height: 60,
                width: 2
            }
        );

        button.textContent = "❌ Hide Barcode";

    });

});

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
        <h2>Department Overview</h2>

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

<input
    id="searchBox"
    type="text"
    placeholder="🔍 Search products..."
>

        ${departmentProducts.map((product, index) => `

<div class="departmentItem">

    <div class="departmentRank">
        #${index + 1}
    </div>

    <div class="departmentInfo">

    <div class="departmentText">

        <div class="departmentName">
            ${product.name}
        </div>

        <div class="departmentUPC">
            UPC: ${product.upc}
        </div>

        <button class="barcodeBtn" data-upc="${product.upc}">
            📦 Show Barcode
        </button>

        <div class="barcodeContainer"></div>

        <div class="departmentDetails">
            📍 ${product.pog}
        </div>

    </div>

    <div class="priorityAvg">

        <div class="avgLabel">
            Avg Sales
        </div>

        <div class="avgNumber">
            ${product.averageSales}
        </div>

        </div>

</div>

</div>

`).join("")}
    `;

    document.getElementById("backBtn")
        .addEventListener("click", showDepartments);
        const searchBox = document.getElementById("searchBox");

searchBox.addEventListener("input", () => {

    const search = searchBox.value.toLowerCase();

    document.querySelectorAll(".departmentItem").forEach(item => {

        const text = item.innerText.toLowerCase();

        if (text.includes(search)) {
            item.style.display = "";
        }
        else {
            item.style.display = "none";
        }

    });

});

// ADD THIS RIGHT HERE ↓↓↓
document.querySelectorAll(".barcodeBtn").forEach(button => {

    button.addEventListener("click", () => {

        const container = button.nextElementSibling;

        if (container.innerHTML !== "") {
            container.innerHTML = "";
            button.textContent = "📦 Show Barcode";
            return;
        }

        container.innerHTML = `<svg></svg>`;

        JsBarcode(
            container.querySelector("svg"),
            button.dataset.upc,
            {
                format: "CODE128",
                displayValue: true,
                height: 60,
                width: 2
            }
        );

        button.textContent = "❌ Hide Barcode";

    });

});

// Keep this closing brace
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
function showInsights() {

    const departments = {};

    uniqueProducts.forEach(product => {

        if (!departments[product.department]) {
            departments[product.department] = [];
        }

        departments[product.department].push(product);

    });

   let highestDemandDepartment = "";

let highestScore = 0;

let highestAverage = 0;

Object.entries(departments).forEach(([name, products]) => {

    const average =
        products.reduce(
            (sum, p) => sum + Number(p.averageSales),
            0
        ) / products.length;

    const highDemandProducts =
        products.filter(
            product => Number(product.averageSales) >= 3
        ).length;

    const priorityScore =
        (highDemandProducts * 2)
        + average
        + (products.length / 20);

    if (priorityScore > highestScore) {

        highestScore = priorityScore;

        highestAverage = average;

        highestDemandDepartment = name;

    }

});

    const largestDepartment =
        Object.entries(departments)
            .sort((a,b)=>b[1].length-a[1].length)[0];

    const highestProduct = uniqueProducts[0];

    content.innerHTML = `

<h2>🤖 AI Insights</h2>

<div class="insightCard">

<h3>🔥 Highest Demand Department</h3>

<p><b>${highestDemandDepartment}</b></p>

<p>

Priority Score: ${highestScore.toFixed(1)}

</p>

</div>

<div class="insightCard">

<h3>📦 Largest Department</h3>

<p><b>${largestDepartment[0]}</b></p>

<p>${largestDepartment[1].length} products</p>

</div>

<div class="insightCard">

<h3>⭐ Highest Demand Product</h3>

<p><b>${highestProduct.name}</b></p>

<p>Average Sales: ${highestProduct.averageSales}</p>

</div>

<div class="insightCard">

<h3>📊 Inventory Summary</h3>

<p>${uniqueProducts.length} products currently tracked.</p>

</div>

<div class="insightCard">

<h3>💡 Recommendation</h3>

<p>

Focus upcoming replenishment efforts on
<b>${highestDemandDepartment}</b>.
This department currently has the strongest overall demand,
while <b>${highestProduct.name}</b> is your highest-selling product.

</p>

</div>

`;

}

async function showReports() {

    const snapshot = await getDocs(collection(db, "reports"));

    const reports = [];

    snapshot.forEach(docSnap => {

        reports.push({
            id: docSnap.id,
            ...docSnap.data()
        });

    });

    content.innerHTML = `

<div class="reportsHeader">

    <h2>🗄 Reports Database</h2>

    <h3>${reports.length} Reports Stored</h3>

    <button id="deleteAllBtn">
         Clear Entire Database
    </button>

</div>

<hr>

${reports.map(report => `

<div class="reportCard">

    <div class="reportName">
        ${report.reportId}
    </div>

    <div class="reportCount">
        ${report.productCount} products
    </div>

    <button class="deleteReportBtn"
        data-id="${report.id}">
         Delete
    </button>

</div>

`).join("")}

`;

document.querySelectorAll(".deleteReportBtn").forEach(button => {

    button.addEventListener("click", async () => {

        if (!confirm("Delete this report?")) return;

        await deleteDoc(
            doc(db, "reports", button.dataset.id)
        );

        showReports();

    });

});

document.getElementById("deleteAllBtn").addEventListener("click", async () => {

    if (!confirm("Delete ALL reports?")) return;

    const snapshot = await getDocs(collection(db, "reports"));

    for (const report of snapshot.docs) {

        await deleteDoc(report.ref);

    }

    showReports();

});

}

// Button clicks
document.getElementById("priorityBtn")
    .addEventListener("click", showPriority);

document.getElementById("departmentBtn")
    .addEventListener("click", showDepartments);
    document.getElementById("insightsBtn")
    .addEventListener("click", showInsights);
    document.getElementById("reportsBtn")
    .addEventListener("click", showReports);

// Open on Highest Priority by default
showPriority();