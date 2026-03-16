import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class Agenda {
    @SuppressWarnings("CallToPrintStackTrace")
    public void escrita(String nome, String telefone) {
        try {
            try (FileWriter fw = new FileWriter("C:/Users/Windows Lite BR/Documents/Estudos/4POA/AP3.agenda.txt", true); BufferedWriter bw = new BufferedWriter(fw)) {
                bw.write(nome + ";" + telefone + "\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void lerTodos () {
        try {
            BufferedReader br;
            try (FileReader fr = new FileReader("C:/Users/Windows Lite BR/Documents/Estudos/4POA/AP3.agenda.txt")) {
                br = new BufferedReader(fr);
                while (br.ready()) {
                    String aux = br.readLine();
                    String [] dados = aux.split((";"));
                    System.out.println("Nome: " + dados[0] + " - Telefone: " + dados[1]);
                }
            }
            br.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public void lerContato (String nome) {
        try {
            BufferedReader br;
            try (FileReader fr = new FileReader("C:/Users/Windows Lite BR/Documents/Estudos/4POA/AP3.agenda.txt")) {
                br = new BufferedReader(fr);
                Boolean encontrado = false;
                while (br.ready()) {
                    String aux = br.readLine();
                    
                    if (aux.contains(nome)) {
                        String [] dados = aux.split((";"));
                        System.out.println("\nNome: " + dados[0] + " - Telefone: " + dados[1]);
                        encontrado = true;
                    }
                }   if (!encontrado) {
                    System.out.println("Dados não encontrados!");
                }
            }
            br.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
