package com.vitrinedigital.catalogo.dto;

import com.vitrinedigital.catalogo.model.Empresa;
import java.util.List;

public record VitrineDTO(
        Long id,
        String nome,
        String slug,
        String whatsapp,
        List<CategoriaDTO> categorias
) {
    public static VitrineDTO de(Empresa e) {
        List<CategoriaDTO> categorias = e.getCategorias().stream()
                .map(CategoriaDTO::de)
                .toList();

        return new VitrineDTO(
                e.getId(),
                e.getNome(),
                e.getSlug(),
                e.getWhatsapp(),
                categorias
        );
    }
}
