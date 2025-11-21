const API_URL = 'http://localhost:3000';

// Criar modal de loading
function criarLoadingModal() {
    const loadingHTML = `
        <div id="loading-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
                <div class="spinner" style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p style="margin: 0; color: #333; font-size: 16px;">Carregando...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

// Mostrar loading
function mostrarLoading() {
    let modal = document.getElementById('loading-modal');
    if (!modal) {
        criarLoadingModal();
    } else {
        modal.style.display = 'flex';
    }
}

// Ocultar loading
function ocultarLoading() {
    const modal = document.getElementById('loading-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função de cadastro
function cadastrar() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmar").value;

    if (senha !== confirmar) {
        alert("As senhas não conferem!");
        return;
    }

    mostrarLoading();

    fetch(`${API_URL}/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
    })
    .then(r => r.json())
    .then(data => {
        ocultarLoading();
        alert(data.mensagem);
        if (data.sucesso) {
            window.location.href = "login.html";
        }
    })
    .catch(err => {
        ocultarLoading();
        alert("Erro ao cadastrar: " + err);
    });
}

// Função de login
function fazer_login(event) {
    event.preventDefault();
    
    const email = document.querySelector('input[type="email"]').value;
    const senha = document.querySelector('input[type="password"]').value;

    mostrarLoading();

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    })
    .then(r => r.json())
    .then(data => {
        ocultarLoading();
        if (data.sucesso) {
            // Armazenar dados do usuário no localStorage
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = "home.html";
        } else {
            alert(data.mensagem);
        }
    })
    .catch(err => {
        ocultarLoading();
        alert("Erro ao fazer login: " + err);
    });
}

// Função para obter dados do usuário logado
function obterUsuarioLogado() {
    const usuarioJSON = localStorage.getItem('usuario');
    if (usuarioJSON) {
        return JSON.parse(usuarioJSON);
    }
    return null;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('usuario');
    alert("Você foi desconectado!");
    window.location.href = "login.html";
}

// Função para carregar dados na home
function carregarHome() {
    mostrarLoading();
    
    const usuario = obterUsuarioLogado();
    
    setTimeout(() => {
        ocultarLoading();
        
        if (!usuario) {
            // Redirecionar para login se não estiver autenticado
            window.location.href = "login.html";
            return;
        }

        // Exibir nome do usuário
        const usernameSpan = document.querySelector('.username');
        if (usernameSpan) {
            usernameSpan.textContent = usuario.nome;
        }
    }, 1000);
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('home.html')) {
        carregarHome();
    }
});

