package br.com.faeterj.repositorio.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.faeterj.repositorio.models.Topico;
import br.com.faeterj.repositorio.repositories.TopicoRepository;

@RestController
@RequestMapping("/api/topicos")
@CrossOrigin("*")
public class TopicoController {

    @Autowired
    private TopicoRepository repository;

    @PostMapping
    public Topico salvar(@RequestBody Topico topico) {
        return repository.save(topico);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        repository.deleteById(id);
    }
}