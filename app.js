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
                dataRetirada: '-'
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
        let imovelParaExcluirId = null;
        const excluirModal = new bootstrap.Modal(document.getElementById('excluirModal'));
        const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
        const inputSenhaExclusao = document.getElementById('senha-exclusao');
        const erroSenha = document.getElementById('erro-senha');
        
        const SENHA_ADMIN = "1234"; // Defina sua senha de exclusão aqui

        function carregarImoveis() {
            const imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
            corpoTabela.innerHTML = ''; 

            document.getElementById('btn-todas').innerText = `Todas (${imoveis.length})`;
            document.getElementById('btn-disponiveis').innerText = `Disponíveis (${imoveis.filter(im => im.status === 'Disponível').length})`;
            document.getElementById('btn-emprestadas').innerText = `Emprestadas (${imoveis.filter(im => im.status === 'Emprestada').length})`;

            imoveis.forEach(function(imovel) {
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
                      <button class="btn btn-sm ${botaoClass}" data-bs-toggle="modal" data-bs-target="#retiradaModal">${botaoTexto}</button>
                      <button class="btn btn-sm btn-outline-danger ms-2 btn-excluir" data-id="${imovel.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                      </button>
                    </td>
                `;
                corpoTabela.appendChild(novaLinha);
            });
        }

        function confirmarExclusao() {
            if (inputSenhaExclusao.value === SENHA_ADMIN) {
                let imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
                imoveis = imoveis.filter(imovel => imovel.id !== imovelParaExcluirId);
                localStorage.setItem('imoveis', JSON.stringify(imoveis));
                
                excluirModal.hide(); // Esconde o modal
                inputSenhaExclusao.value = ''; // Limpa o campo de senha
                erroSenha.classList.add('d-none'); // Esconde a mensagem de erro
                
                carregarImoveis(); // Recarrega a tabela
            } else {
                erroSenha.classList.remove('d-none'); // Mostra a mensagem de erro
            }
        }

        corpoTabela.addEventListener('click', function(event) {
            const btnExcluir = event.target.closest('.btn-excluir');
            if (btnExcluir) {
                imovelParaExcluirId = Number(btnExcluir.dataset.id);
                erroSenha.classList.add('d-none'); // Garante que o erro esteja escondido ao abrir
                excluirModal.show(); // Abre o modal de confirmação
            }
        });
        
        btnConfirmarExclusao.addEventListener('click', confirmarExclusao);

        carregarImoveis();
    }
});