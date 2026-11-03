CREATE TABLE IF NOT EXISTS movimentacao (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_conta_financeira INT NOT NULL,
    id_categoria INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url_comprovante VARCHAR(500) DEFAULT NULL,
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_movimentacao_conta FOREIGN KEY (id_conta_financeira) REFERENCES conta_financeira(id) ON DELETE CASCADE,
    CONSTRAINT fk_movimentacao_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE CASCADE
);
