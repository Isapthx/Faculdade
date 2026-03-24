package com.jogo.rpg;

import java.io.Serializable;
import java.util.ArrayList;

public class Mago  implements Serializable {
    private String nome;
    private int nivel;
    private final ArrayList<String> elementos = new ArrayList<>();
    private final ArrayList<String> skills = new ArrayList<>();

    public Mago(String nome, int nivel, String elemento) {
        this.nome = nome;
        this.nivel = nivel;
        this.skills.add("Ataque Básico");
        this.elementos.add(elemento);
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
    public ArrayList<String> getElementos() {
        return elementos;
    }
    public void addElement(String elemento) {
        this.elementos.add(elemento);
    }
}
