package br.com.faeterj.repositorio.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Entity
@Data // Se instalou o Lombok, isso gera Getters e Setters automaticamente
public class Disciplina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "disciplina", cascade = CascadeType.ALL)
private List<Topico> topicos;

    private String nome;
    private Integer periodo;
    
    // Armazenaremos a média calculada (ou você pode calcular via query depois)
    private Double dificuldadeMedia = 0.0;
    private Double importanciaMedia = 0.0;

    // Construtor vazio padrão exigido pela JPA
    public Disciplina() {}

    public Disciplina(String nome, Integer periodo) {
        this.nome = nome;
        this.periodo = periodo;
    }
}