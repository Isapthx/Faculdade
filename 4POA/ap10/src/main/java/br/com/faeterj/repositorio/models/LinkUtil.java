package br.com.faeterj.repositorio.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "link_util")
public class LinkUtil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "disciplina_id", nullable = false)
    private Long disciplinaId;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String status = "PENDENTE";

    public LinkUtil(Long disciplinaId, String nome, String tipo, String url) {
        this.disciplinaId = disciplinaId;
        this.nome = nome;
        this.tipo = tipo;
        this.url = url;
        this.status = "PENDENTE";
    }
}