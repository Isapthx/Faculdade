public class Principal {
    public static void main(String[] args) {
        Agenda al = new Agenda();

        al.escrita("Isaac", "21964176404");
        al.escrita("Natan", "21974834734");
        
        al.lerTodos();
        al.lerContato("Isaac");
    }
}
