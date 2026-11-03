CREATE TABLE IF NOT EXISTS categoria (
    id SERIAL PRIMARY KEY,
    id_usuario INT DEFAULT NULL,
    nome VARCHAR(80) NOT NULL,
    cor VARCHAR(20) DEFAULT NULL,
    CONSTRAINT fk_categoria_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);
