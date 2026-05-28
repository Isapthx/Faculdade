package com.vitrinedigital.catalogo.repository;

import com.vitrinedigital.catalogo.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByCategoriaId(Long categoriaId);

    List<Produto> findByCategoriaIdAndDisponivelTrue(Long categoriaId);

    @Query("""
            SELECT p FROM Produto p
            WHERE p.categoria.empresa.id = :empresaId
            ORDER BY p.categoria.nome ASC, p.nome ASC
            """)
    List<Produto> findAllByEmpresaId(@Param("empresaId") Long empresaId);

    @Query("""
            SELECT p FROM Produto p
            WHERE p.categoria.empresa.id = :empresaId
            AND p.disponivel = true
            ORDER BY p.categoria.nome ASC, p.nome ASC
            """)
    List<Produto> findDisponivelByEmpresaId(@Param("empresaId") Long empresaId);

    @Query("""
            SELECT p FROM Produto p
            WHERE p.categoria.empresa.id = :empresaId
            AND p.disponivel = true
            AND (LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%'))
              OR LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%')))
            ORDER BY p.nome ASC
            """)
    List<Produto> searchByEmpresaIdAndTermo(
            @Param("empresaId") Long empresaId,
            @Param("termo") String termo
    );

    @Query("""
            SELECT p FROM Produto p
            WHERE p.id = :id
            AND p.categoria.empresa.id = :empresaId
            """)
    Optional<Produto> findByIdAndEmpresaId(
            @Param("id") Long id,
            @Param("empresaId") Long empresaId
    );

    @Modifying
    @Query("""
            UPDATE Produto p SET p.disponivel = :disponivel
            WHERE p.categoria.id = :categoriaId
            """)
    void updateDisponibilidadeByCategoriaId(
            @Param("categoriaId") Long categoriaId,
            @Param("disponivel") boolean disponivel
    );

    long countByCategoriaId(Long categoriaId);
}