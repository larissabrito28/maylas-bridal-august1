// ============================================================
// FIREBASE - IMPORTAÇÕES
// ============================================================
const ADMIN_EMAIL = "larissald021@gmail.com";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ============================================================
// CONFIGURAÇÕES DO FIREBASE (SUBSTITUA PELOS SEUS DADOS)
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyB9V0_Ovvh691bL24sttcZ4cWwZqWAxjPQ",
    authDomain: "maylas-final.firebaseapp.com",
    projectId: "maylas-final",
    storageBucket: "maylas-final.firebasestorage.app",
    messagingSenderId: "852263514737",
    appId: "1:852263514737:web:16dd4b9f77638189fb61d0"
};

// ============================================================
// INICIALIZAR
// ============================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================
// LOADER
// ============================================================

window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("loader").classList.add("loader-hidden");
    }, 1600);
});

// ============================================================
// VARIÁVEIS
// ============================================================

let carrinho = [];
let favoritos = [];
let pedidos = [];
let total = 0;
let frete = 0;
let usuarioAtual = null;
let vestidoModalAtual = null;
let confirmationResult = null; // para login com telefone

// ============================================================
// TOAST (notificações)
// ============================================================

function mostrarToast(mensagem, tipo = "carrinho") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.innerHTML = mensagem;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOut 0.5s forwards";
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 500);
    }, 3000);
}

// ============================================================
// ESTOQUE
// ============================================================

let estoque = {
    "New Moon": 5,
    "Ariel Lace": 3,
    "Aurora Lace": 4,
    "Celestia": 2,
    "Queen Garden": 3,
    "Princess Bride": 5,
    "Angel Bride": 4,
    "Midnight Pearl": 2
};

// ============================================================
// DETALHES DOS VESTIDOS
// ============================================================

const vestidosDetalhes = {
    "New Moon": {
        categoria: "Noiva Celestial",
        preco: 4900,
        descricao: "Vestido etéreo inspirado na lua nova.",
        imagens: ["imagens/vestido1.jpeg", "imagens/vestido1-1.jpeg"]
    },
    "Ariel Lace": {
        categoria: "Sereia da Lua",
        preco: 3500,
        descricao: "Silhueta sereia delicada.",
        imagens: ["imagens/vestido2.jpeg", "imagens/vestido2-2.jpeg"]
    },
    "Aurora Lace": {
        categoria: "Renda Vintage",
        preco: 4500,
        descricao: "Renda clássica e sofisticada.",
        imagens: ["imagens/vestido3.jpeg", "imagens/vestido3-3.jpeg"]
    },
    "Celestia": {
        categoria: "Cisney Rendado",
        preco: 3100,
        descricao: "Modelo leve e refinado.",
        imagens: ["imagens/vestido4.jpeg", "imagens/vestido4-4.jpeg"]
    },
    "Queen Garden": {
        categoria: "Luxo fatal",
        preco: 5800,
        descricao: "Vestido imponente inspirado em jardins reais.",
        imagens: ["imagens/vestido5.jpeg", "imagens/vestido5-5.jpeg"]
    },
    "Princess Bride": {
        categoria: "Romântico Clássico",
        preco: 4700,
        descricao: "Modelo princesa com saia volumosa.",
        imagens: ["imagens/vestido6.jpeg", "imagens/vestido6-6.jpeg"]
    },
    "Angel Bride": {
        categoria: "Anjo floral",
        preco: 4000,
        descricao: "Vestido delicado com inspiração angelical.",
        imagens: ["imagens/vestido7.jpeg", "imagens/vestido7-7.jpeg"]
    },
    "Midnight Pearl": {
        categoria: "Noiva Mística",
        preco: 4500,
        descricao: "Elegância misteriosa inspirada no brilho das pérolas.",
        imagens: ["imagens/vestido8.jpeg", "imagens/vestido8-8.jpeg"]
    }
};

// ============================================================
// SALVAR PEDIDO NO FIRESTORE
// ============================================================

async function salvarPedidoNoFirestore(pedido, totalFinal, freteValor) {
    if (!usuarioAtual) {
        mostrarToast("Faça login para salvar seu pedido ✦", "erro");
        return null;
    }

    try {
        const docRef = await addDoc(collection(db, "pedidos"), {
            usuario: usuarioAtual,
            itens: pedido.map(item => ({ nome: item.nome, preco: item.preco })),
            total: totalFinal,
            frete: freteValor,
            status: "Pendente",
            data: new Date().toISOString()
        });

        mostrarToast(`Pedido salvo com sucesso ✦`, "carrinho");
        return docRef.id;
    } catch (error) {
        console.error("Erro ao salvar pedido:", error);
        mostrarToast("Erro ao salvar pedido.", "erro");
        return null;
    }
}

// ============================================================
// LOGIN - E-mail/Senha
// ============================================================

