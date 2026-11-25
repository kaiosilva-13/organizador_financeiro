CREATE TABLE IF NOT EXISTS controle_compras (
    id SERIAL PRIMARY KEY, 
    id_usuario INT NOT NULL,
    nome_compra varchar(150) not null,
    descricao_compra VARCHAR(255) default NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    valor_pago_acumulado NUMERIC(10, 2) DEFAULT 0.00,
    valor_restante NUMERIC(10, 2) generated always as (valor_total - valor_pago_acumulado) stored,
    data_inicio DATE not NULL,
    data_fim_prevista DATE NOT NULL,
    CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);
