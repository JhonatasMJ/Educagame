const browser = window.matchMedia("(max-width:900px)");
const seta = document.querySelector(".seta");

function animacao() {
  if (
    window.location.pathname === "/index.html" ||
    window.location.pathname === "/"
  ) {
    document.body.classList.add("preloader");

    window.addEventListener("load", function () {
      setTimeout(function () {
        document.body.classList.add("loaded");
        document.body.classList.remove("preloader");

        AOS.init();
      }, 3500);
    });
  }
}

function grafico() {
  var ctx = document.getElementById("investimentoChart").getContext("2d");
  var chart;
  var valorInicial = [20000]; // Valor investido
  var capitalFinalTrimestral = [42871.78]; // Valor a receber

  function createChart(dataInicial, dataFinal) {
    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Valores"], // Um único rótulo no eixo X
        datasets: [
          {
            label: "Valor Investido",
            backgroundColor: "#FFD705", // Cor para o valor investido
            borderWidth: 1,
            data: dataInicial,
          },
          {
            label: "Capital Final",
            backgroundColor: "#FF9A03", // Cor para o valor a receber
            borderWidth: 1,
            data: dataFinal,
          },
        ],
      },
      options: {
        scales: {
          y: {
            display: false, // Remove o eixo Y (números)
          },
          x: {
            display: true,
            ticks: {
              color: "white", // Cor dos rótulos no eixo X
              font: {
                size: 18,
                family: "Titillium Web",
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true, // Exibe a legenda
            labels: {
              color: "white", // Cor dos textos da legenda
              font: {
                size: 18,
                family: "Titillium Web",
              },
            },
          },
        },
      },
    });
  }

  createChart(valorInicial, capitalFinalTrimestral);
}


function mudarSeta() {
  if (browser.matches) {
    seta.setAttribute("src", "./assets/imgs/arrow-bottom.svg");
  }
}

function perguntas() {
  const perguntas = document.querySelectorAll(".js-accordion div dt");
  const arrows = document.querySelectorAll(".icon-arrow");

  function ativarSeta(arrow) {
    arrow.classList.toggle("ativo");
  }

  function ativarPerguntas(event) {
    this.classList.toggle("ativo");
    this.nextElementSibling.classList.toggle("ativo");

    const arrow = this.querySelector(".icon-arrow");
    if (arrow) {
      ativarSeta(arrow);
    }
  }

  perguntas.forEach((item) => {
    item.addEventListener("click", ativarPerguntas);
  });
}

function mobile() {
  // Menu mobile
  const btnMobile = document.getElementById("hamburguer");

  function toggleMenu(event) {
    if (event.type === "touchstart") event.preventDefault();
    const nav = document.getElementById("nav");
    nav.classList.toggle("active");
  }

  btnMobile.addEventListener("click", toggleMenu);
  btnMobile.addEventListener("touchstart", toggleMenu);
}

const botaoTopo = document.querySelector(".botao-topo");

window.onscroll = function () {
  scroll();
};

function scroll() {
  if (
    document.body.scrollTop > 600 ||
    document.documentElement.scrollTop > 600
  ) {
    botaoTopo.classList.add("ativo");
  } else {
    botaoTopo.classList.remove("ativo");
  }
}

function subirTopo() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function scrollSuave() {
  const linksInternos = document.querySelectorAll('.header-menu a[href^="#"]');

  function scrollToSection(event) {
    event.preventDefault(); //Tira o padrão dos links que é levar para a seção
    const href = event.currentTarget.getAttribute("href");
    const section = document.querySelector(href); //Pegando a seção conforme clico no link, com o codigo de cima

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  linksInternos.forEach((link) => {
    link.addEventListener("click", scrollToSection);
  });
}

scrollSuave();
mudarSeta();
grafico();
perguntas();
mobile();
animacao();
