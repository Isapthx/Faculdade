import java.io.Serializable;
import java.util.ArrayList;

public class Mago  implements Serializable {
    private String nome;
    private int nivel;
    private final ArrayList<String> skills = new ArrayList<>();

    public Mago(String nome) {
        this.nome = nome;
        this.nivel = 1;
        this.skills.add("Ataque Básico");
    }

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }
    public int getNivel() {
        return nivel;
    }
    public void upparNivel() {
        this.nivel++;
    }
    public ArrayList<String> getSkills() {
        return skills;
    }
    public void addSkill(String skill) {
        this.skills.add(skill);
    }
}
