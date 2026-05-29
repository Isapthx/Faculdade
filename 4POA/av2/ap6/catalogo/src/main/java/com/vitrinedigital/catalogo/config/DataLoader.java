package com.vitrinedigital.catalogo.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.vitrinedigital.catalogo.model.Categoria;
import com.vitrinedigital.catalogo.model.Empresa;
import com.vitrinedigital.catalogo.model.Produto;
import com.vitrinedigital.catalogo.repository.CategoriaRepository;
import com.vitrinedigital.catalogo.repository.EmpresaRepository;
import com.vitrinedigital.catalogo.repository.ProdutoRepository;

import jakarta.transaction.Transactional;

@Component
public class DataLoader implements CommandLineRunner {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    // ✅ Apenas o repositório raiz da hierarquia é necessário
    private final EmpresaRepository empresaRepository;

    public DataLoader(EmpresaRepository empresaRepository, CategoriaRepository categoriaRepository, ProdutoRepository produtoRepository) {
        this.empresaRepository = empresaRepository;
        this.categoriaRepository = categoriaRepository;
        this.produtoRepository = produtoRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // ✅ CascadeType.ALL garante que categorias e produtos são removidos em cascata
        empresaRepository.deleteAll();
        categoriaRepository.deleteAll();
        produtoRepository.deleteAll();

        // 1. Empresa
        Empresa empresa = new Empresa();
        empresa.setNome("Padaria Do Zé");
        empresa.setSlug("padaria-do-ze");
        empresa.setWhatsapp("5521999999999");

        // 2. Categoria "Pães e Doces"
        Categoria catPadaria = new Categoria();
        catPadaria.setNome("Pães e Doces");

        Produto p1 = new Produto();
        p1.setNome("Pão Francês");
        p1.setDescricao("O clássico que não pode faltar na sua mesa! Pão francês produzido diariamente com ingredientes selecionados. Casquinha dourada e crocante por fora, miolo leve e fofinho por dentro. Perfeito com manteiga derretida.");
        p1.setPreco(new BigDecimal("0.50"));
        p1.setDisponivel(true);

        Produto p2 = new Produto();
        p2.setNome("Bolo de Cenoura");
        p2.setDescricao("Aquele sabor de infância! Bolo de cenoura feito de forma artesanal, com massa leve, aerada e muito fofinha. Para ficar ainda melhor, acompanha uma cobertura cremosa e generosa de chocolate. Perfeito para o lanche da tarde.");
        p2.setPreco(new BigDecimal("12.00"));
        p2.setDisponivel(true);

        // ✅ Produtos adicionados à categoria ANTES de qualquer save()
        catPadaria.adicionarProduto(p1);
        catPadaria.adicionarProduto(p2);

        // 3. Categoria "Bebidas"
        Categoria catBebidas = new Categoria();
        catBebidas.setNome("Bebidas");

        Produto p3 = new Produto();
        p3.setNome("Suco Natural de Laranja");
        p3.setDescricao("Garrafa de 500ml, sem açúcar");
        p3.setPreco(new BigDecimal("8.50"));
        p3.setDisponivel(true);

        Produto p4 = new Produto();
        p4.setNome("Refrigerante Lata");
        p4.setDescricao("Lata de 350ml");
        p4.setPreco(new BigDecimal("5.00"));
        p4.setDisponivel(true);

        Produto p5 = new Produto();
        p5.setNome("Água Mineral sem Gás");
        p5.setDescricao("Garrafa de 500ml");
        p5.setPreco(new BigDecimal("3.00"));
        p5.setDisponivel(true);

        catBebidas.adicionarProduto(p3);
        catBebidas.adicionarProduto(p4);
        catBebidas.adicionarProduto(p5);

        // 4. ✅ Grafo completo montado em memória — categorias vinculadas à empresa
        empresa.adicionarCategoria(catPadaria);
        empresa.adicionarCategoria(catBebidas);

        // 5. ✅ Um único save() persiste toda a hierarquia via cascata
        empresaRepository.save(empresa);

        System.out.println("🌱 Banco de dados populado com sucesso para testes!");
    }
}