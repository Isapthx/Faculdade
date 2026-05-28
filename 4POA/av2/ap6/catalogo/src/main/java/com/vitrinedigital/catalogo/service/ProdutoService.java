package com.vitrinedigital.catalogo.service;

import com.vitrinedigital.catalogo.exception.ResourceNotFoundException;
import com.vitrinedigital.catalogo.model.Categoria;
import com.vitrinedigital.catalogo.model.Produto;
import com.vitrinedigital.catalogo.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaService categoriaService;

    public ProdutoService(ProdutoRepository produtoRepository, CategoriaService categoriaService) {
        this.produtoRepository = produtoRepository;
        this.categoriaService = categoriaService;
    }

    @Transactional(readOnly = true)
    public List<Produto> listarPorEmpresa(Long empresaId) {
        return produtoRepository.findAllByEmpresaId(empresaId);
    }

    @Transactional(readOnly = true)
    public List<Produto> listarDisponiveisPorEmpresa(Long empresaId) {
        return produtoRepository.findDisponivelByEmpresaId(empresaId);
    }

    @Transactional(readOnly = true)
    public List<Produto> listarPorCategoria(Long categoriaId) {
        return produtoRepository.findByCategoriaId(categoriaId);
    }

    @Transactional(readOnly = true)
    public List<Produto> listarDisponiveisPorCategoria(Long categoriaId) {
        return produtoRepository.findByCategoriaIdAndDisponivelTrue(categoriaId);
    }

    @Transactional(readOnly = true)
    public List<Produto> buscar(Long empresaId, String termo) {
        return produtoRepository.searchByEmpresaIdAndTermo(empresaId, termo);
    }

    @Transactional(readOnly = true)
    public Produto buscarPorIdEEmpresa(Long id, Long empresaId) {
        return produtoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Produto não encontrado ou não pertence a esta empresa."
                ));
    }

    public Produto salvar(Long empresaId, Long categoriaId, Produto produto) {
        Categoria categoria = categoriaService.buscarPorIdEEmpresa(categoriaId, empresaId);
        produto.setCategoria(categoria);
        return produtoRepository.save(produto);
    }

    public Produto atualizar(Long id, Long empresaId, Long categoriaId, Produto dadosNovos) {
        Produto produto = buscarPorIdEEmpresa(id, empresaId);
        Categoria categoria = categoriaService.buscarPorIdEEmpresa(categoriaId, empresaId);

        produto.setNome(dadosNovos.getNome());
        produto.setDescricao(dadosNovos.getDescricao());
        produto.setPreco(dadosNovos.getPreco());
        produto.setUrlImagem(dadosNovos.getUrlImagem());
        produto.setDisponivel(dadosNovos.getDisponivel());
        produto.setCategoria(categoria);

        return produtoRepository.save(produto);
    }

    public Produto alterarDisponibilidade(Long id, Long empresaId, boolean disponivel) {
        Produto produto = buscarPorIdEEmpresa(id, empresaId);
        produto.setDisponivel(disponivel);
        return produtoRepository.save(produto);
    }

    public void alterarDisponibilidadePorCategoria(Long categoriaId, Long empresaId, boolean disponivel) {
        categoriaService.buscarPorIdEEmpresa(categoriaId, empresaId); // valida permissão
        produtoRepository.updateDisponibilidadeByCategoriaId(categoriaId, disponivel);
    }

    public void deletar(Long id, Long empresaId) {
        Produto produto = buscarPorIdEEmpresa(id, empresaId);
        produtoRepository.delete(produto);
    }
}
