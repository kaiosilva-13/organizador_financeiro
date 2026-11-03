-- Criar a tabela usuario
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cadastrar um usuario 
INSERT INTO usuario (nome, email, senha_hash)
VALUES ('Ana Silva', 'ana@email.com', 'hash_senha_123');

-- Confirmar o cadastro
SELECT * 
FROM usuario 
WHERE email = 'ana@email.com';

-- Verificar data de criacao
SELECT nome, email, criado_em 
FROM usuario 
WHERE email = 'ana@email.com';

-- Atualizar a senha
UPDATE usuario
SET senha_hash = 'novo_hash_senha_redefinida_999'
WHERE email = 'ana@email.com';

-- Confirmar a nova senha 
SELECT id, nome, email, senha_hash, criado_em 
FROM usuario 
WHERE email = 'ana@email.com';
