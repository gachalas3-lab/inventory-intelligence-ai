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

        for (let page = 1; page <= pdf.numPages; page++) {

            const pdfPage = await pdf.getPage(page);
            const textContent = await pdfPage.getTextContent();

            const items = textContent.items;

            // Find department name on this page
            const pageText = items.map(i => i.str).join(" ");
            const deptMatch = pageText.match(/(\d{3})-([A-Z& ]+)/);

            if (deptMatch) {
                currentDepartment = deptMatch[2].trim().replace(" POG", "");
            }

            // Look for every UPC
            for (let i = 0; i < items.length; i++) {

                if (!/^\d{12}$/.test(items[i].str)) continue;

                const upc = items[i].str;
                if (upc === "067000014581") {
    console.log(items.slice(i, i + 35).map(item => item.str));
}

const name = items[i + 2]?.str || "";

let size = "";
let averageSales = "";

for (let j = i + 1; j < Math.min(i + 35, items.length); j++) {

    const text = items[j].str;

    // Find the size
    if (!size && /^\d+(\.\d+)?\s?(PK|ML|L)$/.test(text)) {
        size = text;
    }

    // Debug every value we're checking
    console.log("Checking:", text);

    const num = Number(text);

    if (
        !averageSales &&
        !isNaN(num) &&
        text.includes(".")
    ) {
        averageSales = text;
    }

    if (size && averageSales) {
        break;
    }
}

    if (size && averageSales) break;
}

console.log({
    upc,
    size,
    averageSales
});

products.push({
    department: currentDepartment,
    upc,
    name,
    size,
    averageSales
});
console.log({
    upc,
    averageSales
});

            }

        }

        console.log(products);

        document.getElementById("results").innerHTML =
            products.map(p => `
                <div>
                    <b>${p.department}</b> |
                    ${p.upc} |
                    ${p.name} |
                    ${p.size} |
                    Avg Sales: ${p.averageSales}
                </div>
            `).join("");

    };

    reader.readAsArrayBuffer(file);

});