package com.vitrinedigital.catalogo.controller;

import com.vitrinedigital.catalogo.dto.ProdutoDTO;
import com.vitrinedigital.catalogo.dto.VitrineDTO;
import com.vitrinedigital.catalogo.model.Empresa;
import com.vitrinedigital.catalogo.model.Produto;
import com.vitrinedigital.catalogo.service.EmpresaService;
import com.vitrinedigital.catalogo.service.ProdutoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vitrine")
@CrossOrigin(origins = "*")
public class VitrineController {

    private final EmpresaService empresaService;
    private final ProdutoService produtoService;

    public VitrineController(EmpresaService empresaService, ProdutoService produtoService) {
        this.empresaService = empresaService;
        this.produtoService = produtoService;
    }

    // GET /api/vitrine/padaria-do-joao
    // Retorna empresa + categorias + produtos disponíveis — tudo junto
    @GetMapping("/{slug}")
    public ResponseEntity<VitrineDTO> buscarVitrine(@PathVariable String slug) {
        Empresa empresa = empresaService.buscarPorSlug(slug);
        return ResponseEntity.ok(VitrineDTO.de(empresa));
    }

    // GET /api/vitrine/padaria-do-joao/produtos
    // GET /api/vitrine/padaria-do-joao/produtos?busca=pão
    @GetMapping("/{slug}/produtos")
    public ResponseEntity<List<ProdutoDTO>> listarProdutos(
            @PathVariable String slug,
            @RequestParam(required = false) String busca
    ) {
        Empresa empresa = empresaService.buscarPorSlug(slug);

        List<Produto> produtos = (busca != null && !busca.isBlank())
                ? produtoService.buscar(empresa.getId(), busca)
                : produtoService.listarDisponiveisPorEmpresa(empresa.getId());

        return ResponseEntity.ok(produtos.stream().map(ProdutoDTO::de).toList());
    }
}