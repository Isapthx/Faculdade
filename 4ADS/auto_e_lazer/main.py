from fastapi import FastAPI, HTTPException
from datetime import date
from typing import List, Optional

app = FastAPI(title="Sistema Auto e Lazer - Backend Mock")

PRODUTOS_DB = {}
LOTES_DB = {}
CLIENTES_DB = {}
VENDAS_DB = {}

@app.post("/produtos", status_code = 21)
def cadastrar_produto(id_produto: str, nome: str, marca: str, categoria: str, preco_custo: float, preco_venda: float, quantidade_minima: int):
    if id_produto in PRODUTOS_DB:
        raise HTTPException(status_code=400, detail="Produto já cadastrado.")
    
    PRODUTOS_DB[id_produto] = {
        "nome": nome,
        "marca": marca,
        "categoria": categoria,
        "preco_custo": preco_custo,
        "preco_venda": preco_venda,
        "quantidade_minima": quantidade_minima
    }
    
    return {"mensagem": "Produto cadastrado com sucesso!", "produto": PRODUTOS_DB[id_produto]}

@app.get("/produtos/")
def listar_produtos():
    return PRODUTOS_DB


@app.post("/lotes/", status_code=21)
def adicionar_lote(id_lote: str, id_produto: str, numero_lote: str, quantidade: int, data_validade: date):
    if id_produto not in PRODUTOS_DB:
        raise HTTPException(status_code=404, detail="Produto não encontrado. Cadastre o produto antes de gerar um lote.")
    
    LOTES_DB[id_lote] = {
        "id_produto": id_produto,
        "numero_lote": numero_lote,
        "quantidade": quantidade,
        "data_validade": data_validade # formato AAAA-MM-DD
    }
    return {"mensagem": "Lote registrado com sucesso!", "lote": LOTES_DB[id_lote]}

@app.get("/lotes/")
def listar_lotes():
    return LOTES_DB

@app.post("/clientes/", status_code = 201) 
def cadastrar_cliente(id_cliente: str, nome: str, telefone: str):
    if id_cliente in CLIENTES_DB:
        raise HTTPException(status_code=400, detail="Cliente já cadastrado.")
    
    CLIENTES_DB[id_cliente] = {
        "nome": nome,
        "telefone": telefone
    }

    return {"mensagem": "Cliente cadastrado com sucesso!", "cliente": CLIENTES_DB[id_cliente]}

@app.get("/clientes/")
def listar_clientes():
    return CLIENTES_DB

@app.post("/vendas/", status_code=201)
    def registrar_venda(id_venda: str, id_cliente: str, id_produto: str, quant_venda: int, forma_pagamento: str):
        if id_cliente not in CLIENTES_DB:
            raise HTTPException(status_code=404, detail = "Cliente não encontrado.")
        if id_produto not in PRODUTOS_DB:
            raise HTTPException(status_code=404, detail = "Produto não encontrado.")
        if quant_venda <= 0:
            raise HTTPException(status_code=400, detail = "A quantidade de venda deve ser maior que que zero.")
        
        lotes_disponiveis = [
            {"id_lote": k, **v} for k, v in LOTES_DB.items()
            if v["id_produto"] == id_produto and v["quantidade"] > 0
        ]

        