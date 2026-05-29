package com.vitrinedigital.catalogo.dto;
import java.util.List;

import com.vitrinedigital.catalogo.model.Categoria;


public record CategoriaDTO(
        Long id,
        String nome,
        List<ProdutoDTO> produtos
) {
    public static CategoriaDTO de(Categoria c) {
        List<ProdutoDTO> produtos = c.getProdutos().stream()
                .filter(p -> p.getDisponivel())
                .map(ProdutoDTO::de)
                .toList();

        return new CategoriaDTO(c.getId(), c.getNome(), produtos);
    }
}
