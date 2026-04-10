package br.com.faeterj.repositorio.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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