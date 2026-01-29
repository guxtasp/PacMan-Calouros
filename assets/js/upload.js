document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA PARA FOTO DE PERFIL ---
    const inputFoto = document.getElementById('inputFoto');
    const dropZone = document.getElementById('dropZone');
    const previewFoto = document.getElementById('previewFoto');
    const placeholder = document.getElementById('uploadPlaceholder');

    if (dropZone && inputFoto) {
        dropZone.addEventListener('click', () => inputFoto.click());

        inputFoto.addEventListener('change', function() {
            const arquivo = this.files[0];
            if (arquivo) {
                const leitor = new FileReader();
                leitor.onload = (e) => {
                    previewFoto.src = e.target.result;
                    previewFoto.style.display = 'block';
                    placeholder.style.display = 'none';
                };
                leitor.readAsDataURL(arquivo);
            }
        });
    }

    // --- LÓGICA PARA UPLOAD DE HOBBY---
    const btnHobby = document.querySelector('.upload-input button');
const inputHobbyFile = document.createElement('input'); 
inputHobbyFile.type = 'file';
inputHobbyFile.accept = 'image/*';

if (btnHobby) {
    btnHobby.addEventListener('click', () => inputHobbyFile.click());

    inputHobbyFile.addEventListener('change', function() {
        if (this.files[0]) {
            // Obtém o nome do arquivo selecionado
            const nomeArquivo = this.files[0].name;
            
            // Exibe o nome (com um limite de caracteres para não quebrar o layout)
            btnHobby.innerText = nomeArquivo.length > 15 
                ? nomeArquivo.substring(0, 12) + "..." 
                : nomeArquivo;

            // Estilização de feedback
            btnHobby.style.backgroundColor = "#2121ff";
            btnHobby.style.color = "#fff";
            btnHobby.style.border = "1px solid #fff";
        }
    });
}
});