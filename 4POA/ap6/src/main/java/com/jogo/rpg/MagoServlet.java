package com.jogo.rpg;

import java.io.IOException;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Mapeia a URL que colocamos no "action" do formulário
@WebServlet("/cadastrarMago")
public class MagoServlet extends HttpServlet {

    @Override // Sobrescrevendo um comportamento padrão da classe HttpServlet
    protected void doPost(HttpServletRequest request, HttpServletResponse response) // método que processa um POST
            throws ServletException, IOException { //excessões 
        
        // dados da requisição
        String nome = request.getParameter("nomeMago");
        String nivelStr = request.getParameter("nivelInicial");
        String manaStr = request.getParameter("mana");
        String[] elementosSelecionados = request.getParameterValues("elementos");
        String elemento = "";

        // Validadção da quantidade de elementos selecionados
        if (elementosSelecionados != null && elementosSelecionados.length < 2) {
            elemento = elementosSelecionados[0];
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Um mago não pode ter mais de um ou nenhum elemento inicial.");
        }

        int nivel = 1;
        int mana = 50;
        try {
            nivel = Integer.parseInt(nivelStr);
            mana = Integer.parseInt(manaStr);
        } catch (NumberFormatException e) {
            // Se der erro na conversão, mantém os valores padrão
        }

        // Instanciando objeto mago
        Mago novoMago = new Mago(nome, nivel, mana, elemento);

        // Inserindo o objeto do mago criado na requisição do formulário
        request.setAttribute("magoGerado", novoMago);

        // setando o endereço de encaminhamento da requisição
        RequestDispatcher dispatcher = request.getRequestDispatcher("resultado.jsp");

        // encaminhando as mesmas requisição e resposta do formulário, porém agora com o objeto do mago na req.
        dispatcher.forward(request, response);
    }
}