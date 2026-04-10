package br.edu.faeterj.ap10.controller;

import br.edu.faeterj.ap10.dto.LinkUtilRequestDTO;
import br.edu.faeterj.ap10.model.LinkUtil;
import br.edu.faeterj.ap10.service.LinkUtilService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/links")
@RequiredArgsConstructor
// Se o seu front roda em porta diferente do Spring, descomente a linha abaixo:
// @CrossOrigin(origins = "*")
public class LinkUtilController {

    private final LinkUtilService service;

    // ------------------------------------------------------------------
    // ROTAS PÚBLICAS (página de detalhes da disciplina)
    // ------------------------------------------------------------------

    // GET /api/links/disciplina/{id}  → lista links aprovados da disciplina
    @GetMapping("/disciplina/{disciplinaId}")
    public List<LinkUtil> listarAprovados(@PathVariable Long disciplinaId) {
        return service.listarAprovados(disciplinaId);
    }

    // POST /api/links  → usuário sugere um novo link (fica PENDENTE)
    @PostMapping
    public ResponseEntity<LinkUtil> sugerir(@RequestBody LinkUtilRequestDTO dto) {
        LinkUtil salvo = service.sugerirLink(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // ------------------------------------------------------------------
    // ROTAS ADMINISTRATIVAS
    // ------------------------------------------------------------------

    // GET /api/links/pendentes  → admin vê o que precisa moderar
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
