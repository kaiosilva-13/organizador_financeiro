-- Criar a tabela categoria
CREATE TABLE IF NOT EXISTS categoria (
    id SERIAL PRIMARY KEY,
    id_usuario INT DEFAULT NULL,
    nome VARCHAR(80) NOT NULL,
    cor VARCHAR(20) DEFAULT NULL,
    CONSTRAINT fk_categoria_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Cadastrar uma categoria personalizada do usuario 
INSERT INTO categoria (id_usuario, nome, cor)
VALUES (1, 'Alimentacao', '#FF5733');

-- Cadastrar uma categoria padrao do sistema sem usuario ligado 
INSERT INTO categoria (id_usuario, nome, cor)
VALUES (NULL, 'Outros', '#888888');

-- Confirmar os cadastros 
SELECT * 
FROM categoria 
WHERE id_usuario = 1 OR id_usuario IS NULL;

-- Validar usuario inexistente (FK)
-- INSERT INTO categoria (id_usuario, nome, cor) VALUES (9999, 'Lazer', '#00FF00');

-- Validar campo obrigatorio (NOT NULL)
-- INSERT INTO categoria (id_usuario, nome, cor) VALUES (1, NULL, '#000000');

-- Atualizar nome e cor da categoria 
UPDATE categoria
SET nome = 'Alimentacao & Supermercado', cor = '#E67E22'
WHERE id = 1;

-- Confirmar atualizacao
SELECT id, id_usuario, nome, cor 
FROM categoria 
WHERE id = 1;

-- Listar categorias disponiveis para o usuario 
SELECT * 
FROM categoria 
WHERE id_usuario = 1 OR id_usuario IS NULL;
