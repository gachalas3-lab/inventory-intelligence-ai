const button = document.getElementById("analyzeBtn");

button.addEventListener("click", () => {

    const file = document.getElementById("pdfUpload").files[0];

    if(!file){

        alert("Please choose a PDF first.");

        return;

    }

    document.getElementById("results").innerHTML =
        "PDF Selected:<br><br>" + file.name;

});