document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("nome");
    const cards = document.querySelectorAll(".card");
    const subtitle = document.querySelector(".subtitle");

    function normalizar(texto) {
      return texto
        .toLowerCase()
        .normalize("NFD") // separa acentos das letras
        .replace(/[\u0300-\u036f]/g, ""); // remove acentos
    }

    function filtrarCards() {
        const termo = normalizar(input.value.trim());
        const regex = new RegExp(`\\b${termo}`, "i"); // palavra que começa com o termo
        let count = 0;
      
        cards.forEach(card => {
          const titulo = normalizar(card.querySelector("h2").textContent);
          const categoria = normalizar(card.querySelector(".category").textContent);
          const endereco = normalizar(card.querySelector(".address").textContent);
      
          const matchTitulo = regex.test(titulo);
          const matchCategoria = regex.test(categoria);
          const matchEndereco = regex.test(endereco);
      
          if (matchTitulo || matchCategoria || matchEndereco) {
            card.style.display = "block";
            count++;
          } else {
            card.style.display = "none";
          }
        });
      
        subtitle.innerHTML = `<strong>${count} ponto${count !== 1 ? "s" : ""}</strong> encontrado${count !== 1 ? "s" : ""}`;
    }         

    input.addEventListener("input", filtrarCards);
  });