// Variável global
window.selectedMusicData = null;

document.addEventListener('DOMContentLoaded', () => {
    const inputMusica = document.getElementById('form-musica');
    const previewContainer = document.getElementById('music-preview');
    
    // VISUAL (Tela do formulário)
    const imgAlbum = document.getElementById('preview-album-cover');
    const txtTrack = document.getElementById('preview-track-name');
    const txtArtist = document.getElementById('preview-artist-name');

    // EXPORTAÇÃO (Oculto para o Canvas)
    const imgAlbumExport = document.getElementById('export-musica-capa');
    const txtMusicaExport = document.getElementById('export-musica'); 

    let timeoutToken;

    if(inputMusica) {
        inputMusica.addEventListener('input', function() {
            clearTimeout(timeoutToken);
            const termo = this.value.trim();

            // Limpeza Imediata (Reseta tudo ao digitar)
            if(imgAlbum) {
                imgAlbum.src = ""; 
                imgAlbum.style.display = 'none'; // Esconde a imagem quebrada
            }
            if(txtTrack) txtTrack.innerText = "Digitando...";
            if(txtArtist) txtArtist.innerText = "";
            
            // Reseta exportação e dados globais
            window.selectedMusicData = null;
            if(imgAlbumExport) imgAlbumExport.src = "";
            if(txtMusicaExport) txtMusicaExport.innerHTML = "";

            if (termo.length < 3) return;

            if(txtTrack) txtTrack.innerText = "Buscando...";
            previewContainer.style.display = 'flex';

            // Aguarda 800ms antes de buscar
            timeoutToken = setTimeout(() => {
                buscarMusicaProxy(termo);
            }, 800);
        });
    }

    async function buscarMusicaProxy(termo) {
        const termoLimpo = termo.replace(/-/g, ' ').replace(/\s+/g, ' ');
        
        // URL DIRETA
        const urlDireta = `https://itunes.apple.com/search?term=${encodeURIComponent(termoLimpo)}&entity=song&limit=1&media=music&country=BR`;
        
        // URL PROXY 
        // O allorigins.win baixa o JSON da Apple e entrega para o seu site sem bloqueios
        const urlProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlDireta)}`;

        try {
            let response;
            try {
                // Tenta direto primeiro
                response = await fetch(urlDireta);
                if(!response.ok) throw new Error("Bloqueio Apple");
            } catch (e) {
                // Se der erro (CORS), tenta pelo Proxy
                console.warn("API Direta bloqueada, usando Proxy...", e);
                response = await fetch(urlProxy);
            }

            if (!response.ok) throw new Error("Erro na conexão");

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                processarSucesso(data.results[0]);
            } else {
                mostrarErro("Música não encontrada");
            }
        } catch (error) {
            console.error(error);
            mostrarErro("Erro de conexão/Busca");
        }
    }

    function processarSucesso(musica) {
        const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

        // --- ATUALIZAÇÃO DO PREVIEW (VISUAL) ---
        if (imgAlbum) {
            imgAlbum.removeAttribute('crossOrigin'); 
            imgAlbum.src = capaAlta;
            imgAlbum.style.display = 'block'; // Garante que apareça
        }
        
        if (txtTrack) txtTrack.innerText = musica.trackName;
        if (txtArtist) txtArtist.innerText = musica.artistName;

        // Salva dados globais
        window.selectedMusicData = {
            track: musica.trackName,
            artist: musica.artistName,
            cover: capaAlta // Salva a URL por enquanto
        };

        // --- PREPARAÇÃO PARA EXPORTAÇÃO ---
        if (txtMusicaExport) {
            txtMusicaExport.innerHTML = `<strong>${musica.trackName}</strong><br><span>${musica.artistName}</span>`;
        }

        // Converte a imagem para Base64 para o iOS aceitar no print
        converterParaBase64(capaAlta, imgAlbumExport);
    }

    async function converterParaBase64(url, imgDestino) {
        if(!imgDestino) return;

        try {
            const proxyImagem = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            
            const response = await fetch(proxyImagem);
            const blob = await response.blob();
            
            const reader = new FileReader();
            reader.onloadend = function() {
                const base64data = reader.result;
                
                // Atualiza o elemento de exportação
                imgDestino.src = base64data;
                imgDestino.style.display = 'block';

                // Atualiza a variável global com o Base64
                if(window.selectedMusicData) {
                    window.selectedMusicData.cover = base64data;
                }
            }
            reader.readAsDataURL(blob);

        } catch (e) {
            console.warn("Falha na conversão Base64. Usando URL direta (pode falhar no iOS).", e);
            imgDestino.src = url;
            imgDestino.style.display = 'block';
        }
    }

    function mostrarErro(msg) {
        if(txtTrack) txtTrack.innerText = msg;
        if(txtArtist) txtArtist.innerText = "";
        if(imgAlbum) imgAlbum.style.display = 'none';
        window.selectedMusicData = null;
    }
});