window.cadastro = function() {
    let email = document.getElementById("email").value.trim();
    let senha = document.getElementById("senha").value.trim();

    createUserWithEmailAndPassword(auth, email, senha)
        .then(() => {
            document.getElementById("mensagemLogin").innerHTML = "Conta criada com sucesso ✦";
            mostrarToast("Conta criada com sucesso ✦", "carrinho");
        })
        .catch((error) => {
            document.getElementById("mensagemLogin").innerHTML = "Erro: " + error.code;
            mostrarToast("Erro: " + error.code, "erro");
        });
}

window.login = function() {
    let email = document.getElementById("email").value.trim();
    let senha = document.getElementById("senha").value.trim();

    signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
            document.getElementById("mensagemLogin").innerHTML = "Conta conectada ✦";
            mostrarToast("Conta conectada ✦", "carrinho");
        })
        .catch((error) => {
            document.getElementById("mensagemLogin").innerHTML = "Erro: " + error.code;
            mostrarToast("Erro: " + error.code, "erro");
        });
}

// ============================================================
// LOGIN - Google
// ============================================================

window.loginGoogle = function() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            document.getElementById("mensagemLogin").innerHTML = `Conectada: ${user.email} ✦`;
            mostrarToast(`Bem-vinda, ${user.displayName || user.email} ✦`, "carrinho");
        })
        .catch((error) => {
            console.error("Erro:", error);
            mostrarToast("Erro ao entrar com Google.", "erro");
        });
}


// ============================================================
// LOGIN - Anônimo
// ============================================================

window.loginAnonimo = function() {
    signInAnonymously(auth)
        .then(() => {
            document.getElementById("mensagemLogin").innerHTML = "Modo anônimo ativado ✦";
            mostrarToast("Você está navegando como convidada ✦", "carrinho");
        })
        .catch((error) => {
            console.error("Erro:", error);
            mostrarToast("Erro ao entrar como convidada.", "erro");
        });
}

// ============================================================
// SAIR
// ============================================================

window.sair = function() {
    signOut(auth).then(() => {
        document.getElementById("mensagemLogin").innerHTML = "Você saiu da conta ✦";
        document.getElementById("perfilEmail").innerHTML = "Entre para ver seu perfil.";
        mostrarToast("Você saiu da conta ✦", "erro");
    });
}

// ============================================================
// ESTADO DE AUTENTICAÇÃO
// ============================================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioAtual = user.email || user.phoneNumber || "Anônimo";
        document.getElementById("mensagemLogin").innerHTML = `Conta conectada: ${usuarioAtual} ✦`;
        document.getElementById("perfilEmail").innerHTML = `Cliente: ${usuarioAtual}`;
        mostrarToast(`Bem-vinda, ${usuarioAtual} ✦`, "carrinho");
        const linkAdmin = document.getElementById("linkAdmin");
        const linkAdminPerfil = document.getElementById("linkAdminPerfil");
        if (user.email === ADMIN_EMAIL) {
            if (linkAdmin) linkAdmin.style.display = "inline";
            if (linkAdminPerfil) linkAdminPerfil.style.display = "inline-block";
        } else {
            if (linkAdmin) linkAdmin.style.display = "none";
            if (linkAdminPerfil) linkAdminPerfil.style.display = "none";
        }

    } else {
        usuarioAtual = null;
        document.getElementById("mensagemLogin").innerHTML = "Nenhuma conta conectada.";
        document.getElementById("perfilEmail").innerHTML = "Entre para ver seu perfil.";
        const linkAdmin = document.getElementById("linkAdmin");
        const linkAdminPerfil = document.getElementById("linkAdminPerfil");
        if (linkAdmin) linkAdmin.style.display = "none";
        if (linkAdminPerfil) linkAdminPerfil.style.display = "none";
    }
});

// ============================================================
// ESTOQUE NA TELA
// ============================================================

function atualizarEstoque() {
    Object.keys(estoque).forEach(nome => {
        let ids = ["estoque-" + nome, "estoque-card-" + nome];
        ids.forEach(id => {
            let elemento = document.getElementById(id);
            if (elemento) {
                if (estoque[nome] > 0) {
                    elemento.innerHTML = `Disponível: ${estoque[nome]} unidade(s)`;
                    elemento.style.color = "#9fe6a0";
                } else {
                    elemento.innerHTML = "Esgotado";
                    elemento.style.color = "#ff8f8f";
                }
            }
        });
    });
}

// ============================================================
// CARRINHO
// ============================================================

window.adicionarCarrinho = function(nome, preco) {
    if (estoque[nome] <= 0) {
        mostrarToast("Este vestido está esgotado ✦", "erro");
        return;
    }

    carrinho.push({ nome: nome, preco: preco });
    total += preco;
    estoque[nome]--;

    atualizarCarrinho();
    atualizarEstoque();
    mostrarToast(`✦ ${nome} foi adicionado ao carrinho!`, "carrinho");
}

