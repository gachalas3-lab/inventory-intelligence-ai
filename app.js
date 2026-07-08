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

    for (let page = 1; page <= pdf.numPages; page++) {

        const pdfPage = await pdf.getPage(page);
        const textContent = await pdfPage.getTextContent();

        allText += textContent.items.map(item => item.str).join(" ");
        allText += "\n";
    }

    const lines = allText.split(/\d{12}\s/);

    let products = [];

    for (let i = 1; i < lines.length; i++) {

        const piece = lines[i];

        const upc = allText.match(/\d{12}/g)[i-1];

        const name = piece.split(/\d+\sPK|\d+\sML|\d+\sL/)[0]
            .trim()
            .replace(/\s+/g," ");

        products.push({
            upc,
            name
        });
    }

    document.getElementById("results").innerHTML =
        products.map(p => `<div>${p.upc} - ${p.name}</div>`).join("");

    console.log(products);

};

    reader.readAsArrayBuffer(file);

});