// Variável global
window.selectedMusicData = null;

document.addEventListener('DOMContentLoaded', () => {
    const inputMusica = document.getElementById('form-musica');
    const previewContainer = document.getElementById('music-preview');
    
    // Elementos Visuais
    const imgAlbum = document.getElementById('preview-album-cover');
    const txtTrack = document.getElementById('preview-track-name');
    const txtArtist = document.getElementById('preview-artist-name');

    // Elementos de Exportação
    const imgAlbumExport = document.getElementById('export-musica-capa');
    const txtMusicaExport = document.getElementById('export-musica'); 

    let timeoutToken;

    if(inputMusica) {
        inputMusica.addEventListener('input', function() {
            clearTimeout(timeoutToken);
            const termo = this.value.trim();

            if (termo.length < 3) return;

            // Feedback visual imediato
            previewContainer.style.display = 'flex';
            if(txtTrack) txtTrack.innerText = "Buscando...";
            if(txtArtist) txtArtist.innerText = "";
            if(imgAlbum) imgAlbum.style.opacity = "0.5";

            timeoutToken = setTimeout(() => {
                buscarMusica(termo);
            }, 800);
        });
    }

    async function buscarMusica(termo) {
        try {
            // Limpa o termo para ajudar na busca (tira traços)
            const termoLimpo = termo.replace(/-/g, ' ');
            // Adiciona country=BR para achar músicas brasileiras
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(termoLimpo)}&entity=song&limit=1&media=music&country=BR`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.results.length > 0) {
                const musica = data.results[0];
                const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

                // --- PASSO 1: ATUALIZA A TELA IMEDIATAMENTE (PRIORIDADE) ---
                // Usamos a URL direta primeiro. Isso garante que o usuário VEJA o resultado,
                // mesmo que a conversão para exportação falhe depois.
                if (imgAlbum) {
                    imgAlbum.src = capaAlta; 
                    imgAlbum.style.opacity = "1";
                    // Tenta evitar erro de CORS visual
                    imgAlbum.crossOrigin = "anonymous"; 
                }
                if (txtTrack) txtTrack.innerText = musica.trackName;
                if (txtArtist) txtArtist.innerText = musica.artistName;
                
                // Mostra o container
                previewContainer.style.display = 'flex';

                // --- PASSO 2: PREPARA PARA EXPORTAÇÃO (SEGUNDO PLANO) ---
                // Agora tentamos converter para Base64 para o iPhone aceitar o download depois.
                // Se falhar, usamos a URL normal e torcemos para funcionar.
                let imagemParaSalvar = capaAlta;
                try {
                    imagemParaSalvar = await converterImagemParaBase64(capaAlta);
                } catch (e) {
                    console.log("Aviso: Falha na conversão Base64, usando URL original.");
                }

                // Atualiza a área de exportação oculta
                if (imgAlbumExport) {
                    imgAlbumExport.src = imagemParaSalvar;
                    imgAlbumExport.style.display = 'block';
                }
                if (txtMusicaExport) {
                    txtMusicaExport.innerHTML = `<strong>${musica.trackName}</strong><br><span>${musica.artistName}</span>`;
                }

                // Salva dados globais
                window.selectedMusicData = {
                    track: musica.trackName,
                    artist: musica.artistName,
                    cover: imagemParaSalvar
                };

            } else {
                if (txtTrack) txtTrack.innerText = "Música não encontrada";
                if (txtArtist) txtArtist.innerText = "";
                if (imgAlbum) imgAlbum.src = ""; 
                window.selectedMusicData = null;
            }
        } catch (error) {
            console.error("Erro busca:", error);
            if (txtTrack) txtTrack.innerText = "Erro de conexão";
        }
    }

    async function converterImagemParaBase64(url) {
        try {
            // Adiciona timestamp para enganar cache
            const response = await fetch(url + '?t=' + new Date().getTime());
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            throw e;
        }
    }
});