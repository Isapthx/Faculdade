package com.vitrinedigital.catalogo.service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vitrinedigital.catalogo.dto.EnviarOrcamentoDTO;
import com.vitrinedigital.catalogo.dto.ItemCarrinhoDTO;
import com.vitrinedigital.catalogo.dto.LinkWppDTO;
import com.vitrinedigital.catalogo.exception.BusinessException;
import com.vitrinedigital.catalogo.exception.ResourceNotFoundException;
import com.vitrinedigital.catalogo.model.Empresa;
import com.vitrinedigital.catalogo.model.Produto;
import com.vitrinedigital.catalogo.repository.EmpresaRepository;
import com.vitrinedigital.catalogo.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional (readOnly=true)
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final ProdutoRepository produtoRepository;

    // Busca usada pela vitrine pública — resolve a URL /nome-da-loja
    @Transactional(readOnly = true)
    // ✅ DEPOIS — usa a query com JOIN FETCH
public Empresa buscarPorSlug(String slug) {
    return empresaRepository.findBySlugComCategorias(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa", "slug", slug));
}
    @Transactional(readOnly = true)
    public Empresa buscarPorId(Long id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", id));
    }

    @Transactional(readOnly = true)
    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    public Empresa salvar(Empresa empresa) {
        validarSlugUnico(empresa.getSlug(), null);
        return empresaRepository.save(empresa);
    }

    public Empresa atualizar(Long id, Empresa dadosNovos) {
        Empresa empresa = buscarPorId(id);

        if (!empresa.getSlug().equals(dadosNovos.getSlug())) {
            validarSlugUnico(dadosNovos.getSlug(), id);
        }

        empresa.setNome(dadosNovos.getNome());
        empresa.setSlug(dadosNovos.getSlug());
        empresa.setWhatsapp(dadosNovos.getWhatsapp());

        return empresaRepository.save(empresa);
    }

    public void deletar(Long id) {
        Empresa empresa = buscarPorId(id);
        empresaRepository.delete(empresa);
    }

    private void validarSlugUnico(String slug, Long idAtual) {
        empresaRepository.findBySlug(slug).ifPresent(existente -> {
            if (!existente.getId().equals(idAtual)) {
                throw new BusinessException(
                        "O slug '" + slug + "' já está em uso. Escolha outro nome para a URL da sua loja."
                );
            }
        });
    }

    public LinkWppDTO gerarLinkOrcamento(String slug, EnviarOrcamentoDTO dto) {
        Empresa empresa = empresaRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada para o slug: " + slug));

        StringBuilder mensagem = new StringBuilder();

        mensagem.append(String.format("Olá, *%s*! 👋\n", empresa.getNome()));
        mensagem.append(String.format("Gostaria de solicitar um orçamento (Cliente: %s):\n\n", dto.getNomeCliente()));
        mensagem.append("------------- Pedido -------------\n");

        double valorTotalGeral = 0.0;

        // 3. Iterar sobre os itens enviados para validar o preço e somar os valores
        for (ItemCarrinhoDTO item : dto.getItens()) {
            Produto produto = produtoRepository.findById(item.getProdutoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto id " + item.getProdutoId() + " não existe."));

            double subtotal = produto.getPreco().multiply(BigDecimal.valueOf(item.getQuantidade())).doubleValue();
            valorTotalGeral += subtotal;

            mensagem.append(String.format("• %dx _%s_\n", item.getQuantidade(), produto.getNome()));
            mensagem.append(String.format("  Un: R$ %.2f | Sub: R$ %.2f\n", produto.getPreco(), subtotal));
        }

        mensagem.append("----------------------------------\n");
        mensagem.append(String.format("*Total Estimado: R$ %.2f*\n\n", valorTotalGeral));

        // 4. Adicionar observações se existirem
        if (dto.getObservacao() != null && !dto.getObservacao().isBlank()) {
            mensagem.append(String.format("*Obs:* %s\n", dto.getObservacao()));
        }
        
        mensagem.append("Aguardo a confirmação da disponibilidade. Obrigado!");

        // 5. Codificar o texto para o formato de URL padrão da Web (substituir espaços por %20, etc.)
        String textoCodificado = URLEncoder.encode(mensagem.toString(), StandardCharsets.UTF_8);
        
        // Substituir o '+' gerado pelo URLEncoder pelo '%20' para garantir compatibilidade perfeita no WhatsApp
        textoCodificado = textoCodificado.replace("+", "%20");

        // 6. Limpar o número do telefone da empresa (garantir que tenha apenas números e o DDI 55)
        String telefoneFormatado = empresa.getWhatsapp().replaceAll("[^0-9]", "");
        if (!telefoneFormatado.startsWith("55")) {
            telefoneFormatado = "55" + telefoneFormatado;
        }

        // 7. Montar a URL Final da API do WhatsApp
        String urlFinal = "https://api.whatsapp.com/send?phone=" + telefoneFormatado + "&text=" + textoCodificado;

        return new LinkWppDTO(urlFinal);
    }
}
