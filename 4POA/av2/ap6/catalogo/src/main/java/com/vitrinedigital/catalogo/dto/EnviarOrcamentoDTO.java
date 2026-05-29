package com.vitrinedigital.catalogo.dto;

import java.util.List;

import lombok.Data;

@Data
public class EnviarOrcamentoDTO {
    private String nomeCliente;
    private String observacao;
    private List<ItemCarrinhoDTO> itens;
}

