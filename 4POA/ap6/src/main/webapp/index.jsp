<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Cadastro de Mago</title>
</head>
<body>
    <h2>Crie seu Mago</h2>
    
    <form action="cadastrarMago" method="POST">
        <label for="nome">Nome do Mago:</label>
        <input type="text" id="nome" name="nomeMago" required>
        <br><br>

        <label for="nivel">Nível: </label>
        <input type="number" name="nivelInicial" id="nivel" required>
        <br><br>

        <label for="skill">Elemento Inicial:</label>
        <label>Elementos:</label><br>
        <input type="checkbox" name="elementos" value="Fogo"> Fogo<br>
        <input type="checkbox" name="elementos" value="Gelo"> Gelo<br>
        <input type="checkbox" name="elementos" value="Terra"> Terra<br>
        <input type="checkbox" name="elementos" value="Ar"> Ar <br>
        <br><br>
        
        <button type="submit">Invocar Mago</button>
    </form>

    <script src="script.js"></script>
</body>
</html>