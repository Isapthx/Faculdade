public class Principal {
    public static void main(String[] args) {
        AgendaMagica grimorio = new AgendaMagica();

        grimorio.escrita("Merlin", 9);
        grimorio.escrita("Hermione", 4);
        grimorio.escrita("Harry", 6);
        
        grimorio.lerTodos();

        System.out.println("\n\n");
        grimorio.lerContato("Merlin");
    }
}
