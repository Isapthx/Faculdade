package com.vitrinedigital.catalogo.controller;

import com.vitrinedigital.catalogo.model.Produto;
import com.vitrinedigital.catalogo.service.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/empresas/{empresaId}/produtos")
@CrossOrigin(origins = "*")
public class AdminProdutoController {

    private final ProdutoService produtoService;

    public AdminProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listar(@PathVariable Long empresaId) {
        return ResponseEntity.ok(produtoService.listarPorEmpresa(empresaId));
    }

    @PostMapping
    public ResponseEntity<Produto> criar(
            @PathVariable Long empresaId,
            @RequestParam Long categoriaId,
            @RequestBody Produto produto
    ) {
        Produto salvo = produtoService.salvar(empresaId, categoriaId, produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            @RequestParam Long categoriaId,
            @RequestBody Produto produto
    ) {
        return ResponseEntity.ok(produtoService.atualizar(id, empresaId, categoriaId, produto));
    }

    @PatchMapping("/{id}/disponibilidade")
    public ResponseEntity<Produto> alterarDisponibilidade(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body
    ) {
        boolean disponivel = body.getOrDefault("disponivel", true);
        return ResponseEntity.ok(produtoService.alterarDisponibilidade(id, empresaId, disponivel));
    }

    // DELETE /api/admin/empresas/1/produtos/3
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long empresaId,
            @PathVariable Long id
    ) {
        produtoService.deletar(id, empresaId);
        return ResponseEntity.noContent().build();
    }
}
