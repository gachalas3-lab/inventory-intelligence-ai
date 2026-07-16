import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs
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
            const upcs = items
    .filter(item => /^\d{12,13}$/.test(item.str))
    .map(item => item.str);

console.log("UPCs on page", page, upcs);
            console.log("PAGE", page);
const allText = items.map(item => item.str).join("\n");
console.log(allText);


           


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
if (text.startsWith("POG:")) {
    currentPOG = `${items[i + 1]?.str || ""} ${items[i + 2]?.str || ""}`.trim();
    console.log("POG FOUND:", currentPOG);
    continue;
}


                if (!/^\d{12,13}$/.test(items[i].str)) continue;
                console.log("----------");
console.log("PRODUCT:", items[i + 2]?.str);


for (let j = i; j < i + 35; j++) {


    const currentItem = items[j];


    if (!currentItem) continue;


    console.log(
        j - i,
        currentItem.str,
        "x:",
        Math.round(currentItem.transform[4]),
        "y:",
        Math.round(currentItem.transform[5])
    );


}


                const upc = items[i].str;
               


const name = items[i + 2]?.str || "";


let size = "";
let averageSales = "";
let shortQty = "";






for (let j = i + 1; j < Math.min(i + 35, items.length); j++) {


    const currentItem = items[j];
    const text = currentItem.str;
    const x = Math.round(currentItem.transform[4]);


    if (!size && /^\d+(\.\d+)?\s?(PK|ML|L)$/.test(text)) {
        size = text;
    }


    if (!averageSales && x > 650 && x < 680 && text.includes(".")) {
        averageSales = text;
    }


    if (!shortQty && x > 740 && x < 765 && /^\d+$/.test(text)) {
        shortQty = text;
    }


    if (size && averageSales && shortQty) {
        break;
    }
}


console.log("Using POG:", currentPOG, "for", upc);
console.log(name, "Short Qty =", shortQty);
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


        // Create a unique ID for this report
const reportId = file.name + "_" + products.length;


        const reportsRef = collection(db, "reports");


/*
const q = query(
    reportsRef,
    where("reportId", "==", reportId)
);


const existing = await getDocs(q);


if (!existing.empty) {
    alert("This report has already been uploaded.");
    return;
}
*/


console.log(reportId);
await addDoc(reportsRef, {
    reportId,
    uploadedAt: new Date().toISOString(),
    productCount: products.length,
    products
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
