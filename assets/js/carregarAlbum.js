// Variável global
window.selectedMusicData = null;

document.addEventListener('DOMContentLoaded', () => {
    const inputMusica = document.getElementById('form-musica');
    const previewContainer = document.getElementById('music-preview');
    
    // VISUAL (O que o usuário vê)
    const imgAlbum = document.getElementById('preview-album-cover');
    const txtTrack = document.getElementById('preview-track-name');
    const txtArtist = document.getElementById('preview-artist-name');

    // EXPORTAÇÃO (Oculto)
    const imgAlbumExport = document.getElementById('export-musica-capa');
    const txtMusicaExport = document.getElementById('export-musica'); 

    let timeoutToken;

    if(inputMusica) {
        inputMusica.addEventListener('input', function() {
            clearTimeout(timeoutToken);
            const termo = this.value.trim();

            if (termo.length < 3) return;

            // Feedback visual
            if(txtTrack) txtTrack.innerText = "Buscando...";
            if(txtArtist) txtArtist.innerText = "";
            previewContainer.style.display = 'flex';
            if(imgAlbum) imgAlbum.style.opacity = "0.5"; 

            timeoutToken = setTimeout(() => {
                buscarMusica(termo);
            }, 800);
        });
    }

    async function buscarMusica(termo) {
        try {
            const termoLimpo = termo.replace(/-/g, ' ').replace(/\s+/g, ' ');
            
            // Adicionado timestamp (&_=${Date.now()}) para evitar cache de erro no iOS
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(termoLimpo)}&entity=song&limit=1&media=music&country=BR&_=${Date.now()}`;
            
            // Fetch explícito como GET e CORS
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) throw new Error(`Erro API: ${response.status}`);
            
            const data = await response.json();

            if (data.results.length > 0) {
                const musica = data.results[0];
                const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

                // ATUALIZAÇÃO VISUAL ---
                if (imgAlbum) {
                    imgAlbum.setAttribute('crossOrigin', 'anonymous');
                    imgAlbum.src = capaAlta;
                    imgAlbum.style.opacity = "1";
                }
                if (txtTrack) txtTrack.innerText = musica.trackName;
                if (txtArtist) txtArtist.innerText = musica.artistName;
                previewContainer.style.display = 'flex';

                // Salva dados globais
                window.selectedMusicData = {
                    track: musica.trackName,
                    artist: musica.artistName,
                    cover: capaAlta
                };

                // Tenta processar a imagem em segundo plano
                atualizarExportacao(musica.trackName, musica.artistName, capaAlta, imgAlbumExport, txtMusicaExport);

            } else {
                mostrarErro("Música não encontrada");
            }
        } catch (error) {
            console.error("Erro na busca:", error);
            // Mensagem amigável
            mostrarErro("Música não localizada");
        }
    }

    function mostrarErro(msg) {
        if(txtTrack) txtTrack.innerText = msg;
        if(txtArtist) txtArtist.innerText = "";
        if(imgAlbum && msg !== "Buscando...") imgAlbum.style.opacity = "0.2";
        window.selectedMusicData = null;
    }

    async function atualizarExportacao(track, artist, urlImagem, imgExport, txtExport) {
        if (txtExport) {
            txtExport.innerHTML = `<strong>${track}</strong><br><span>${artist}</span>`;
        }

        if (imgExport) {
            try {
                const response = await fetch(urlImagem, { cache: 'no-cache' });
                const blob = await response.blob();
                const reader = new FileReader();
                
                reader.onloadend = function() {
                    if(window.selectedMusicData) {
                        window.selectedMusicData.cover = reader.result; // Salva Base64
                    }
                    imgExport.src = reader.result;
                    imgExport.style.display = 'block';
                }
                reader.readAsDataURL(blob);
            } catch (e) {
                console.warn("Falha ao converter imagem para base64 (CORS iOS). Usando URL direta.", e);
                imgExport.src = urlImagem;
                imgExport.style.display = 'block';
            }
        }
    }
});