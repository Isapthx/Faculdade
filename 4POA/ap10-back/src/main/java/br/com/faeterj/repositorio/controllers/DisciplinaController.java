package br.com.faeterj.repositorio.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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

    // Endpoint para cadastrar uma nova (útil para você popular o banco inicialmente)
    @PostMapping
    public Disciplina criar(@RequestBody Disciplina disciplina) {
        return repository.save(disciplina);
    }
}