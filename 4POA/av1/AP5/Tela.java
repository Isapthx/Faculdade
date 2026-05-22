package jogo.jogo;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Tela extends JFrame {
    private JButton botaoComeca;
    private JButton botaoPara;
    private JLabel pista;
    private JLabel lblMago1, lblMago2, lblMago3;
    private ImageIcon imgMago1, imgMago2, imgMago3;
    private Mago threadMago1, threadMago2, threadMago3;

    public Tela() {
        this.setLayout(null);
        this.setSize(1000, 650);
        this.setLocationRelativeTo(null);
        this.setResizable(false);
        this.getContentPane().setBackground(Color.WHITE);
        this.setTitle("Torneio de Magia - Corrida de Magos");
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        this.imgMago1 = new ImageIcon("src/imagens/mago1.png");
        this.imgMago2 = new ImageIcon("src/imagens/mago2.png");
        this.imgMago3 = new ImageIcon("src/imagens/mago3.png");

        this.lblMago1 = new JLabel(imgMago1);
        this.lblMago1.setBounds(20, 100, 80, 80);

        this.lblMago2 = new JLabel(imgMago2);
        this.lblMago2.setBounds(20, 250, 80, 80);

        this.lblMago3 = new JLabel(imgMago3);
        this.lblMago3.setBounds(20, 400, 80, 80);

        this.botaoComeca = new JButton("Lançar Feitiço (Correr)");
        this.botaoComeca.setBounds(300, 550, 180, 40);
        this.botaoComeca.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                iniciarCorrida();
            }
        });

        this.botaoPara = new JButton("Congelar (Parar)");
        this.botaoPara.setBounds(500, 550, 180, 40);
        this.botaoPara.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                pararCorrida();
            }
        });

        this.pista = new JLabel();
        this.pista.setBounds(0, 0, 1000, 650);

        this.add(botaoComeca);
        this.add(botaoPara);
        this.add(lblMago1);
        this.add(lblMago2);
        this.add(lblMago3);
        this.add(pista);
    }

    private void iniciarCorrida() {
        lblMago1.setLocation(20, 100);
        lblMago2.setLocation(20, 250);
        lblMago3.setLocation(20, 400);

        threadMago1 = new Mago(lblMago1);
        threadMago2 = new Mago(lblMago2);
        threadMago3 = new Mago(lblMago3);

        threadMago1.start();
        threadMago2.start();
        threadMago3.start();
    }

    private void pararCorrida() {
        if (threadMago1 != null) threadMago1.pararMagia();
        if (threadMago2 != null) threadMago2.pararMagia();
        if (threadMago3 != null) threadMago3.pararMagia();
    }
}

