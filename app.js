document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA PARA A PÁGINA DE CADASTRO DE IMÓVEL ---
    const formCadastroImovel = document.getElementById('form-cadastro-imovel');
    if (formCadastroImovel) {
        formCadastroImovel.addEventListener('submit', function(event) {
            event.preventDefault();
            const codigo = document.getElementById('input-codigo').value.trim();
            const endereco = document.getElementById('input-endereco').value.trim();
            
            if (!endereco || !codigo) {
                alert('Por favor, preencha pelo menos o endereço e o código do imóvel.');
                return;
            }

            const imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
            if (imoveis.some(imovel => imovel.codigo === codigo)) {
                alert('Erro: Já existe um imóvel cadastrado com este código.');
                return;
            }

            const novoImovel = {
                id: Date.now(),
                endereco: endereco,
                bairro: document.getElementById('input-bairro').value,
                codigo: codigo,
                tipo: document.getElementById('input-tipo').value,
                numChaves: document.getElementById('input-chaves').value,
                observacoes: document.getElementById('input-observacoes').value,
                status: 'Disponível',
                emPosseDe: '-',
                dataRetirada: '-',
                retiradoPor: {} // Objeto para guardar os dados da pessoa
            };

            imoveis.push(novoImovel);
            localStorage.setItem('imoveis', JSON.stringify(imoveis));
            alert('Imóvel cadastrado com sucesso!');
            window.location.href = 'dashboard.html';
        });
    }

    // --- LÓGICA PARA A PÁGINA DO DASHBOARD ---
    const corpoTabela = document.getElementById('tabela-chaves-corpo');
    if (corpoTabela) {
        let idImovelSelecionado = null;
        
        const retiradaModalEl = document.getElementById('retiradaModal');
        const retiradaModal = retiradaModalEl ? new bootstrap.Modal(retiradaModalEl) : null;
        const excluirModalEl = document.getElementById('excluirModal');
        const excluirModal = excluirModalEl ? new bootstrap.Modal(excluirModalEl) : null;

        const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
        const inputUsuarioExclusao = document.getElementById('usuario-exclusao');
        const inputSenhaExclusao = document.getElementById('senha-exclusao');
        const erroLogin = document.getElementById('erro-login');
        const btnConfirmarRetirada = document.getElementById('btn-confirmar-retirada');
        const inputBusca = document.getElementById('input-busca');
        
        const usuariosAutorizados = [
            { usuario: 'gilberto', senha: '24000566' },
            { usuario: 'ana', senha: '24000520' },
            { usuario: 'leonardo', senha: '24000528' }
        ];

        function carregarImoveis(filtroStatus = 'Todas', termoBusca = '') {
            const imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
            corpoTabela.innerHTML = ''; 

            document.getElementById('btn-todas').innerText = `Todas (${imoveis.length})`;
            document.getElementById('btn-disponiveis').innerText = `Disponíveis (${imoveis.filter(im => im.status === 'Disponível').length})`;
            document.getElementById('btn-emprestadas').innerText = `Emprestadas (${imoveis.filter(im => im.status === 'Emprestada').length})`;

            let imoveisFiltrados = imoveis;
            if (filtroStatus === 'Disponível') {
                imoveisFiltrados = imoveis.filter(imovel => imovel.status === 'Disponível');
            } else if (filtroStatus === 'Emprestada') {
                imoveisFiltrados = imoveis.filter(imovel => imovel.status === 'Emprestada');
            }

            const termo = termoBusca.toLowerCase().trim();
            if (termo) {
                imoveisFiltrados = imoveisFiltrados.filter(imovel => 
                    imovel.endereco.toLowerCase().includes(termo) ||
                    imovel.codigo.toLowerCase().includes(termo) ||
                    imovel.emPosseDe.toLowerCase().includes(termo)
                );
            }

            imoveisFiltrados.forEach(function(imovel) {
                const novaLinha = document.createElement('tr');
                const statusClass = imovel.status === 'Disponível' ? 'status-disponivel' : 'status-emprestada';
                const botaoTexto = imovel.status === 'Disponível' ? 'Registrar Retirada' : 'Registrar Devolução';
                const botaoClass = imovel.status === 'Disponível' ? 'btn-outline-primary' : 'btn-success';

                novaLinha.innerHTML = `
                    <td><span class="status ${statusClass}"></span>${imovel.status}</td>
                    <td>
                      <div class="fw-bold">${imovel.endereco}</div>
                      <div class="text-muted small">Cód: ${imovel.codigo} | ${imovel.tipo}</div>
                    </td>
                    <td>${imovel.emPosseDe}</td>
                    <td>${imovel.dataRetirada}</td>
                    <td class="text-end">
                      <button class="btn btn-sm ${botaoClass} btn-acao" data-id="${imovel.id}">${botaoTexto}</button>
                      <button class="btn btn-sm btn-outline-danger ms-2 btn-excluir" data-id="${imovel.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                      </button>
                    </td>
                `;
                corpoTabela.appendChild(novaLinha);
            });
        }

        function confirmarExclusao() {
            const usuarioDigitado = inputUsuarioExclusao.value.trim().toLowerCase();
            const senhaDigitada = inputSenhaExclusao.value.trim();
            const usuarioValido = usuariosAutorizados.find(user => user.usuario === usuarioDigitado);

            if (usuarioValido && usuarioValido.senha === senhaDigitada) {
                let imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
                imoveis = imoveis.filter(imovel => imovel.id !== idImovelSelecionado);
                localStorage.setItem('imoveis', JSON.stringify(imoveis));
                
                excluirModal.hide();
                carregarImoveis(document.querySelector('.filters .active').dataset.filter, inputBusca.value);
            } else {
                erroLogin.classList.remove('d-none');
            }
        }

        // FUNÇÃO ATUALIZADA
        function confirmarRetirada() {
            const nome = document.getElementById('retirada-nome').value.trim();
            if (!nome) {
                alert('O nome da pessoa que está retirando é obrigatório.');
                return;
            }

            let imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
            const imovel = imoveis.find(im => im.id === idImovelSelecionado);

            if (imovel) {
                imovel.status = 'Emprestada';
                imovel.emPosseDe = nome;
                imovel.dataRetirada = new Date().toLocaleString('pt-BR');
                
                // Salva todos os dados da pessoa em um objeto separado
                imovel.retiradoPor = {
                    nome: nome,
                    cpf: document.getElementById('retirada-cpf').value.trim(),
                    telefone: document.getElementById('retirada-telefone').value.trim(),
                    endereco: document.getElementById('retirada-endereco').value.trim()
                };
                
                localStorage.setItem('imoveis', JSON.stringify(imoveis));
                retiradaModal.hide();
                document.getElementById('form-retirada').reset();
                carregarImoveis(document.querySelector('.filters .active').dataset.filter, inputBusca.value);
            }
        }

        corpoTabela.addEventListener('click', function(event) {
            let imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
            
            const btnExcluir = event.target.closest('.btn-excluir');
            if (btnExcluir) {
                idImovelSelecionado = Number(btnExcluir.dataset.id);
                inputUsuarioExclusao.value = '';
                inputSenhaExclusao.value = '';
                erroLogin.classList.add('d-none');
                excluirModal.show();
                return;
            }
            
            const btnAcao = event.target.closest('.btn-acao');
            if (btnAcao) {
                idImovelSelecionado = Number(btnAcao.dataset.id);
                const imovel = imoveis.find(im => im.id === idImovelSelecionado);

                if (imovel && imovel.status === 'Disponível') {
                    document.getElementById('imovel-info-retirada').value = `${imovel.endereco} - Cód: ${imovel.codigo}`;
                    retiradaModal.show();
                } else if (imovel) {
                    if (confirm(`Confirmar a devolução da chave do imóvel: ${imovel.endereco}?`)) {
                        imovel.status = 'Disponível';
                        imovel.emPosseDe = '-';
                        imovel.dataRetirada = '-';
                        imovel.retiradoPor = {}; // Limpa os dados da pessoa na devolução
                        localStorage.setItem('imoveis', JSON.stringify(imoveis));
                        carregarImoveis(document.querySelector('.filters .active').dataset.filter, inputBusca.value);
                    }
                }
            }
        });
        
        const containerFiltros = document.querySelector('.filters');
        if (containerFiltros) {
            containerFiltros.addEventListener('click', function(event) {
                const botaoClicado = event.target.closest('.btn-filter');
                if (botaoClicado) {
                    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
                    botaoClicado.classList.add('active');
                    carregarImoveis(botaoClicado.dataset.filter, inputBusca.value);
                }
            });
        }
        
        if (inputBusca) {
            inputBusca.addEventListener('input', function() {
                const filtroAtivo = document.querySelector('.filters .btn-filter.active').dataset.filter;
                carregarImoveis(filtroAtivo, this.value);
            });
        }
        
        if(btnConfirmarExclusao) btnConfirmarExclusao.addEventListener('click', confirmarExclusao);
        if(btnConfirmarRetirada) btnConfirmarRetirada.addEventListener('click', confirmarRetirada);

        carregarImoveis();
    }
});

