import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class AgendaMagica {
    @SuppressWarnings("CallToPrintStackTrace")
    
    public void escrita(String nome, int telepatia) {
        try {
            try (FileWriter fw = new FileWriter("C:/Users/Windows Lite BR/Documents/Estudos/Faculdade/4POA/AP3/src/agenda-magica.txt", true); BufferedWriter bw = new BufferedWriter(fw)) {
                bw.write(nome + ";" + "Nvl " + telepatia);
                bw.newLine();

                System.out.println("O contato de " + nome + " foi selado no pergaminho.");
                bw.close();
            }
        } catch (IOException e) {
            System.out.println("PQP! Erro ao tentar salvar contato: " + e.getMessage());
        }
    }

    public void lerTodos () {
        try {
            BufferedReader br;
            try (FileReader fr = new FileReader("C:/Users/Windows Lite BR/Documents/Estudos/Faculdade/4POA/AP3/src/agenda-magica.txt")) {
                br = new BufferedReader(fr);

                System.out.println("\nRevelando os contatos mágicos ocultos...\n");

                while (br.ready()) {
                    String aux = br.readLine();
                    String [] dados = aux.split((";"));
                    System.out.println("Mago(a): " + dados[0] + " | Telepatia: " + dados[1]);
                }

                fr.close();
                br.close();
            }
        } catch (FileNotFoundException e) {
            System.out.println("O pergaminho sumiu! \nErro: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Interferência mágica ao ler! \nErro: " + e.getMessage());
        }
    }
    public void lerContato (String nome) {
        try {
            BufferedReader br;
            try (FileReader fr = new FileReader("C:/Users/Windows Lite BR/Documents/Estudos/Faculdade/4POA/AP3/src/agenda-magica.txt")) {
                br = new BufferedReader(fr);
                Boolean encontrado = false;
                while (br.ready()) {
                    String aux = br.readLine();
                    
                    if (aux.contains(nome)) {
                        String [] dados = aux.split((";"));
                        System.out.println("Mago(a): " + dados[0] + " | Telepatia: " + dados[1]);
                        encontrado = true;
                    }
                }   if (!encontrado) {
                    System.out.println("Mago(a) não encontrado!");
                }
            }
            br.close();
        } catch (FileNotFoundException e) {
            System.out.println("O pergaminho sumiu! \nErro: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Interferência mágica ao ler! \nErro: " + e.getMessage());
        }
    }
}
