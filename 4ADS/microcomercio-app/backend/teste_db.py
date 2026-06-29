import psycopg

conn = psycopg.connect(
    "host=localhost dbname=auto_lazer user=postgres password=iepaiepa"
)

print("Conectado!")
conn.close()

# [
#   {
#     "nome": "Glazy 500ml",
#     "descricao": "blablabla",
#     "preco_compra": 17.23,
#     "estoque_atual": 0,
#     "marca_id": 1,
#     "id": 1,
#     "codigo_barras": "10101010101010000011111",
#     "preco_venda": 29.9,
#     "ativo": true,
#     "categoria_id": 1
#   },
#   {
#     "nome": "Glazyy 500ml",
#     "descricao": "Blablabla",
#     "preco_compra": 19.73,
#     "estoque_atual": 0,
#     "marca_id": 1,
#     "id": 2,
#     "codigo_barras": "101000000100111110101010011111000",
#     "preco_venda": 29.9,
#     "ativo": true,
#     "categoria_id": 2
#   },
#   {
#     "nome": "V-Floc 500ml",
#     "descricao": "Blablabla",
#     "preco_compra": 17.43,
#     "estoque_atual": 0,
#     "marca_id": 1,
#     "id": 4,
#     "codigo_barras": "101000001100100111110101010011111000",
#     "preco_venda": 26.9,
#     "ativo": true,
#     "categoria_id": 2
#   },
#   {
#     "nome": "Vexus 500ml",
#     "descricao": "Blablabla",
#     "preco_compra": 18.82,
#     "estoque_atual": 0,
#     "marca_id": 1,
#     "id": 5,
#     "codigo_barras": "1010000011001001110101010011111000",
#     "preco_venda": 29.9,
#     "ativo": true,
#     "categoria_id": 2
#   }
# ]