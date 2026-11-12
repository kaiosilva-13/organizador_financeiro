-- Categorias padrao do sistema (id_usuario NULO = visiveis para todos os usuarios).
-- A API ja cria essas categorias sozinha ao iniciar e ao listar; este script
-- serve apenas para criar/corrigir manualmente, se preferir. Pode ser executado
-- mais de uma vez (nao duplica).

-- Categorias padrao precisam aceitar id_usuario nulo
ALTER TABLE categoria ALTER COLUMN id_usuario DROP NOT NULL;

-- Reajusta a sequencia do id (evita erro de chave duplicada)
SELECT setval(pg_get_serial_sequence('categoria', 'id'), COALESCE((SELECT MAX(id) FROM categoria), 0) + 1, false);

INSERT INTO categoria (id_usuario, nome, cor)
SELECT NULL, v.nome, v.cor
FROM (VALUES
    ('Salário', '#16A34A'),
    ('Freelance', '#0891B2'),
    ('Moradia', '#2563EB'),
    ('Alimentação', '#EA580C'),
    ('Transporte', '#7C3AED'),
    ('Saúde', '#0D9488'),
    ('Lazer', '#DB2777'),
    ('Educação', '#CA8A04'),
    ('Gastos Fixos', '#030862'),
    ('Outros', '#475569')
) AS v(nome, cor)
WHERE NOT EXISTS (
    SELECT 1 FROM categoria c
    WHERE c.id_usuario IS NULL AND LOWER(c.nome) = LOWER(v.nome)
);

SELECT * FROM categoria WHERE id_usuario IS NULL ORDER BY id;
