package br.edu.faeterj.ap10.repository;

import br.edu.faeterj.ap10.model.LinkUtil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinkUtilRepository extends JpaRepository<LinkUtil, Long> {

    // Busca links aprovados de uma disciplina (para exibir na página de detalhes)
    List<LinkUtil> findByDisciplinaIdAndStatus(Long disciplinaId, String status);

    // Busca todos os pendentes (para o painel admin)
    List<LinkUtil> findByStatus(String status);
}
