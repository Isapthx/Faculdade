package br.com.faeterj.repositorio.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Topico {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String titulo;

    @ManyToOne
    @JoinColumn(name = "disciplina_id")
    @JsonIgnore // Evita que o JSON entre em loop infinito ao listar disciplina -> topico -> disciplina
    private Disciplina disciplina;

}