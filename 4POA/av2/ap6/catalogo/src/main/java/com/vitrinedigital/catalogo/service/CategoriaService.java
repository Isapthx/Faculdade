package com.vitrinedigital.catalogo.service;

import com.vitrinedigital.catalogo.exception.AccessDeniedException;
import com.vitrinedigital.catalogo.exception.BusinessException;
import com.vitrinedigital.catalogo.model.Categoria;
import com.vitrinedigital.catalogo.model.Empresa;
import com.vitrinedigital.catalogo.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final EmpresaService empresaService;

    public CategoriaService(CategoriaRepository categoriaRepository, EmpresaService empresaService) {
        this.categoriaRepository = categoriaRepository;
        this.empresaService = empresaService;
    }

    // Lista categorias de uma empresa — painel admin (mostra todas)
    @Transactional(readOnly = true)
    public List<Categoria> listarPorEmpresa(Long empresaId) {
        empresaService.buscarPorId(empresaId); // garante que a empresa existe
        return categoriaRepository.findByEmpresaIdOrderByNomeAsc(empresaId);
    }

    // Lista categorias com produtos disponíveis — montagem da vitrine pública
    @Transactional(readOnly = true)
    public List<Categoria> listarComProdutosDisponiveis(Long empresaId) {
        empresaService.buscarPorId(empresaId);
        return categoriaRepository.findByEmpresaIdComProdutos(empresaId, true);
    }

    // Lista categorias com todos os produtos — painel admin
    @Transactional(readOnly = true)
    public List<Categoria> listarComTodosProdutos(Long empresaId) {
        empresaService.buscarPorId(empresaId);
        return categoriaRepository.findByEmpresaIdComProdutos(empresaId, false);
    }

    // Busca categoria garantindo que pertence à empresa — validação de permissão
    @Transactional(readOnly = true)
    public Categoria buscarPorIdEEmpresa(Long id, Long empresaId) {
        return categoriaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new AccessDeniedException(
                        "Categoria não encontrada ou não pertence a esta empresa."
                ));
    }

    // Criação de nova categoria
    public Categoria salvar(Long empresaId, Categoria categoria) {
        Empresa empresa = empresaService.buscarPorId(empresaId);

        validarNomeUnico(categoria.getNome(), empresaId);

        categoria.setEmpresa(empresa);
        return categoriaRepository.save(categoria);
    }

    // Atualização — valida nome apenas se foi alterado
    public Categoria atualizar(Long id, Long empresaId, Categoria dadosNovos) {
        Categoria categoria = buscarPorIdEEmpresa(id, empresaId);

        if (!categoria.getNome().equalsIgnoreCase(dadosNovos.getNome())) {
            validarNomeUnico(dadosNovos.getNome(), empresaId);
        }

        categoria.setNome(dadosNovos.getNome());
        return categoriaRepository.save(categoria);
    }

    public void deletar(Long id, Long empresaId) {
        Categoria categoria = buscarPorIdEEmpresa(id, empresaId);
        // CascadeType.ALL remove os produtos vinculados automaticamente
        categoriaRepository.delete(categoria);
    }

    private void validarNomeUnico(String nome, Long empresaId) {
        if (categoriaRepository.existsByNomeIgnoreCaseAndEmpresaId(nome, empresaId)) {
            throw new BusinessException(
                    "Já existe uma categoria com o nome '" + nome + "' nesta empresa."
            );
        }
    }
}
