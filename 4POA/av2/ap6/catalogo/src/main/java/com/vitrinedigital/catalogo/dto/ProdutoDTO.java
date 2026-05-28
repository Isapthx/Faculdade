package com.vitrinedigital.catalogo.dto;

import com.vitrinedigital.catalogo.model.Produto;
import java.math.BigDecimal;

public record ProdutoDTO(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        String urlImagem,
        Boolean disponivel
) {
    public static ProdutoDTO de(Produto p) {
        return new ProdutoDTO(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getPreco(),
                p.getUrlImagem(),
                p.getDisponivel()
        );
    }
}
