import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;


public class RPGame {
    public static void main(String[] args) {
        // 1. Criando as instâncias (Início da jornada)
        Mago ignis = new Mago("Ignis");
        Mago froze = new Mago("Froze");

        System.out.println("--- Início da Aventura ---\n");
        exibirStatus(ignis);
        exibirStatus(froze);

        // 2. Simulando progressão (Sequencialidade)
        System.out.println("\n--- Evento: Missão na Floresta Concluída! ---");
        
        // Ignis sobe de nível e aprende uma skill nova
        ignis.upparNivel();
        ignis.addSkill("Bola de Fogo");

        // Froze foca em utilidade
        froze.upparNivel();
        froze.addSkill("Parede de Gelo");

        // 3. Mais um salto na história
        System.out.println("\n--- Evento: Boss Derrotado! ---");
        ignis.upparNivel();
        ignis.addSkill("Explosão Solar");

        // 4. Exibindo resultado final
        System.out.println("\n--- Status Finais dos Heróis ---\n");
        exibirStatus(ignis);
        exibirStatus(froze);

        String savePath = "C:/Users/Windows Lite BR/Documents/Estudos/Faculdade/4POA/AP4/src/cpO.ser";

        System.out.println("\n=== SALVANDO CHECKPOINT NA ENTRADA DA DUNGEON ===");
        salvarJogo(savePath, ignis, froze);

        // 3. A BATALHA DESASTROSA
        System.out.println("\n--- A BATALHA COMEÇA ---\n");
        System.out.println("Um Dragão Ancião aparece!");
        
        // Simulando a morte de Froze
        System.err.println("CRÍTICO! Froze recebeu 9999 de dano.");
        froze = null; // Froze morreu, a referência foi perdida
        System.err.println("STATUS: Froze MORREU. Ignis está sozinho!");

        // 4. USANDO O CHECKPOINT (DESSERIALIZAÇÃO)
        System.out.println("\n=== [SISTEMA] MORTE DETECTADA. CARREGANDO CHECKPOINT... ===\n");
        
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(savePath))) {
            // Restaurando os magos 
            ignis = (Mago) ois.readObject();
            froze = (Mago) ois.readObject();

            System.out.println("=== CHECKPOINT CARREGADO COM SUCESSO! ===\n");
            System.out.println("Mago: " + froze.getNome() + " está VIVO novamente!");
            System.out.println("Skills de " + froze.getNome() + ": " + froze.getSkills());
            
        } catch (IOException | ClassNotFoundException e) {
            System.err.println("Erro ao carregar checkpoint: " + e.getMessage());
        }

        // 5. CONTINUANDO APÓS O RESPAWN
        if (froze != null) {
            System.out.println(ignis.getNome() + " e " + froze.getNome() + " decidiram fugir desta vez.");
        } else {
            System.out.println(ignis.getNome() + " tentou fugir sozinho.");
        }
    }

    // Método auxiliar para organizar a Serialização
    public static void salvarJogo(String caminho, Mago m1, Mago m2) {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(caminho))) {
            oos.writeObject(m1);
            oos.writeObject(m2);
        } catch (IOException e) {
            System.err.println("Falha ao salvar: " + e.getMessage());
        }
    }

    // Método auxiliar para facilitar a visualização no console
    public static void exibirStatus(Mago mago) {
        System.out.println("Mago: " + mago.getNome() + 
                        " | Nível: " + mago.getNivel() + 
                        " | Skills: " + mago.getSkills());
    }
}