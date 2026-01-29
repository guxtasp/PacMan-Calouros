// Variável global para armazenar os dados da música selecionada
window.selectedMusicData = null;

document.addEventListener('DOMContentLoaded', () => {
    const inputMusica = document.getElementById('form-musica');
    const previewContainer = document.getElementById('music-preview');
    
    // Elementos VISUAIS (O que o usuário vê na tela)
    const imgAlbum = document.getElementById('preview-album-cover');
    const txtTrack = document.getElementById('preview-track-name');
    const txtArtist = document.getElementById('preview-artist-name');

    // Elementos de EXPORTAÇÃO (Ocultos, usados para gerar o print)
    const imgAlbumExport = document.getElementById('export-musica-capa');
    const txtMusicaExport = document.getElementById('export-musica'); 

    let timeoutToken;

    if(inputMusica) {
        inputMusica.addEventListener('input', function() {
            clearTimeout(timeoutToken);
            const termo = this.value.trim();

            if (termo.length < 3) return;

            // Feedback visual de que está buscando
            if(txtTrack) txtTrack.innerText = "Buscando...";
            if(txtArtist) txtArtist.innerText = "";
            previewContainer.style.display = 'flex';
            if(imgAlbum) imgAlbum.style.opacity = "0.5"; 

            // Delay para não buscar a cada letra digitada
            timeoutToken = setTimeout(() => {
                buscarMusicaBlindada(termo);
            }, 800);
        });
    }

    // Função Principal de Busca
    async function buscarMusicaBlindada(termo) {
        const termoLimpo = termo.replace(/-/g, ' ').replace(/\s+/g, ' ');
        // Adicionamos timestamp para evitar cache do navegador
        const params = `term=${encodeURIComponent(termoLimpo)}&entity=song&limit=1&media=music&country=BR&_=${Date.now()}`;
        const urlDireta = `https://itunes.apple.com/search?${params}`;

        try {
            // TENTATIVA 1: Direta (Funciona se a Apple estiver de bom humor com CORS)
            await processarBusca(urlDireta);
        } catch (erroDireto) {
            console.warn("Tentativa direta falhou (CORS provável), tentando via Proxy...", erroDireto);
            
            // TENTATIVA 2: Via Proxy (AllOrigins) 
            const urlProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlDireta)}`;
            
            try {
                await processarBusca(urlProxy);
            } catch (erroProxy) {
                console.error("Erro fatal em ambas tentativas:", erroProxy);
                mostrarErro("Música não encontrada");
            }
        }
    }

    // Processa o JSON retornado (seja do Proxy ou Direto)
    async function processarBusca(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro na resposta da API");
        
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const musica = data.results[0];
            // Pega a imagem em alta resolução (600x600)
            const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

            atualizarInterface(musica.trackName, musica.artistName, capaAlta);
        } else {
            throw new Error("Nenhum resultado");
        }
    }

    function atualizarInterface(track, artist, coverUrl) {
        // --- ATUALIZAÇÃO VISUAL ---
        if (imgAlbum) {
            imgAlbum.setAttribute('crossOrigin', 'anonymous');
            imgAlbum.src = coverUrl;
            imgAlbum.style.opacity = "1";
        }
        if (txtTrack) txtTrack.innerText = track;
        if (txtArtist) txtArtist.innerText = artist;
        previewContainer.style.display = 'flex';

        // Salva dados globais para o exportCard.js usar depois
        window.selectedMusicData = {
            track: track,
            artist: artist,
            cover: coverUrl
        };

        // PREPARAÇÃO PARA EXPORTAÇÃO ---
        prepararImagemExportacao(coverUrl, imgAlbumExport);
        
        if (txtMusicaExport) {
            txtMusicaExport.innerHTML = `<strong>${track}</strong><br><span>${artist}</span>`;
        }
    }

    // Tenta converter a imagem para Base64 para facilitar o html2canvas
    async function prepararImagemExportacao(urlImagem, imgElement) {
        if (!imgElement) return;

        try {
            // Tenta baixar a imagem
            const response = await fetch(urlImagem, { cache: 'no-cache' });
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onloadend = function() {
                // Atualiza o dado global com Base64 (mais seguro para exportar)
                if(window.selectedMusicData) {
                    window.selectedMusicData.cover = reader.result;
                }
                imgElement.src = reader.result;
                imgElement.style.display = 'block';
            }
            reader.readAsDataURL(blob);
        } catch (e) {
            console.log("Não foi possível converter para Base64 (ok, usaremos link direto):", e);
            imgElement.src = urlImagem;
            imgElement.style.display = 'block';
        }
    }

    function mostrarErro(msg) {
        if(txtTrack) txtTrack.innerText = msg;
        if(txtArtist) txtArtist.innerText = "";
        if(imgAlbum) imgAlbum.style.opacity = "0.2";
        window.selectedMusicData = null;
    }
});