-- Apagar info:

TRUNCATE TABLE
movimentacoes_estoque,
produtos,
categorias,
usuarios
RESTART IDENTITY CASCADE;

-- Apagar tudo:

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;