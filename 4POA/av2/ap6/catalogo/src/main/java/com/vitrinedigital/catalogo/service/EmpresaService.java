package com.vitrinedigital.catalogo.service;

import com.vitrinedigital.catalogo.exception.BusinessException;
import com.vitrinedigital.catalogo.exception.ResourceNotFoundException;
import com.vitrinedigital.catalogo.model.Empresa;
import com.vitrinedigital.catalogo.repository.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    // Busca usada pela vitrine pública — resolve a URL /nome-da-loja
    @Transactional(readOnly = true)
    public Empresa buscarPorSlug(String slug) {
        return empresaRepository.findBySlugComCategorias(slug)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empresa", "slug", slug
                ));
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
}
