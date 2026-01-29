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

            // Feedback visual: Limpa e mostra que está vivo
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
            // Limpeza do termo e foco no BRASIL
            const termoLimpo = termo.replace(/-/g, ' ').replace(/\s+/g, ' ');
            // removemos &lang=pt_br pois as vezes buga o retorno JSON, deixamos só country=BR
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(termoLimpo)}&entity=song&limit=1&media=music&country=BR`;
            
            // Faz a busca simples (sem headers complexos que o iOS odeia)
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Erro de rede Apple");
            
            const data = await response.json();

            if (data.results.length > 0) {
                const musica = data.results[0];
                const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

                // --- FASE 1: ATUALIZAÇÃO VISUAL IMEDIATA ---
                // Não esperamos converter nada. Mostra direto.
                if (imgAlbum) {
                    imgAlbum.src = capaAlta;
                    imgAlbum.style.opacity = "1";
                    // Crossorigin ajuda, mas se falhar, a imagem carrega igual
                    imgAlbum.setAttribute('crossOrigin', 'anonymous');
                }
                if (txtTrack) txtTrack.innerText = musica.trackName;
                if (txtArtist) txtArtist.innerText = musica.artistName;
                previewContainer.style.display = 'flex';

                // Salva dados básicos (URL normal por enquanto)
                window.selectedMusicData = {
                    track: musica.trackName,
                    artist: musica.artistName,
                    cover: capaAlta
                };

                // --- FASE 2: PREPARAÇÃO PARA EXPORTAÇÃO (TRY/CATCH SILENCIOSO) ---
                // Tenta preparar a imagem para o print. Se o iPhone bloquear, o usuário nem percebe.
                try {
                    atualizarExportacao(musica.trackName, musica.artistName, capaAlta, imgAlbumExport, txtMusicaExport);
                } catch (errExport) {
                    console.log("Erro ao preparar exportação (iOS restrito):", errExport);
                    // Mesmo com erro, preenchemos com a URL normal
                    if(imgAlbumExport) imgAlbumExport.src = capaAlta;
                }

            } else {
                mostrarErro("Música não encontrada");
            }
        } catch (error) {
            console.error("Erro fatal na busca:", error);
            // Se o erro for de conexão real, mostramos
            mostrarErro("Erro de conexão/Busca");
        }
    }

    function mostrarErro(msg) {
        if(txtTrack) txtTrack.innerText = msg;
        if(txtArtist) txtArtist.innerText = "";
        if(imgAlbum) imgAlbum.src = "";
        window.selectedMusicData = null;
    }

    // Função separada para lidar com a conversão da imagem
    async function atualizarExportacao(track, artist, urlImagem, imgExport, txtExport) {
        // Atualiza texto oculto
        if (txtExport) {
            txtExport.innerHTML = `<strong>${track}</strong><br><span>${artist}</span>`;
        }

        if (imgExport) {
            // Tenta baixar a imagem como BLOB (Binary Large Object)
            // O iOS as vezes bloqueia isso se não tiver headers certos, mas vale tentar
            try {
                const response = await fetch(urlImagem);
                const blob = await response.blob();
                const reader = new FileReader();
                
                reader.onloadend = function() {
                    const base64data = reader.result;
                    imgExport.src = base64data;
                    imgExport.style.display = 'block';
                    
                    // Atualiza o dado global com a versão Base64 (melhor para exportar)
                    if(window.selectedMusicData) {
                        window.selectedMusicData.cover = base64data;
                    }
                }
                reader.readAsDataURL(blob);
            } catch (e) {
                // Se o fetch da imagem falhar (CORS do iOS), usa a URL normal
                // O html2canvas pode falhar, mas pelo menos a busca funcionou
                imgExport.src = urlImagem;
                imgExport.style.display = 'block';
            }
        }
    }
});