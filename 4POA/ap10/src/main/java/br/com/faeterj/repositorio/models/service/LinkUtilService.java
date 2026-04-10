package br.com.faeterj.repositorio.models.service;

import br.com.faeterj.repositorio.models.LinkUtil;
import br.com.faeterj.repositorio.repositories.LinkUtilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class Linkutilservice {

    private final LinkUtilRepository repository;

    public LinkUtil sugerirLink(String nome, String tipo, String url, Long disciplinaId) {
        LinkUtil link = new LinkUtil(disciplinaId, nome, tipo, url);
        return repository.save(link);
    }

    public List<LinkUtil> listarAprovados(Long disciplinaId) {
        return repository.findByDisciplinaIdAndStatus(disciplinaId, "APROVADO");
    }

    public List<LinkUtil> listarPendentes() {
        return repository.findByStatus("PENDENTE");
    }

    public LinkUtil aprovar(Long id) {
        LinkUtil link = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link não encontrado: " + id));
        link.setStatus("APROVADO");
        return repository.save(link);
    }

    public LinkUtil rejeitar(Long id) {
        LinkUtil link = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link não encontrado: " + id));
        link.setStatus("REJEITADO");
        return repository.save(link);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}