-- Criar a tabela movimentacao
CREATE TABLE IF NOT EXISTS movimentacao (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_conta_financeira INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(255),
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comprovante_dados BYTEA DEFAULT NULL,
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_movimentacao_conta FOREIGN KEY (id_conta_financeira) REFERENCES conta_financeira(id) ON DELETE CASCADE,
    CONSTRAINT fk_movimentacao_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE CASCADE
);

-- Adicionar a coluna titulo em bancos que ja possuem a tabela movimentacao
ALTER TABLE movimentacao
ADD COLUMN IF NOT EXISTS titulo VARCHAR(255);

-- Colunas do comprovante (salvo no proprio banco) em bancos que ja possuem a tabela.
-- Veja tambem: "alteracao - comprovante no banco.sql"
ALTER TABLE movimentacao ADD COLUMN IF NOT EXISTS comprovante_dados BYTEA;

-- Registrar uma movimentacao 
INSERT INTO movimentacao (id_usuario, id_conta_financeira, id_categoria, descricao, valor, tipo, url_comprovante)
VALUES (1, 1, 1, 'Compras de Supermercado', 250.00, 'DESPESA', 'https://storage.link/comprovante1.pdf');

-- Confirmar o registro
SELECT * 
FROM movimentacao 
WHERE id_usuario = 1;

-- Validar chave estrangeira inexistente (FK)
-- INSERT INTO movimentacao (id_usuario, id_conta_financeira, id_categoria, descricao, valor, tipo) VALUES (9999, 1, 1, 'Teste FK Invalida', 50.00, 'DESPESA');

-- Validar campo obrigatorio (NOT NULL)
-- INSERT INTO movimentacao (id_usuario, id_conta_financeira, id_categoria, descricao, valor, tipo) VALUES (1, 1, 1, 'Teste Valor Nulo', NULL, 'DESPESA');

-- Atualizar valor e descricao da movimentacao
UPDATE movimentacao
SET valor = 275.50, descricao = 'Compras de Supermercado - Ajuste'
WHERE id = 1;

-- Confirmar atualizacao 
SELECT id, descricao, valor, tipo, data_transacao 
FROM movimentacao 
WHERE id = 1;

-- Listar todas as movimentacoes do usuario 
SELECT * 
FROM movimentacao 
WHERE id_usuario = 1;




