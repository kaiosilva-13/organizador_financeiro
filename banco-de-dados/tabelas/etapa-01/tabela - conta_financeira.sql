-- Criar a tabela conta_financeira
CREATE TABLE IF NOT EXISTS conta_financeira (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome_conta VARCHAR(100) NOT NULL,
    tipo_conta VARCHAR(50) NOT NULL,
    saldo_atual NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_conta_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Cadastrar uma conta
INSERT INTO conta_financeira (id_usuario, nome_conta, tipo_conta, saldo_atual)
VALUES (1, 'Conta Corrente Principal', 'Corrente', 1500.50);

-- Confirmar o cadastro
SELECT * 
FROM conta_financeira 
WHERE id_usuario = 1;

-- Validar usuario inexistente
-- INSERT INTO conta_financeira (id_usuario, nome_conta, tipo_conta, saldo_atual) VALUES (9999, 'Carteira', 'Dinheiro', 50.00);

-- Validar campo obrigatorio (NOT NULL)
-- INSERT INTO conta_financeira (id_usuario, nome_conta, tipo_conta, saldo_atual) VALUES (1, NULL, 'Poupanca', 100.00);

-- Atualizar o saldo da conta
UPDATE conta_financeira
SET saldo_atual = 2000.00
WHERE id = 1;

-- Confirmar atualizacao do saldo
SELECT id, nome_conta, tipo_conta, saldo_atual 
FROM conta_financeira 
WHERE id = 1;

-- Listar contas do usuario
SELECT * 
FROM conta_financeira 
WHERE id_usuario = 1;
