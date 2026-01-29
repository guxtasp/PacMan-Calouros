// Variável global
window.selectedMusicData = null;

// --- FUNÇÃO DE CALLBACK (O iTunes "chama" essa função quando termina de carregar) ---
// Ela precisa estar fora do DOMContentLoaded para ser acessível globalmente pelo script do iTunes
window.receberDadosiTunes = function(data) {
    const previewContainer = document.getElementById('music-preview');
    const txtTrack = document.getElementById('preview-track-name');
    const txtArtist = document.getElementById('preview-artist-name');
    const imgAlbum = document.getElementById('preview-album-cover');
    const imgAlbumExport = document.getElementById('export-musica-capa');
    const txtMusicaExport = document.getElementById('export-musica');

    // Remove o script temporário criado para limpar o HTML
    const scriptAntigo = document.getElementById('itunes-script-temp');
    if (scriptAntigo) scriptAntigo.remove();

    if (data.resultCount > 0) {
        const musica = data.results[0];
        const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

        // 1. Atualiza Texto IMEDIATAMENTE (Não espera a imagem)
        if(txtTrack) txtTrack.innerText = musica.trackName;
        if(txtArtist) txtArtist.innerText = musica.artistName;
        if(previewContainer) previewContainer.style.display = 'flex';

        // 2. Prepara Texto Exportação
        if (txtMusicaExport) {
            txtMusicaExport.innerHTML = `<strong>${musica.trackName}</strong><br><span>${musica.artistName}</span>`;
        }

        // 3. Processa a Imagem (Assíncrono para não travar)
        processarImagem(capaAlta, musica.trackName, musica.artistName);

    } else {
        if(txtTrack) txtTrack.innerText = "Não encontrada";
        if(txtArtist) txtArtist.innerText = "";
        if(imgAlbum) imgAlbum.src = "";
        window.selectedMusicData = null;
    }
};

// --- Função separada para lidar com a imagem e o iPhone ---
async function processarImagem(url, trackName, artistName) {
    const imgAlbum = document.getElementById('preview-album-cover');
    const imgAlbumExport = document.getElementById('export-musica-capa');

    // Mostra a versão online primeiro pro usuário não esperar
    if(imgAlbum) {
        imgAlbum.src = url;
        imgAlbum.style.opacity = "0.5"; // Meio transparente enquanto carrega o HD
    }

    try {
        // Tenta converter para Base64 (Necessário para salvar no iPhone)
        const base64 = await converterImagemParaBase64(url);
        
        // Se deu certo, atualiza tudo com a versão "segura"
        if(imgAlbum) {
            imgAlbum.src = base64;
            imgAlbum.style.opacity = "1";
        }
        if(imgAlbumExport) {
            imgAlbumExport.src = base64;
            imgAlbumExport.style.display = 'block';
        }

        window.selectedMusicData = {
            track: trackName,
            artist: artistName,
            cover: base64
        };
    } catch (e) {
        console.log("Erro na conversão de imagem, usando URL direta:", e);
        // Fallback: Se der erro no base64, usa o link normal e torce pra funcionar
        if(imgAlbum) imgAlbum.style.opacity = "1";
        if(imgAlbumExport) {
            imgAlbumExport.src = url;
            imgAlbumExport.style.display = 'block';
        }
        window.selectedMusicData = {
            track: trackName,
            artist: artistName,
            cover: url
        };
    }
}

async function converterImagemParaBase64(url) {
    // Adiciona timestamp para evitar cache teimoso
    const urlNoCache = url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
    const response = await fetch(urlNoCache);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const inputMusica = document.getElementById('form-musica');
    const txtTrack = document.getElementById('preview-track-name');
    let timeoutToken;

    if(inputMusica) {
        inputMusica.addEventListener('input', function() {
            clearTimeout(timeoutToken);
            const termo = this.value.trim();

            if (termo.length < 3) return;

            if(txtTrack) txtTrack.innerText = "Buscando...";

            timeoutToken = setTimeout(() => {
                buscarMusicaJSONP(termo);
            }, 800);
        });
    }

    // --- FUNÇÃO DE BUSCA VIA SCRIPT (JSONP) ---
    // Isso ignora o erro de "Conexão" do fetch tradicional
    function buscarMusicaJSONP(termo) {
        // Limpa termo
        const termoLimpo = termo.replace(/-/g, ' ').replace(/\s+/g, ' ');
        
        // Remove script anterior se existir
        const scriptVelho = document.getElementById('itunes-script-temp');
        if (scriptVelho) scriptVelho.remove();

        // Cria um elemento <script> dinamicamente
        const script = document.createElement('script');
        script.id = 'itunes-script-temp';
        
        // A mágica: callback=receberDadosiTunes
        // O iTunes vai embrulhar os dados dentro dessa função
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(termoLimpo)}&entity=song&limit=1&media=music&country=BR&callback=receberDadosiTunes`;
        
        script.src = url;
        
        // Tratamento de erro do script
        script.onerror = function() {
            if(txtTrack) txtTrack.innerText = "Erro de conexão (Bloqueio)";
        };

        document.body.appendChild(script);
    }
});