function atualizarCarrinho() {
    const lista = document.getElementById("listaCarrinho");
    const totalTexto = document.getElementById("total");

    lista.innerHTML = "";
    carrinho.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = `${item.nome} ✦ R$ ${item.preco.toLocaleString("pt-BR")}`;
        lista.appendChild(li);
    });

    totalTexto.innerHTML = `Total: R$ ${total.toLocaleString("pt-BR")}`;
}

window.esvaziarCarrinho = function() {
    carrinho.forEach(item => { estoque[item.nome]++; });
    carrinho = [];
    total = 0;
    frete = 0;
    atualizarCarrinho();
    atualizarEstoque();
    document.getElementById("resultadoFrete").innerHTML = "";
    mostrarToast("Carrinho esvaziado ✦", "erro");
}

// ============================================================
// FAVORITOS
// ============================================================

window.favoritar = function(nome) {
    if (favoritos.includes(nome)) {
        mostrarToast(`✦ ${nome} já está nos seus favoritos!`, "favorito");
        return;
    }

    favoritos.push(nome);
    atualizarFavoritos();
    mostrarToast(`✦ ${nome} foi adicionado aos favoritos!`, "favorito");
}

function atualizarFavoritos() {
    const area = document.getElementById("listaFavoritos");
    area.innerHTML = "";
    favoritos.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = item + " ✦";
        area.appendChild(li);
    });
}

window.compartilharDesejos = function() {
    if (favoritos.length === 0) {
        mostrarToast("Sua lista de desejos está vazia ✦", "erro");
        return;
    }

    let texto = "Minha lista de desejos Maylas Bridal:%0A%0A";
    favoritos.forEach(item => { texto += `✦ ${item}%0A`; });
    window.open(`https://wa.me/?text=${texto}`, "_blank");
}

// ============================================================
// PEDIDOS
// ============================================================

function atualizarPedidos() {
    const area = document.getElementById("listaPedidos");
    area.innerHTML = "";
    pedidos.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = item;
        area.appendChild(li);
    });
}

// ============================================================
// FRETE
// ============================================================

window.calcularFrete = function() {
    let cep = document.getElementById("cep").value.trim();

    if (cep.length < 8) {
        mostrarToast("Digite um CEP válido.", "erro");
        return;
    }

    let primeiroNumero = cep.charAt(0);
    if (primeiroNumero === "0" || primeiroNumero === "1") {
        frete = 35;
    } else if (primeiroNumero === "2" || primeiroNumero === "3") {
        frete = 45;
    } else {
        frete = 65;
    }

    document.getElementById("resultadoFrete").innerHTML = `Frete: R$ ${frete.toLocaleString("pt-BR")}`;
    mostrarToast(`Frete calculado: R$ ${frete.toLocaleString("pt-BR")} ✦`, "carrinho");
}

// ============================================================
// CHECKOUT
// ============================================================

window.finalizarPedido = function() {
    if (carrinho.length === 0) {
        mostrarToast("Seu pedido está vazio ✦", "erro");
        return;
    }

    const area = document.getElementById("checkoutLista");
    const totalArea = document.getElementById("checkoutTotal");
    const freteArea = document.getElementById("checkoutFrete");

    area.innerHTML = "";
    carrinho.forEach(item => {
        let p = document.createElement("p");
        p.innerHTML = `✦ ${item.nome} — R$ ${item.preco.toLocaleString("pt-BR")}`;
        area.appendChild(p);
    });

    let totalFinal = total + frete;
    totalArea.innerHTML = `Total: R$ ${total.toLocaleString("pt-BR")}`;
    freteArea.innerHTML = `Frete: R$ ${frete.toLocaleString("pt-BR")} | Total final: R$ ${totalFinal.toLocaleString("pt-BR")}`;

    document.getElementById("checkoutModal").style.display = "flex";
}

window.fecharCheckout = function() {
    document.getElementById("checkoutModal").style.display = "none";
}

window.copiarPix = function() {
    let chave = document.getElementById("chavePix").innerText;
    navigator.clipboard.writeText(chave).then(() => {
        mostrarToast("Chave Pix copiada ✦", "carrinho");
    });
}

