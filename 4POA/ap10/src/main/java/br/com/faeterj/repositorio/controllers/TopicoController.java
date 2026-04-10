package br.com.faeterj.repositorio.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.faeterj.repositorio.models.Disciplina;
import br.com.faeterj.repositorio.models.Topico;
import br.com.faeterj.repositorio.repositories.DisciplinaRepository;
import br.com.faeterj.repositorio.repositories.TopicoRepository;

@RestController
@RequestMapping("/api/topicos")
@CrossOrigin("*")
public class TopicoController {

    @Autowired
    private TopicoRepository repository;

    @Autowired
    private DisciplinaRepository disciplinaRepository; // ← ADICIONE

    // ← NOVO: lista tópicos de uma disciplina
    @GetMapping("/disciplina/{disciplinaId}")
    public List<Topico> listarPorDisciplina(@PathVariable Long disciplinaId) {
        return repository.findByDisciplinaId(disciplinaId);
    }

    // ← NOVO: edita o título de um tópico
    @PutMapping("/{id}")
    public ResponseEntity<Topico> editar(@PathVariable Long id, @RequestBody Topico dados) {
        return repository.findById(id).map(topico -> {
            topico.setTitulo(dados.getTitulo());
            return ResponseEntity.ok(repository.save(topico));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Topico> salvar(@RequestBody Topico topico) {
        Disciplina disciplina = disciplinaRepository
            .findById(topico.getDisciplina().getId())
            .orElseThrow(() -> new RuntimeException("Disciplina não encontrada"));

        topico.setDisciplina(disciplina);
        return ResponseEntity.ok(repository.save(topico));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}