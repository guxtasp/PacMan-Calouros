document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Pegar o parâmetro "tipo" da URL (ex: ?tipo=dinossauros)
    const params = new URLSearchParams(window.location.search);
    const tipoAtual = params.get('tipo');

    // 2. Mapa: Qual "tipo da URL" vira qual "classe CSS"
    // Note que veteranos de anos diferentes usam o mesmo fundo
    const temas = {
        'calouros':      'bg-calouros',
        'veteranos2025': 'bg-veteranos2025',
        'veteranos2024': 'bg-veteranos2024',
        'veteranos2023': 'bg-veteranos2023',
        'formandos':     'bg-formandos',
        'dinossauros':   'bg-dinossauros'
    };

    // 3. Define a classe (Se não achar ou for nulo, usa 'bg-calouros' como padrão)
    const classeParaAplicar = temas[tipoAtual] || 'bg-calouros';

    // 4. Aplica no elemento HTML
    const cardAlvo = document.getElementById('canvas-target');

    if (cardAlvo) {
        // Adiciona a classe que tem a imagem de fundo correta
        cardAlvo.classList.add(classeParaAplicar);
        console.log(`Tema carregado: ${classeParaAplicar} (para o tipo: ${tipoAtual})`);
    } else {
        console.error("Erro: Div #canvas-target não encontrada.");
    }
});