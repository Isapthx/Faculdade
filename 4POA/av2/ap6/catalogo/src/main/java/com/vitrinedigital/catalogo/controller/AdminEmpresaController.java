package com.vitrinedigital.catalogo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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

import com.vitrinedigital.catalogo.dto.EnviarOrcamentoDTO;
import com.vitrinedigital.catalogo.dto.LinkWppDTO;
import com.vitrinedigital.catalogo.model.Empresa;
import com.vitrinedigital.catalogo.service.EmpresaService;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*")
public class AdminEmpresaController {

    private final EmpresaService empresaService;

    public AdminEmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @GetMapping
    public ResponseEntity<List<Empresa>> listar() {
        return ResponseEntity.ok(empresaService.listarTodas());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Empresa> buscarPorId(@PathVariable Long id) {
        Empresa empresa = empresaService.buscarPorId(id);
        return ResponseEntity.ok(empresa);
    }

    // Qualquer outro texto enviado (como "padaria-do-ze") cairá automaticamente aqui
    @GetMapping("/{slug}")
    public ResponseEntity<Empresa> buscarPorSlug(@PathVariable String slug) {
        Empresa empresa = empresaService.buscarPorSlug(slug);
        return ResponseEntity.ok(empresa);
    }

    @PostMapping
    public ResponseEntity<Empresa> criar(@RequestBody Empresa empresa) {
        Empresa salva = empresaService.salvar(empresa);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empresa> atualizar(@PathVariable Long id, @RequestBody Empresa empresa) {
        return ResponseEntity.ok(empresaService.atualizar(id, empresa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        empresaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{slug}/orcamento")
    public ResponseEntity<LinkWppDTO> enviarOrcamento(@PathVariable String slug, @RequestBody EnviarOrcamentoDTO dto) {
        LinkWppDTO linkDto = empresaService.gerarLinkOrcamento(slug, dto);
        return ResponseEntity.ok(linkDto);
    }
}
