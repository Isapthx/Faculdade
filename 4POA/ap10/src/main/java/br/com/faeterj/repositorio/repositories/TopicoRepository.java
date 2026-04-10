package br.com.faeterj.repositorio.repositories; // Certifique-se de que o pacote está correto

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.faeterj.repositorio.models.Topico;

@Repository
public interface TopicoRepository extends JpaRepository<Topico, Long> {
    List<Topico> findByDisciplinaId(Long disciplinaId); // ← NOVO
}