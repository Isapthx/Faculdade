package br.edu.faeterj.ap10.service;

import br.edu.faeterj.ap10.dto.LinkUtilRequestDTO;
import br.edu.faeterj.ap10.model.LinkUtil;
import br.edu.faeterj.ap10.repository.LinkUtilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LinkUtilService {

    private final LinkUtilRepository repository;

    // Usuário envia sugestão → fica como PENDENTE
    public LinkUtil sugerirLink(LinkUtilRequestDTO dto) {
        LinkUtil link = new LinkUtil(
                dto.disciplinaId(),
                dto.nome(),
                dto.tipo(),
                dto.url()
        );
        return repository.save(link);
    }

    // Retorna apenas os links APROVADOS de uma disciplina (página pública)
    public List<LinkUtil> listarAprovados(Long disciplinaId) {
        return repository.findByDisciplinaIdAndStatus(disciplinaId, "APROVADO");
    }

    // Retorna todos os links PENDENTES (painel admin)
    public List<LinkUtil> listarPendentes() {
        return repository.findByStatus("PENDENTE");
    }

    // Admin aprova um link
    public LinkUtil aprovar(Long id) {
        LinkUtil link = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link não encontrado: " + id));
        link.setStatus("APROVADO");
        return repository.save(link);
    }

    // Admin rejeita um link
    public LinkUtil rejeitar(Long id) {
        LinkUtil link = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link não encontrado: " + id));
        link.setStatus("REJEITADO");
        return repository.save(link);
    }

    // Admin deleta definitivamente
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
