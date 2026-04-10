package br.com.faeterj.repositorio.repositories;

import br.com.faeterj.repositorio.models.LinkUtil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinkUtilRepository extends JpaRepository<LinkUtil, Long> {

    List<LinkUtil> findByDisciplinaIdAndStatus(Long disciplinaId, String status);

    List<LinkUtil> findByStatus(String status);
}