package br.com.faeterj.repositorio.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.faeterj.repositorio.models.LinkUtil;
import br.com.faeterj.repositorio.models.service.LinkUtilService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/links")
@RequiredArgsConstructor
public class LinkUtilController {

    private final LinkUtilService service;

    // GET /api/links/disciplina/{id} — links aprovados (página pública)
    @GetMapping("/disciplina/{disciplinaId}")
    public List<LinkUtil> listarAprovados(@PathVariable Long disciplinaId) {
        return service.listarAprovados(disciplinaId);
    }

    // POST /api/links — usuário sugere um link
    @PostMapping
    public ResponseEntity<LinkUtil> sugerir(@RequestBody Map<String, Object> body) {
        String nome = (String) body.get("nome");
        String tipo = (String) body.get("tipo");
        String url  = (String) body.get("url");
        Long disciplinaId = Long.valueOf(body.get("disciplinaId").toString());

        LinkUtil salvo = service.sugerirLink(nome, tipo, url, disciplinaId);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // GET /api/links/pendentes — admin vê pendentes
    @GetMapping("/pendentes")
    public List<LinkUtil> listarPendentes() {
        return service.listarPendentes();
    }

    // PATCH /api/links/{id}/aprovar
    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<LinkUtil> aprovar(@PathVariable Long id) {
        return ResponseEntity.ok(service.aprovar(id));
    }

    // PATCH /api/links/{id}/rejeitar
    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<LinkUtil> rejeitar(@PathVariable Long id) {
        return ResponseEntity.ok(service.rejeitar(id));
    }

    // DELETE /api/links/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}