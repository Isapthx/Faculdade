package com.vitrinedigital.catalogo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vitrinedigital.catalogo.model.Empresa;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    Optional<Empresa> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Empresa> findByNomeContainingIgnoreCase(String nome);

    @Query("""
            SELECT DISTINCT e FROM Empresa e
            LEFT JOIN FETCH e.categorias c
            LEFT JOIN FETCH c.produtos
            WHERE e.slug = :slug
            """)
    Optional<Empresa> findBySlugComCategorias(@Param("slug") String slug);
}