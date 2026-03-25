<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page isELIgnored="false" %>

<html>
<head>
    <title>Mago Criado</title>
    <link rel="stylesheet" href="resultado.css">
</head>
<body>
    <div class="card">
    <h1>🧙‍♂️ Mago Invocado!</h1>
    
    <div class="atributo">
        <strong>Nome:</strong> <span>${magoGerado.nome}</span>
    </div>
    
    <div class="atributo">
        <strong>Nível:</strong> <span>${magoGerado.nivel}</span>
    </div>
    
    <div class="atributo">
        <strong>Elementos:</strong> <span>${magoGerado.elementos}</span>
    </div>
    
    <div class="atributo">
        <strong>Habilidades:</strong> <span>${magoGerado.skills}</span>
    </div>
    
    <a href="index.jsp" class="voltar-btn">Criar outro mago</a>
</div>
</body>
</html>