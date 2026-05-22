package jogo.jogo;

import javax.swing.JLabel;
import java.util.Random;

public class Mago extends Thread {
    private JLabel labelMago;
    private boolean correndo = true;

    public Mago(JLabel labelMago) {
        this.labelMago = labelMago;
    }

    public void pararMagia() {
        correndo = false;
    }

    @Override
    public void run() {
        Random gerador = new Random();
        while (correndo && labelMago.getX() < 850) {
            try {
                int passoMagico = gerador.nextInt(15) + 1;
                labelMago.setLocation(labelMago.getX() + passoMagico, labelMago.getY());
                Thread.sleep(gerador.nextInt(40) + 20);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

