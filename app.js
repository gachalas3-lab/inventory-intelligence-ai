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

        let allText = "";
        let currentDepartment = "";

        for (let page = 1; page <= pdf.numPages; page++) {

            const pdfPage = await pdf.getPage(page);
            const textContent = await pdfPage.getTextContent();
            console.log(textContent.items.slice(0, 30));
            console.log(textContent.items);

            const pageText = textContent.items
                .map(item => item.str)
                .join(" ");

            const match = pageText.match(/(\d{3})-([A-Z& ]+)/);

            if (match) {
                currentDepartment = match[2].trim();
            }

            allText += pageText + "\n";
        }

        const lines = allText.split("\n");
let products = [];

for (const line of lines) {

    const match = line.match(
        /(\d{12})\s+(.+?)\s+(\d+\s(?:PK|ML|L))\s+\d+\s+\w+\s+\w+\s+\w+\s+\d+\s+\d+\s+\d+\s+\d{8}\s+(\d+\.\d+)/
    );

    if (!match) continue;

    products.push({
        department: currentDepartment.replace(" POG", ""),
        upc: match[1],
        name: match[2].trim(),
        size: match[3],
        averageSales: match[4]
    });
}

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
    

        console.log(products);

    };

    reader.readAsArrayBuffer(file);

});