window.confirmarCheckout = async function() {
    let nome = document.getElementById("nomeCliente").value.trim();
    let totalFinal = total + frete;

    // Salvar no Firestore
    const pedidoId = await salvarPedidoNoFirestore(carrinho, totalFinal, frete);

    if (!pedidoId) {
        mostrarToast("Erro ao salvar pedido.", "erro");
        return;
    }

    // Salvar no histórico local
    pedidos.push(`Pedido ${pedidoId} - R$ ${totalFinal.toLocaleString("pt-BR")}`);
    atualizarPedidos();

    // Mensagem WhatsApp
    let mensagem = "Olá! Vim pelo Maylas Bridal:%0A%0A";
    carrinho.forEach(item => {
        mensagem += `• ${item.nome} - R$ ${item.preco.toLocaleString("pt-BR")}%0A`;
    });
    mensagem += `%0AFrete: R$ ${frete.toLocaleString("pt-BR")}`;
    mensagem += `%0ATotal: R$ ${totalFinal.toLocaleString("pt-BR")}`;
    mensagem += `%0APedido ID: ${pedidoId}`;
    if (nome !== "") mensagem += `%0ACliente: ${nome}`;

    carrinho = [];
    total = 0;
    frete = 0;
    atualizarCarrinho();
    document.getElementById("resultadoFrete").innerHTML = "";
    fecharCheckout();

    window.open(`https://wa.me/5511987595486?text=${mensagem}`, "_blank");
}

// ============================================================
// MODAL DETALHES
// ============================================================

window.abrirDetalhes = function(nome) {
    vestidoModalAtual = nome;
    const vestido = vestidosDetalhes[nome];

    document.getElementById("modalNome").innerHTML = nome;
    document.getElementById("modalCategoria").innerHTML = vestido.categoria;
    document.getElementById("modalPreco").innerHTML = "R$ " + vestido.preco.toLocaleString("pt-BR");
    document.getElementById("modalDescricao").innerHTML = vestido.descricao;
    document.getElementById("modalImagem").src = vestido.imagens[0];
    document.getElementById("modalEstoque").innerHTML =
        estoque[nome] > 0 ? `Disponível: ${estoque[nome]} unidade(s)` : "Esgotado";

    const miniaturas = document.getElementById("miniaturas");
    miniaturas.innerHTML = "";
    vestido.imagens.forEach(imagem => {
        let img = document.createElement("img");
        img.src = imagem;
        img.onclick = function() {
            document.getElementById("modalImagem").src = imagem;
        };
        miniaturas.appendChild(img);
    });

    document.getElementById("modalVestido").style.display = "flex";
}

window.fecharModal = function() {
    document.getElementById("modalVestido").style.display = "none";
}

window.adicionarModalCarrinho = function() {
    const vestido = vestidosDetalhes[vestidoModalAtual];
    adicionarCarrinho(vestidoModalAtual, vestido.preco);
    fecharModal();
}

// ============================================================
// PESQUISA
// ============================================================

const pesquisa = document.getElementById("pesquisa");
pesquisa.addEventListener("keyup", function() {
    let texto = pesquisa.value.toLowerCase();
    let cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        let conteudo = card.innerText.toLowerCase();
        card.style.display = conteudo.includes(texto) ? "block" : "none";
    });
});

// ============================================================
// ANIMAÇÕES
// ============================================================

const elementosAnimados = document.querySelectorAll(".card, .faq-item, .login-box, .carrinho, .favoritos, .historico");

function animarElementos() {
    elementosAnimados.forEach(elemento => {
        const topo = elemento.getBoundingClientRect().top;
        const visivel = window.innerHeight - 80;
        if (topo < visivel) {
            elemento.classList.add("mostrar");
        }
    });
}

window.addEventListener("scroll", animarElementos);
animarElementos();
atualizarEstoque();
// ============================================================
// ALTERNAR ENTRE MÉTODOS DE LOGIN
// ============================================================

window.mostrarMetodo = function(metodo) {
    // Esconder todos os painéis
    document.querySelectorAll('.metodo-painel').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.metodo-btn').forEach(el => el.classList.remove('ativo'));

    // Mostrar o selecionado
    const nomeMetodo = metodo.charAt(0).toUpperCase() + metodo.slice(1);
    const painel = document.getElementById('metodo' + nomeMetodo);
    const botao = document.getElementById('btn' + nomeMetodo);
    
    if (painel) painel.style.display = 'block';
    if (botao) botao.classList.add('ativo');
}

// ============================================================
// CURSOR PREMIUM
// ============================================================

const cursor = document.querySelector(".cursor");
const blur = document.querySelector(".cursor-blur");

document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    blur.style.left = e.clientX + "px";
    blur.style.top = e.clientY + "px";
    // Alternar entre métodos de login
window.mostrarMetodo = function(metodo) {
    // Esconder todos
    document.querySelectorAll('.metodo-painel').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.metodo-btn').forEach(el => el.classList.remove('ativo'));

    // Mostrar o selecionado
    document.getElementById('metodo' + metodo.charAt(0).toUpperCase() + metodo.slice(1)).style.display = 'block';
    document.getElementById('btn' + metodo.charAt(0).toUpperCase() + metodo.slice(1)).classList.add('ativo');
}
});