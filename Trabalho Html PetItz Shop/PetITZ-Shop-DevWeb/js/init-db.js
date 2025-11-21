require('dotenv').config();
const { Pool } = require('pg');

// Conectar sem especificar banco (para criar o banco)
const adminPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres' // banco padrão
});

async function initDB() {
  try {
    console.log('🔄 Criando banco de dados...');
    
    // Criar banco de dados
    await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'petitz_shop'};`);
    console.log('✅ Banco de dados criado!');
    
    await adminPool.end();

    // Agora conectar ao novo banco
    const appPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'petitz_shop'
    });

    console.log('🔄 Criando tabela de usuários...');
    
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabela usuarios criada!');

    await appPool.query(`
      CREATE INDEX IF NOT EXISTS idx_email ON usuarios(email);
    `);

    console.log('✅ Índice criado!');
    console.log('🎉 Banco de dados inicializado com sucesso!');

    await appPool.end();
    process.exit(0);

  } catch (erro) {
    // Postgres returns SQLSTATE '42P04' when database already exists
    if (erro.code === '42P04' || (erro.message && erro.message.toLowerCase().includes('already exists'))) {
      console.log('ℹ️  Banco de dados já existe. Continuando com criação da tabela...');
      
      const appPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'petitz_shop'
      });

      try {
        await appPool.query(`
          CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ Tabela usuarios pronta!');
        await appPool.end();
        process.exit(0);
      } catch (e) {
        console.error('❌ Erro ao criar tabela:', e.message || e);
        await appPool.end();
        process.exit(1);
      }
    } else {
      console.error('❌ Erro ao inicializar banco:', erro.message || erro);
      process.exit(1);
    }
  }
}

initDB();
