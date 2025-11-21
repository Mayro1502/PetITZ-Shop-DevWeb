-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS petitz_shop;

-- Conectar ao banco
\c petitz_shop

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para buscas rápidas por email
CREATE INDEX IF NOT EXISTS idx_email ON usuarios(email);
