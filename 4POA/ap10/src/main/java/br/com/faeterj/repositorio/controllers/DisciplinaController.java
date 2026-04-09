package br.com.faeterj.repositorio.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.faeterj.repositorio.models.Disciplina;
import br.com.faeterj.repositorio.repositories.DisciplinaRepository;

@RestController
@RequestMapping("/api/disciplinas")
@CrossOrigin(origins = "*") // Permite que seu Frontend JavaScript acesse a API sem erros de CORS
public class DisciplinaController {

    @Autowired
    private DisciplinaRepository repository;

    // Endpoint para listar todas as disciplinas
    @GetMapping
    public List<Disciplina> listarTodas() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Disciplina> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para cadastrar uma nova (útil para você popular o banco inicialmente)
    @PostMapping
    public Disciplina criar(@RequestBody Disciplina disciplina) {
        return repository.save(disciplina);
    }
}