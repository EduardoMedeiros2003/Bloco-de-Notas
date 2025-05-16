const containerNotas = document.getElementById('container-notas');
        const botaoCriarNota = document.getElementById('criar-nota');
        const cores = ['#F44336', '#4CAF50', '#2196F3', '#FFEB3B', '#9C27B0', '#FF5722', '#E91E63', '#009688', '#FFFFFF'];
        let notas = [];
        let editingNotaId = null;

        // Função para carregar as notas do LocalStorage
        function carregarNotas() {
            const notasSalvas = localStorage.getItem('notas');
            if (notasSalvas) {
                notas = JSON.parse(notasSalvas);
                notas.forEach(notaData => {
                    const novaNota = criarNota(notaData);
                    containerNotas.appendChild(novaNota);
                });
            }
        }

        // Função para salvar as notas no LocalStorage
        function salvarNotas() {
            const notasSalvas = JSON.stringify(notas);
            localStorage.setItem('notas', notasSalvas);
        }

        function criarNota(notaData) {
            const novaNota = document.createElement('div');
            novaNota.className = 'bloco-nota';

            const tituloNota = document.createElement('input');
            tituloNota.type = 'text';
            tituloNota.value = notaData ? notaData.titulo : '';
            tituloNota.placeholder = 'Título da Nota';

            const textoNota = document.createElement('textarea');
            textoNota.placeholder = 'Digite seu texto aqui...';
            textoNota.addEventListener('input', autoResize, false);
            textoNota.value = notaData ? notaData.texto : '';

            const blocoNotaBotoes = document.createElement('div');
            blocoNotaBotoes.className = 'bloco-nota-botoes';

            const botaoSelecionarCor = document.createElement('button');
            botaoSelecionarCor.className = 'botao-cor-selecionar';
            botaoSelecionarCor.addEventListener('click', (event) => {
                const dropdown = event.target.nextElementSibling;
                dropdown.classList.toggle('mostrar');
            });

            const dropdownCores = document.createElement('div');
            dropdownCores.className = 'dropdown-cores';
            cores.forEach(cor => {
                const botaoCor = document.createElement('button');
                botaoCor.className = 'botao-cor';
                botaoCor.style.backgroundColor = cor;
                botaoCor.classList.add(
                    cor === '#F44336' ? 'vermelho' :
                    cor === '#4CAF50' ? 'verde' :
                    cor === '#2196F3' ? 'azul' :
                    cor === '#FFEB3B' ? 'amarelo' :
                    cor === '#9C27B0' ? 'roxo' :
                    cor === '#FF5722' ? 'laranja' :
                    cor === '#E91E63' ? 'rosa' :
                    cor === '#009688' ? 'teal' : 'branco'
                );
                botaoCor.addEventListener('click', (event) => {
                    const corSelecionada = event.target.style.backgroundColor;
                    novaNota.style.backgroundColor = corSelecionada;
                    tituloNota.style.backgroundColor = corSelecionada;
                    textoNota.style.backgroundColor = corSelecionada;
                    botaoSelecionarCor.style.backgroundColor = corSelecionada;
                    botaoSelecionarCor.classList.add('cor-selecionada');
                    dropdownCores.classList.remove('mostrar');
                     // Salva a cor ao mudar
                    const notaId = novaNota.id;
                    const notaIndex = notas.findIndex(n => n.id === notaId);
                    if (notaIndex !== -1) {
                        notas[notaIndex].cor = corSelecionada;
                        salvarNotas();
                    }
                });
                dropdownCores.appendChild(botaoCor);
            });

            const botaoDeletar = document.createElement('button');
            botaoDeletar.className = 'botao-deletar';
            botaoDeletar.addEventListener('click', () => {
                novaNota.remove();
                notas = notas.filter(n => n.id !== novaNota.id);
                salvarNotas(); // Salva ao deletar
                reorganizarNotas();
            });

            blocoNotaBotoes.appendChild(botaoSelecionarCor);
            blocoNotaBotoes.appendChild(dropdownCores);
            blocoNotaBotoes.appendChild(botaoDeletar);

            novaNota.appendChild(tituloNota);
            novaNota.appendChild(textoNota);
            novaNota.appendChild(blocoNotaBotoes);
            containerNotas.appendChild(novaNota);

             if (notaData) {
                novaNota.id = notaData.id;
                novaNota.style.left = `${notaData.x}px`;
                novaNota.style.top = `${notaData.y}px`;
                novaNota.style.backgroundColor = notaData.cor || 'white';
                botaoSelecionarCor.style.backgroundColor = notaData.cor || 'white';
                if(notaData.cor) {
                    botaoSelecionarCor.classList.add('cor-selecionada');
                }
            } else {
                 novaNota.id = `nota-${Date.now()}`;
                  notas.push({
                    id: novaNota.id,
                    x: 0,
                    y: 0,
                    element: novaNota,
                    zIndex: 1,
                    titulo: '',
                    texto: '',
                    cor: 'white', // Cor padrão
                });
            }

            iniciarArrastavel(novaNota);
            return novaNota;
        }

        function iniciarArrastavel(element) {
             interact(element).draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: containerNotas,
                        endOnly: true,
                    }),
                ],
                onstart: (event) => {
                    const target = event.target;
                    target.setAttribute('data-x', target.getAttribute('data-x') || '0');
                    target.setAttribute('data-y', target.getAttribute('data-y') || '0');
                    target.style.zIndex = 1000;
                    notas.forEach(nota => {
                        if (nota.element !== target) {
                            nota.element.style.zIndex = 1;
                        }
                    });
                },
                onmove: (event) => {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                onend: (event) => {
                    const target = event.target;
                    const x = parseFloat(target.getAttribute('data-x')) || 0;
                    const y = parseFloat(target.getAttribute('data-y')) || 0;
                    const id = target.id;

                    const notaIndex = notas.findIndex(n => n.id === id);
                    if (notaIndex !== -1) {
                        notas[notaIndex].x = x;
                        notas[notaIndex].y = y;
                        salvarNotas(); // Salva a posição ao arrastar
                    }
                    reposicionarNotas(target);
                },
            });
        }

        function reposicionarNotas(draggedElement) {
            const draggedRect = draggedElement.getBoundingClientRect();
            let overlap = false;
            let displacedElement = null;

            notas.forEach((nota) => {
                const element = nota.element;
                if (element !== draggedElement) {
                    const rect = element.getBoundingClientRect();
                    if (
                        !(
                            draggedRect.right < rect.left ||
                            draggedRect.left > rect.right ||
                            draggedRect.bottom < rect.top ||
                            draggedRect.top > rect.bottom
                        )
                    ) {
                        overlap = true;
                        displacedElement = element;
                    }
                }
            });

            if (overlap && displacedElement) {
                const displacedNota = notas.find(n => n.element === displacedElement);
                const draggedNota = notas.find(n => n.element === draggedElement);

                // Swap z-indexes
                const tempZIndex = draggedNota.zIndex;
                draggedNota.zIndex = displacedNota.zIndex;
                displacedNota.zIndex = tempZIndex;

                draggedElement.style.zIndex = draggedNota.zIndex;
                displacedElement.style.zIndex = displacedNota.zIndex;

                // Move the displaced element to the dragged element's original position
                const tempX = draggedNota.x;
                const tempY = draggedNota.y;

                draggedNota.x = displacedNota.x;
                draggedNota.y = displacedNota.y;

                draggedElement.style.transform = `translate(${draggedNota.x}px, ${draggedNota.y}px)`;
                displacedElement.style.transform = `translate(${displacedNota.x}px, ${displacedNota.y}px)`;

                draggedElement.setAttribute('data-x', draggedNota.x);
                draggedElement.setAttribute('data-y', draggedNota.y);
                displacedElement.setAttribute('data-x', displacedNota.x);
                displacedElement.setAttribute('data-y', displacedNota.y);
            }
        }

        window.addEventListener('resize', () => {
             notas.forEach(nota => {
                nota.element.style.transform = `translate(${nota.x}px, ${nota.y}px)`;
            });
        });

        botaoCriarNota.addEventListener('click', () => {
            const novaNota = criarNota(null);
            containerNotas.appendChild(novaNota);
            salvarNotas();
        });

        function autoResize(event) {
            const textarea = event.target;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
             // Salva o texto ao digitar
            const notaId = textarea.closest('.bloco-nota').id;
            const notaIndex = notas.findIndex(n => n.id === notaId);
            if (notaIndex !== -1) {
                notas[notaIndex].texto = textarea.value;
                salvarNotas();
            }
        }

        // Carrega as notas ao iniciar a página
        carregarNotas();