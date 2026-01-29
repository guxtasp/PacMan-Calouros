// Variável global para guardar os dados da música
window.selectedMusicData = null;

document.addEventListener('DOMContentLoaded', () => {
    const inputMusica = document.getElementById('form-musica');
    const previewContainer = document.getElementById('music-preview');
    const imgAlbum = document.getElementById('preview-album-cover');
    const txtTrack = document.getElementById('preview-track-name');
    const txtArtist = document.getElementById('preview-artist-name');
    
    let timeoutToken;

    if(inputMusica) {
        inputMusica.addEventListener('input', function() {
            clearTimeout(timeoutToken);
            const termo = this.value.trim();

            if (termo.length < 3) return;

            timeoutToken = setTimeout(() => {
                buscarMusica(termo);
            }, 00);
        });
    }

    async function buscarMusica(termo) {
        try {
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(termo)}&entity=song&limit=1&media=music`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.results.length > 0) {
                const musica = data.results[0];
                const capaAlta = musica.artworkUrl100.replace('100x100bb', '600x600bb');

                // 1. Atualiza o Preview visual
                imgAlbum.src = capaAlta;
                imgAlbum.crossOrigin = "anonymous";
                txtTrack.innerText = musica.trackName;
                txtArtist.innerText = musica.artistName;
                previewContainer.style.display = 'flex';

                // 2. SALVA OS DADOS PARA A EXPORTAÇÃO (IMPORTANTE)
                window.selectedMusicData = {
                    track: musica.trackName,
                    artist: musica.artistName,
                    cover: capaAlta
                };

            } else {
                previewContainer.style.display = 'none';
                window.selectedMusicData = null; // Limpa se não achar
            }
        } catch (error) {
            console.error("Erro na API:", error);
        }
    }
});