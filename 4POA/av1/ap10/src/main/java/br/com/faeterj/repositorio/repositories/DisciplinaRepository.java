package br.com.faeterj.repositorio.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.faeterj.repositorio.models.Disciplina;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
    // Aqui você já ganha métodos como findAll(), save(), findById() de graça!
}