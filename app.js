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

            const pageText = textContent.items
                .map(item => item.str)
                .join(" ");

            allText += pageText + "\n\n";
        }

        document.getElementById("results").textContent = allText;

    };

    reader.readAsArrayBuffer(file);

});