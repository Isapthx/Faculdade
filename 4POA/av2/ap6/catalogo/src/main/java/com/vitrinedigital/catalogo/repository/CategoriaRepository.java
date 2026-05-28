package com.vitrinedigital.catalogo.repository;

import com.vitrinedigital.catalogo.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByEmpresaId(Long empresaId);

    List<Categoria> findByEmpresaIdOrderByNomeAsc(Long empresaId);

    boolean existsByNomeIgnoreCaseAndEmpresaId(String nome, Long empresaId);

    Optional<Categoria> findByIdAndEmpresaId(Long id, Long empresaId);

    @Query("""
            SELECT DISTINCT c FROM Categoria c
            LEFT JOIN FETCH c.produtos p
            WHERE c.empresa.id = :empresaId
            AND (:apenasDisponiveis = false OR p.disponivel = true)
            ORDER BY c.nome ASC
            """)
    List<Categoria> findByEmpresaIdComProdutos(
            @Param("empresaId") Long empresaId,
            @Param("apenasDisponiveis") boolean apenasDisponiveis
    );
}