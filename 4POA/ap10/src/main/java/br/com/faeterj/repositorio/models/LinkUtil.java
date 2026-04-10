package br.com.faeterj.repositorio.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    // Relação com a disciplina (apenas o ID é salvo, sem FK obrigatória no SQLite)
    @Column(name = "disciplina_id", nullable = false)
    private Long disciplinaId;

    @Column(nullable = false)
    private String nome;

    // Tipos: playlist, lista, livro, slides, artigo, video
    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String url;

    // Status: PENDENTE, APROVADO, REJEITADO
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
