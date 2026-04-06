function abrirMatriz(){

fetch("/matriz")
.then(response => response.text())
.then(data => {

document.getElementById("conteudo").innerHTML = data;

})
.catch(error => console.error("Erro:", error));

}

function abrirEmentas(){

fetch("/ementas")
.then(response => response.text())
.then(data => {

document.getElementById("conteudo").innerHTML = data;

})
.catch(error => console.error("Erro:", error));

}

function abrirMatrizDescrita(){

fetch("/matriz-descrita")
.then(response => response.text())
.then(data => {

document.getElementById("conteudo").innerHTML = data;

})
.catch(error => console.error("Erro:", error));

}

function abrirPdf(){

window.open("/pdf", "_blank");

}