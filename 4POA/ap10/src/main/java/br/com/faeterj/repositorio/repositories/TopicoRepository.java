package br.com.faeterj.repositorio.repositories; // Certifique-se de que o pacote está correto

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.faeterj.repositorio.models.Topico;

@Repository
public interface TopicoRepository extends JpaRepository<Topico, Long> {
    // Aqui você não precisa escrever código, o Spring Boot gera tudo automaticamente!
}