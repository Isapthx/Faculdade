package br.edu.faeterj.ap10.dto;

// DTO de ENTRADA — corpo do POST enviado pelo usuário
public record LinkUtilRequestDTO(
        Long disciplinaId,
        String nome,
        String tipo,   // playlist | lista | livro | slides | artigo | video
        String url
) {}
