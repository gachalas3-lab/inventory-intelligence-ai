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

            const pageText = textContent.items
                .map(item => item.str)
                .join(" ");

            const match = pageText.match(/(\d{3})-([A-Z& ]+)/);

            if (match) {
                currentDepartment = match[2].trim();
            }

            allText += pageText + "\n";
        }

        const upcs = allText.match(/\d{12}/g) || [];
        const pieces = allText.split(/\d{12}\s/);

        let products = [];

        for (let i = 1; i < pieces.length; i++) {

            let name = pieces[i]
                .split(/\d+\sPK|\d+\sML|\d+\sL/)[0]
                .trim()
                .replace(/\s+/g, " ");

            products.push({
                department: currentDepartment,
                upc: upcs[i - 1],
                name: name
            });
        }

        document.getElementById("results").innerHTML =
            products.map(p =>
                `<div><b>${p.department}</b> | ${p.upc} | ${p.name}</div>`
            ).join("");

        console.log(products);

    };

    reader.readAsArrayBuffer(file);

});