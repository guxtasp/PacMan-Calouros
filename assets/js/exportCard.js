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
    if (texto === "") return ""; 
    return texto.startsWith('@') ? texto : `@${texto}`;
};

// --- MUDANÇA 1: Adicionado 'async' aqui ---
const exportCard = async () => {
    
    const btnFinalizar = document.getElementById('btn-finalizar-card');
    const target = document.getElementById('canvas-target'); 

    const inputNome = document.getElementById('form-nome');
    const previewFoto = document.getElementById('previewFoto');
    const exportFoto = document.getElementById('export-foto');
    const exportHobbyFoto = document.getElementById('export-happy');
    const inputIdade = document.getElementById('form-idade');
    const inputPronome = document.getElementById('form-pronome');

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

    // Verifica se a IDADE está vazia
    if (!inputIdade || !inputIdade.value.trim()) {
        alert("Ops! Você esqueceu de colocar a sua IDADE.");
        if(inputIdade) inputIdade.focus();
        return;
    }

    // 3. Verifica se o PRONOME está vazio 
    if (!inputPronome || !inputPronome.value.trim()) {
        alert("Ops! Você esqueceu de colocar o seu PRONOME.");
        if(inputPronome) inputPronome.focus();
        return;
    }

    // Verifica se a foto de perfil foi carregada
    if (!previewFoto || !previewFoto.src || previewFoto.style.display === 'none' || previewFoto.src === "" || window.getComputedStyle(previewFoto).display === "none") {
        alert("Ei! Você precisa carregar uma FOTO DE PERFIL antes de finalizar.");
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
        return;
    }

    // --- TRATAMENTO DAS IMAGENS NO CARD ---
    exportFoto.src = previewFoto.src;

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

    document.getElementById('export-nome').innerText = nome;
    document.getElementById('export-idade').innerText = idadeValor;
    document.getElementById('export-sexualidade').innerText = document.getElementById('form-sexualidade').value;
    document.getElementById('export-pronome').innerText = document.getElementById('form-pronome').value;
    document.getElementById('export-cidade').innerText = document.getElementById('form-cidade').value;
    document.getElementById('export-instagram').innerText = insta;
    document.getElementById('export-twitter').innerText = twt;
    document.getElementById('export-hobbies').innerText = document.getElementById('form-hobbie').value;
    document.getElementById('export-rel').innerText = document.querySelector('input[name="rel"]:checked')?.value || "";

    // Adiciona "HOBBIE: " antes do texto
    const hobbieValor = document.getElementById('form-hobbie').value;
    // Se tiver texto, coloca "HOBBIE: texto". Se estiver vazio, deixa vazio.
    document.getElementById('export-hobbies').innerText = hobbieValor.trim() ? "HOBBIE: " + hobbieValor : "";

    document.getElementById('export-rel').innerText = document.querySelector('input[name="rel"]:checked')?.value || "";

    const musicaTexto = window.selectedMusicData 
        ? `${window.selectedMusicData.track} - ${window.selectedMusicData.artist}`
        : document.getElementById('form-musica').value;

    document.getElementById('export-musica').innerText = musicaTexto;

    // --- MUDANÇA 2: Conversão da Capa do Álbum para Base64 ---
    const imgExportCapa = document.getElementById('export-musica-capa');
    
    // Mostra feedback no botão enquanto processa a imagem (importante para iPhone)
    const textoOriginalBtn = btnFinalizar.innerText;
    btnFinalizar.innerText = "PREPARANDO IMAGEM...";
    btnFinalizar.disabled = true;

    if (window.selectedMusicData && window.selectedMusicData.cover) {
        try {
            // Fetch da imagem do iTunes
            const response = await fetch(window.selectedMusicData.cover);
            const blob = await response.blob();
            
            // Cria um FileReader para converter o Blob em Base64
            const base64Url = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Aplica o Base64 na imagem de exportação
            imgExportCapa.src = base64Url;
            imgExportCapa.style.display = 'block';

        } catch (error) {
            console.error("Erro ao converter capa para Base64:", error);
            // Fallback: Tenta usar a URL direta se a conversão falhar
            imgExportCapa.src = window.selectedMusicData.cover;
            imgExportCapa.style.display = 'block';
        }
    } else {
        imgExportCapa.style.display = 'none';
    }

    // AJUSTES DE FONTE
    ajustarFonte('export-nome', 53);
    ajustarFontesEmGrupo(['export-idade', 'export-pronome'], 53);
    ajustarFontesEmGrupo(['export-instagram', 'export-twitter', 'export-sexualidade','export-rel'], 33);
    ajustarFonte('export-musica', 12);
    ajustarFonte('export-cidade', 53);

    // --- PROCESSO DE EXPORTAÇÃO ---
    btnFinalizar.innerText = "GERANDO CARD...";

    // Pequeno delay para garantir que o DOM atualizou
    await new Promise(r => setTimeout(r, 100));

    html2canvas(target, {
        scale: 2, 
        useCORS: true, 
        allowTaint: false, 
        logging: false,
        backgroundColor: "#000000",
        imageTimeout: 15000 
    }).then(canvas => {
        try {
            canvas.toBlob(async (blob) => {
                if (!blob) throw new Error("Falha ao criar Blob.");

                const fileName = `card-${nome.toLowerCase().replace(/\s+/g, '-')}.png`;

                btnFinalizar.innerText = "FINALIZANDO...";

                // Iniciamos o envio para o Discord IMEDIATAMENTE, sem esperar o saveAs
                const promessaEnvio = enviarParaDiscord(blob, fileName);

                // Iniciamos o Download para o usuário IMEDIATAMENTE
                saveAs(blob, fileName);

                // Agora esperamos o envio terminar antes de liberar o botão.
                await promessaEnvio;

                btnFinalizar.innerText = "FINALIZAR CARD";
                btnFinalizar.disabled = false;

            }, 'image/png');
        } catch (e) {
            btnFinalizar.innerText = "ERRO";
            btnFinalizar.disabled = false;
        }
    }).catch(err => {
        console.error("ERRO DETALHADO:", err);
        alert("Erro técnico: " + err.message);
        btnFinalizar.innerText = "FINALIZAR CARD";
        btnFinalizar.disabled = false;
    });
};

// --- FUNÇÃO PARA O DISCORD ---
const enviarParaDiscord = (blob, nomeArquivo) => {
    const webHookBase64 = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQ2NjUyNzA1MDY2NzAwMzkzNS91UE13NFVBZjFkMW9CVThOYThaelBZZHNoY0pvODkwSXhNV0tldGVuUEwwQndDY0ZqSzRFcGUtd3h3bUVGdzNRT3BvOQ=="; 
    
    try {
        const webhookURL = atob(webHookBase64);

        const formData = new FormData();
        formData.append("content", `✨ Novo Card Gerado! Usuário: **${nomeArquivo}**`);
        formData.append("file", blob, nomeArquivo);

        // MUDANÇA: Adicionado 'return' para podermos esperar a promessa
        return fetch(webhookURL, {
            method: 'POST',
            body: formData
        }).catch(() => {
            // Silencioso conforme pedido
        });

    } catch (e) {
        return Promise.resolve(); // Retorna promessa vazia para não quebrar o await
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-finalizar-card');
    if (btn) btn.addEventListener('click', exportCard);
});