package com.vitrinedigital.catalogo.controller;

import com.vitrinedigital.catalogo.model.Categoria;
import com.vitrinedigital.catalogo.service.CategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/empresas/{empresaId}/categorias")
@CrossOrigin(origins = "*")
public class AdminCategoriaController {

    private final CategoriaService categoriaService;

    public AdminCategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listar(@PathVariable Long empresaId) {
        return ResponseEntity.ok(categoriaService.listarPorEmpresa(empresaId));
    }

    @PostMapping
    public ResponseEntity<Categoria> criar(
            @PathVariable Long empresaId,
            @RequestBody Categoria categoria
    ) {
        Categoria salva = categoriaService.salvar(empresaId, categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            @RequestBody Categoria categoria
    ) {
        return ResponseEntity.ok(categoriaService.atualizar(id, empresaId, categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long empresaId,
            @PathVariable Long id
    ) {
        categoriaService.deletar(id, empresaId);
        return ResponseEntity.noContent().build();
    }
}
