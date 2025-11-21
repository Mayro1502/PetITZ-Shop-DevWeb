require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// servir arquivos estáticos (HTML/CSS/JS) da pasta pai do diretório `js`
app.use(express.static(path.join(__dirname, '..')));

// rota para cadastro ------------------------
app.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    // validações simples
    if (!nome || !email || !senha) {
        return res.json({ sucesso: false, mensagem: "Preencha todos os campos!" });
    }

    try {
        // verificar se já existe e-mail cadastrado
        const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (existe.rows.length > 0) {
            return res.json({ sucesso: false, mensagem: "Email já cadastrado!" });
        }

        // salvar no banco de dados
        const resultado = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
            [nome, email, senha]
        );

        return res.json({ 
            sucesso: true, 
            mensagem: "Cadastro realizado com sucesso!",
            usuario: resultado.rows[0]
        });
    } catch (erro) {
        console.error('Erro ao cadastrar:', erro);
        return res.json({ sucesso: false, mensagem: "Erro ao cadastrar. Tente novamente." });
    }
});

// rota simples de login (verifica contra banco de dados)
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.json({ sucesso: false, mensagem: 'Preencha todos os campos!' });
    }

    try {
        const resultado = await pool.query(
            'SELECT id, nome, email FROM usuarios WHERE email = $1 AND senha = $2',
            [email, senha]
        );

        if (resultado.rows.length === 0) {
            return res.json({ sucesso: false, mensagem: 'Credenciais inválidas' });
        }

        const user = resultado.rows[0];
        return res.json({ 
            sucesso: true, 
            mensagem: 'Login efetuado', 
            usuario: { id: user.id, nome: user.nome, email: user.email } 
        });
    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        return res.json({ sucesso: false, mensagem: "Erro ao fazer login. Tente novamente." });
    }
});

// rota para verificar sessão (retorna dados do usuário armazenado no cliente)
app.get('/me', (req, res) => {
    const token = req.query.token || req.headers['authorization'];
    
    if (!token) {
        return res.json({ sucesso: false, mensagem: 'Não autenticado' });
    }

    // Aqui você pode decodificar o token se usar JWT no futuro
    // Por enquanto, vamos aceitar qualquer token válido
    return res.json({ sucesso: true, mensagem: 'Autenticado' });
});

// iniciar servidor
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
