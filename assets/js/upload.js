let cropper;
let currentTarget; 
let tempFileName = ""; // Variável para armazenar o nome do arquivo temporariamente
window.happyPhotoData = null; 

document.addEventListener('DOMContentLoaded', () => {
    const inputFoto = document.getElementById('inputFoto');
    const dropZone = document.getElementById('dropZone');
    const previewFoto = document.getElementById('previewFoto');
    const placeholder = document.getElementById('uploadPlaceholder');
    const btnHobby = document.querySelector('.upload-input button');

    const inputHobbyFile = document.createElement('input');
    inputHobbyFile.type = 'file';
    inputHobbyFile.accept = 'image/*';

    const iniciarCorte = (arquivo, target) => {
        currentTarget = target;
        tempFileName = arquivo.name; // Guarda o nome do arquivo aqui
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const modal = document.getElementById('modal-cropper');
            const image = document.getElementById('image-to-crop');
            
            image.src = e.target.result;
            modal.style.display = 'flex';

            if (cropper) cropper.destroy();

            cropper = new Cropper(image, {
                aspectRatio: target === 'perfil' ? 1 : 220 / 283,
                viewMode: 1,
                autoCropArea: 1,
            });
        };
        reader.readAsDataURL(arquivo);
    };

    if (dropZone) dropZone.addEventListener('click', () => inputFoto.click());
    if (btnHobby) btnHobby.addEventListener('click', () => inputHobbyFile.click());

    inputFoto.addEventListener('change', function() {
        if (this.files[0]) iniciarCorte(this.files[0], 'perfil');
    });

    inputHobbyFile.addEventListener('change', function() {
        if (this.files[0]) iniciarCorte(this.files[0], 'hobby');
    });

    document.getElementById('btn-confirmar-corte').addEventListener('click', () => {
        const largura = currentTarget === 'perfil' ? 800 : 440; 
        const altura = currentTarget === 'perfil' ? 800 : 566;

        const canvas = cropper.getCroppedCanvas({ width: largura, height: altura });
        const dataURL = canvas.toDataURL('image/png');

        if (currentTarget === 'perfil') {
            previewFoto.src = dataURL;
            previewFoto.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            window.happyPhotoData = dataURL;
            
            // Lógica para exibir o nome do arquivo no botão
            btnHobby.innerText = tempFileName.length > 15 
                ? tempFileName.substring(0, 12) + "..." 
                : tempFileName;
                
            btnHobby.style.backgroundColor = "#2121ff";
            btnHobby.style.color = "#fff";
        }

        document.getElementById('modal-cropper').style.display = 'none';
    });

    document.getElementById('btn-cancelar-corte').addEventListener('click', () => {
        document.getElementById('modal-cropper').style.display = 'none';
        if (cropper) cropper.destroy();
    });
});