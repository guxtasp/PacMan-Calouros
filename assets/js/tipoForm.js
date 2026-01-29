document.addEventListener('DOMContentLoaded', () => {
    
    // Configurações
    const TOTAL_PELLETS = 15; // Número de pedrinhas
    const ANIMATION_DURATION = 2000; // Tempo total da travessia em milissegundos (deve bater com o CSS)
    
    // Elementos DOM
    const items = document.querySelectorAll('.itemTurmas');
    const overlay = document.getElementById('transitionOverlay');
    const pelletsContainer = document.getElementById('pellets');
    const pacman = document.getElementById('pacmanTransition');

    // 1. Função para criar as pedrinhas no HTML
    function createPellets() {
        pelletsContainer.innerHTML = ''; // Limpa anteriores
        for (let i = 0; i < TOTAL_PELLETS; i++) {
            const dot = document.createElement('div');
            dot.classList.add('pellet');
            pelletsContainer.appendChild(dot);
        }
    }

    // Inicializa as pedrinhas ao carregar
    createPellets();

    // 2. Adiciona o evento de clique em cada turma
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            // Pega o destino (ex: 'calouros', 'veteranos') do atributo data-form
            // Nota: certifique-se que no HTML você tem <div ... data-form="calouros">
            // Usa .closest() para garantir que pega o div pai mesmo clicando no filho (h2/img)
            const target = e.target.closest('.itemTurmas');
            const destino = target ? target.getAttribute('data-form') : null;
            
            if (destino) {
                startAnimation(destino);
            }
        });
    });

    // 3. Função que executa a animação e redireciona
    function startAnimation(destino) {
        // Mostra o overlay preto
        overlay.classList.add('active');

        // Reinicia as pedrinhas (remove a classe 'eaten' se houver de animação anterior)
        const allPellets = document.querySelectorAll('.pellet');
        allPellets.forEach(p => {
            p.classList.remove('eaten');
            p.style.animationDelay = '0s';
            p.style.animationDuration = '0s';
            p.style.opacity = '1';
        });

        // Reinicia o Pacman (truque do void offsetWidth para resetar animação CSS)
        pacman.classList.remove('pacman-running');
        void pacman.offsetWidth; 
        pacman.classList.add('pacman-running');

        // CALCULA O TEMPO DE COMER CADA PEDRINHA
        // Ajuste fino: O pacman começa fora (-150px), leva uns 300ms para entrar na tela
        const startOffset = 300; 

        allPellets.forEach((pellet, index) => {
            // Regra de três: Se temos 15 pedras e 2000ms, em que momento o pacman passa pela pedra X?
            const timeToReach = startOffset + ((ANIMATION_DURATION - startOffset) * (index / TOTAL_PELLETS));
            
            // Aplica o delay calculado
            pellet.style.animationDelay = `${timeToReach}ms`;
            // A pedra some muito rápido (10ms) após o delay
            pellet.style.animationDuration = '10ms'; 
            pellet.classList.add('eaten');
        });

        // 4. Redirecionamento após o fim da animação
        setTimeout(() => {
            // Redireciona para o arquivo HTML correspondente
            // Envia para o formulário único carregando o "tipo" na URL
        window.location.href = `forms_page.html?tipo=${destino}`;

        }, ANIMATION_DURATION + 200); // Espera a animação terminar
    }
});