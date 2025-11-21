require('dotenv').config();
const pool = require('./db');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando dados no banco...\n');
    
    const result = await pool.query('SELECT id, nome, email, data_criacao FROM usuarios ORDER BY id DESC');
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhum usuário cadastrado ainda.');
    } else {
      console.log('✅ Usuários encontrados:\n');
      console.table(result.rows);
    }
    
    await pool.end();
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    process.exit(1);
  }
}

checkDatabase();
