<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Invocação de Mago</title>
    
    <link rel="stylesheet" href="index.css">
</head>
<body>

    <div class="container">
        <h2>📜 Invocar Mago</h2>
        
        <form action="cadastrarMago" method="POST">
            
            <label for="nome">Nome do Mago:</label>
            <input type="text" id="nome" name="nomeMago" placeholder="Ex: Merlin" required>
            
            <label for="nivel">Nível inicial:</label>
            <input type="number" id="nivel" name="nivelInicial" min="0" max="100" value="1" required>
            
            <label>Elementos Mágicos (apenas um inicialmente):</label>
            <div class="checkbox-group">
                <label><input type="checkbox" name="elementos" value="Fogo" class="elemento-chk"> Fogo 🔥</label>
                <label><input type="checkbox" name="elementos" value="Água" class="elemento-chk"> Água 💧</label>
                <label><input type="checkbox" name="elementos" value="Terra" class="elemento-chk"> Terra 🪨</label>
                <label><input type="checkbox" name="elementos" value="Ar" class="elemento-chk"> Ar 🌪️</label>
            </div>
            
            <button type="submit">Realizar Invocação!</button>
            
        </form>
    </div>

    <script src="index.js"></script>

</body>
</html>