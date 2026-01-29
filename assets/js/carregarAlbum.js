// Variável global
window.selectedMusicData = null;

document.addEventListener('DOMContentLoaded', () => {
    const inputMusica = document.getElementById('form-musica');
    const previewContainer = document.getElementById('music-preview');
    
    // VISUAL
    const imgAlbum = document.getElementById('preview-album-cover');
    const txtTrack = document.getElementById('preview-track-name');
    const txtArtist = document.getElementById('preview-artist-name');

    // EXPORTAÇÃO
    const imgAlbumExport = document.getElementById('export-musica-capa');
    const txtMusicaExport = document.getElementById('export-musica'); 

    let timeoutToken;

    if(inputMusica) {
        inputMusica.addEventListener('input', function() {
            clearTimeout(timeoutToken);
            const termo = this.value.trim();

            // --- LIMPEZA IMEDIATA ---
            // Assim que o usuário digita, limpamos tudo para não sobrar "fantasmas"
            if(imgAlbum) {
                imgAlbum.src = ""; // Remove a URL anterior
                imgAlbum.removeAttribute('src'); // Garante que fique vazio
                imgAlbum.style.opacity = "0"; // Esconde visualmente
            }
            if(txtTrack) txtTrack.innerText = "Digitando...";
            if(txtArtist) txtArtist.innerText = "";
            window.selectedMusicData = null; // Reseta os dados globais
            
            // Limpa também a área de exportação oculta
            if(imgAlbumExport) imgAlbumExport.src = "";
            if(txtMusicaExport) txtMusicaExport.innerHTML = "";

            if (termo.length < 3) return;

            if(txtTrack) txtTrack.innerText = "Buscando...";
            previewContainer.style.display = 'flex';

            timeoutToken = setTimeout(() => {
                buscarMusicaJSONP(termo);
            }, 800);
        });
    }

    // --- TÉCNICA JSONP ---
    function buscarMusicaJSONP(termo) {
        const termoLimpo = termo.replace(/-/g, ' ').replace(/\s+/g, ' ');
        // Cria um nome único para a função de callback
        const callbackName = 'itunes_callback_' + Date.now();
        
        // Define o que acontece quando a Apple responder
        window[callbackName] = function(data) {
            // Limpa o script do DOM
            delete window[callbackName];
            document.body.removeChild(script);

            if (data.results && data.results.length > 0) {
                processarResultado(data.results[0]);
            } else {
                mostrarErro("Música não encontrada");
            }
        };

        // Cria a tag <script> que engana o CORS
        const script = document.createElement('script');
        script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(termoLimpo)}&entity=song&limit=1&media=music&country=BR&callback=${callbackName}`;
        
        // Se der erro de carregamento do script (internet caiu, etc)
        script.onerror = function() {
            mostrarErro("Erro de conexão com iTunes");
            delete window[callbackName];
            document.body.removeChild(script);
        };

        document.body.appendChild(script);
    }

    function processarResultado(musica) {
        // Pega imagem em alta qualidade
        const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

        // Atualiza Interface Visual
        if (imgAlbum) {
            // Importante para o html2canvas não bloquear depois
            imgAlbum.setAttribute('crossOrigin', 'anonymous');
            imgAlbum.src = capaAlta;
            
            // Só mostra quando carregar de fato
            imgAlbum.onload = () => { imgAlbum.style.opacity = "1"; };
        }
        
        if (txtTrack) txtTrack.innerText = musica.trackName;
        if (txtArtist) txtArtist.innerText = musica.artistName;

        // Salva dados globais
        window.selectedMusicData = {
            track: musica.trackName,
            artist: musica.artistName,
            cover: capaAlta
        };

        // Prepara exportação (Texto e Imagem)
        if (txtMusicaExport) {
            txtMusicaExport.innerHTML = `<strong>${musica.trackName}</strong><br><span>${musica.artistName}</span>`;
        }

        // Tenta converter a imagem para Base64 (para o export funcionar no iPhone)
        converterImagemParaExportacao(capaAlta, imgAlbumExport);
    }

    async function converterImagemParaExportacao(url, imgExport) {
        if(!imgExport) return;

        try {
            // Tenta baixar a imagem. Se falhar CORS, cai no catch.
            const response = await fetch(url, { cache: 'no-cache', mode: 'cors' });
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onloadend = function() {
                if(window.selectedMusicData) window.selectedMusicData.cover = reader.result;
                imgExport.src = reader.result;
                imgExport.style.display = 'block';
            }
            reader.readAsDataURL(blob);
        } catch (e) {
            console.warn("Fetch direto falhou, usando URL direta (pode falhar no print)", e);
            // Fallback: usa a URL normal. 
            imgExport.setAttribute('crossOrigin', 'anonymous');
            imgExport.src = url;
            imgExport.style.display = 'block';
        }
    }

    function mostrarErro(msg) {
        if(txtTrack) txtTrack.innerText = msg;
        if(txtArtist) txtArtist.innerText = "";
        // Garante que a imagem continue oculta em caso de erro
        if(imgAlbum) {
            imgAlbum.src = "";
            imgAlbum.style.opacity = "0";
        }
        window.selectedMusicData = null;
    }
});