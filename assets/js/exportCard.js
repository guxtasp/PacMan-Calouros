
const ajustarFonte = (id, tamanhoOriginal) => {
    const el = document.getElementById(id);
    if (!el) return tamanhoOriginal;
    let tamanho = tamanhoOriginal;
    el.style.fontSize = tamanho + "px";

    while (el.scrollWidth > el.offsetWidth && tamanho > 10) {
        tamanho--;
        el.style.fontSize = tamanho + "px";
    }
    return tamanho;
};

const ajustarFontesEmGrupo = (ids, tamanhoOriginal) => {
    let menorTamanho = tamanhoOriginal;

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let tamanhoLocal = tamanhoOriginal;
            el.style.fontSize = tamanhoLocal + "px";
            while (el.scrollWidth > el.offsetWidth && tamanhoLocal > 10) {
                tamanhoLocal--;
                el.style.fontSize = tamanhoLocal + "px";
            }
            if (tamanhoLocal < menorTamanho) menorTamanho = tamanhoLocal;
        }
    });

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.fontSize = menorTamanho + "px";
    });
};

// Função para garantir o @ no início
const formatarUser = (valor) => {
    const texto = valor.trim();
    if (texto === "") return ""; // Se estiver vazio, não coloca nada
    return texto.startsWith('@') ? texto : `@${texto}`;
};

const exportCard = () => {
    
    const btnFinalizar = document.getElementById('btn-finalizar-card');
    const target = document.getElementById('canvas-target'); 

    


    const inputNome = document.getElementById('form-nome');
    const previewFoto = document.getElementById('previewFoto');
    const exportFoto = document.getElementById('export-foto');
    const exportHobbyFoto = document.getElementById('export-happy');

    if (!target) {
        alert("Erro: Alvo da exportação não encontrado.");
        return;
    }

    // Verifica se o nome está vazio
    if (!inputNome || !inputNome.value.trim()) {
        alert("Ops! Você esqueceu de colocar o seu NOME.");
        if(inputNome) inputNome.focus();
        return;
    }

    // Verifica se a foto de perfil foi carregada
    if (!previewFoto || !previewFoto.src || previewFoto.style.display === 'none' || previewFoto.src === "" || window.getComputedStyle(previewFoto).display === "none") {
        alert("Ei! Você precisa carregar uma FOTO DE PERFIL antes de finalizar.");
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
        return;
    }

    // --- TRATAMENTO DAS IMAGENS NO CARD ---
    // Foto Principal
    exportFoto.src = previewFoto.src;

    // Foto do Hobby
    if (window.happyPhotoData && exportHobbyFoto) {
        exportHobbyFoto.src = window.happyPhotoData;
        exportHobbyFoto.style.display = 'block';
    }

    // --- COLETA DE DADOS ---
    const nome = inputNome.value.trim();
    
    let idadeValor = document.getElementById('form-idade').value.trim();
    if (idadeValor !== "") {
        if (/^\d+$/.test(idadeValor)) {
            idadeValor += " ANOS";
        }
    }

    const insta = formatarUser(document.getElementById('form-instagram').value);
    const twt = formatarUser(document.getElementById('form-twitter').value);

    // Alimenta o template
    document.getElementById('export-nome').innerText = nome;
    document.getElementById('export-idade').innerText = idadeValor;
    document.getElementById('export-sexualidade').innerText = document.getElementById('form-sexualidade').value;
    document.getElementById('export-pronome').innerText = document.getElementById('form-pronome').value;
    document.getElementById('export-cidade').innerText = document.getElementById('form-cidade').value;
    document.getElementById('export-instagram').innerText = insta;
    document.getElementById('export-twitter').innerText = twt;
    document.getElementById('export-hobbies').innerText = document.getElementById('form-hobbie').value;
    document.getElementById('export-rel').innerText = document.querySelector('input[name="rel"]:checked')?.value || "";

    // Alimenta o texto da música
    const musicaTexto = window.selectedMusicData 
        ? `${window.selectedMusicData.track} - ${window.selectedMusicData.artist}`
        : document.getElementById('form-musica').value;

    document.getElementById('export-musica').innerText = musicaTexto;

    // Alimenta a CAPA da música
    const imgExportCapa = document.getElementById('export-musica-capa');
    if (window.selectedMusicData && window.selectedMusicData.cover) {
        imgExportCapa.src = window.selectedMusicData.cover;
        imgExportCapa.style.display = 'block';
    } else {
        imgExportCapa.style.display = 'none';
    }

    // AJUSTES DE FONTE
    ajustarFonte('export-nome', 53);
    ajustarFontesEmGrupo(['export-instagram', 'export-twitter', 'export-sexualidade','export-rel', 'export-musica'], 33);

    // --- PROCESSO DE EXPORTAÇÃO ---
    btnFinalizar.innerText = "PROCESSANDO...";
    btnFinalizar.disabled = true;

    html2canvas(target, {
        scale: 2,
        useCORS: true, 
        allowTaint: false,
        logging: true,
        backgroundColor: "#000000"
    }).then(canvas => {
        try {
            canvas.toBlob((blob) => {
                if (!blob) throw new Error("Falha ao criar Blob.");
                const fileName = `card-${nome.toLowerCase().replace(/\s+/g, '-')}.png`;
                saveAs(blob, fileName);
                btnFinalizar.innerText = "FINALIZAR CARD";
                btnFinalizar.disabled = false;
            }, 'image/png');
        } catch (e) {
            console.error("Erro no Blob:", e);
            btnFinalizar.innerText = "ERRO NO BLOB";
            btnFinalizar.disabled = false;
        }
    }).catch(err => {
        console.error("ERRO DETALHADO:", err);
        alert("Erro técnico: " + err.message);
        btnFinalizar.innerText = "FINALIZAR CARD";
        btnFinalizar.disabled = false;
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-finalizar-card');
    if (btn) btn.addEventListener('click', exportCard);
});