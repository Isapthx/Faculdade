<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<html>
<head>
    <title>Mago Criado</title>
</head>
<body>
    <h2>Sucesso! O Mago foi invocado!</h2>
    
    <p><strong>Nome: </strong> ${magoGerado.getNome()}</p>
    <p><strong>Nível: </strong> ${magoGerado.getNivel()}</p>
    <p><strong>Elementos: </strong> ${magoGerado.getElementos()}</p>
    <p><strong>Habilidades: </strong> ${magoGerado.getSkills()}</p>
    
    <br>
    <a href="index.jsp">Criar outro mago</a>
</body>
</html>