import { db } from "./firebase.js";
import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
console.log("APP STARTED");
const button = document.getElementById("analyzeBtn");

button.addEventListener("click", async () => {

    const file = document.getElementById("pdfUpload").files[0];

    if (!file) {
        alert("Please choose a PDF first.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function () {

        const typedArray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument({
            data: typedArray
        }).promise;

        let products = [];
let currentDepartment = "";
let currentPOG = "";

        for (let page = 1; page <= pdf.numPages; page++) {

            const pdfPage = await pdf.getPage(page);
            const textContent = await pdfPage.getTextContent();

            const items = textContent.items;
            console.log("PAGE", page);
console.log(items.map(item => item.str));

            

            // Look for every UPC
            for (let i = 0; i < items.length; i++) {

                const text = items[i].str;
                if (text.includes("POG")) {
    console.log("FOUND TEXT:", text);
}

// Detect department changes anywhere on the page
const deptMatch = text.match(/^(\d{3})-([A-Z& ]+)$/);

if (deptMatch) {
    const deptCode = deptMatch[2].trim();

    const departmentNames = {
        HBA: "HEALTH & BEAUTY",
        OTC: "OVER THE COUNTER",
        CONFECTION: "CONFECTION",
        BEVERAGE: "BEVERAGE",
        COSMETICS: "COSMETICS",
        BEAUTY: "BEAUTY"
    };



    currentDepartment = departmentNames[deptCode] || deptCode;
    continue;
}

// Detect POG changes
const pogMatch = text.match(/^POG:\d+\s+(.+)$/);

if (pogMatch) {
    currentPOG = pogMatch[1].trim();
    console.log("POG FOUND:", currentPOG);
    continue;
}

                if (!/^\d{12}$/.test(items[i].str)) continue;

                const upc = items[i].str;
                

const name = items[i + 2]?.str || "";

let size = "";
let averageSales = "";

for (let j = i + 1; j < Math.min(i + 35, items.length); j++) {

    const text = items[j].str;

    if (!size && /^\d+(\.\d+)?\s?(PK|ML|L)$/.test(text)) {
        size = text;
    }

    const num = Number(text);

    if (!averageSales && !isNaN(num) && text.includes(".")) {
        averageSales = text;
    }

    if (size && averageSales) {
        break;
    }
}

console.log("Using POG:", currentPOG, "for", upc);
products.push({
    department: currentDepartment,
    pog: currentPOG,
    upc,
    name,
    size,
    averageSales
});

            }

        }

        console.log(products);
        await addDoc(collection(db, "reports"), {
    uploadedAt: new Date().toISOString(),
    productCount: products.length,
    products: products
});

console.log("✅ Report saved to Firebase!");

        document.getElementById("results").innerHTML =
            products.map(p => `
                <div>
                    <b>${p.department}</b> |
                    ${p.pog} |
                    ${p.upc} |
                    ${p.name} |
                    ${p.size} |
                    Avg Sales: ${p.averageSales}
                </div>
            `).join("");

    };

    reader.readAsArrayBuffer(file);

});