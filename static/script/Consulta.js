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
  
window.onload = function() {
   fetch('/consultar')
     .then(response => response.json())
     .then(data => {
       console.log(data); // Verifique se os dados estão chegando corretamente no console
       const cardsContainer = document.querySelector('.cards');
       cardsContainer.innerHTML = ''; // Limpa qualquer conteúdo existente

       data.forEach(ponto => {
         const card = document.createElement('a');
         card.href = 'Editar.html';
         card.classList.add('card');

         const img = document.createElement('img');
         img.src = `/uploads/${ponto.imagem}`; // Caminho para a imagem
         img.alt = ponto.nome;

         const h2 = document.createElement('h2');
         h2.textContent = ponto.nome;

         const category = document.createElement('p');
         category.classList.add('category');
         category.innerHTML = `<strong>${ponto.categoria}</strong>`;

         const address = document.createElement('p');
         address.classList.add('address');
         address.innerHTML = `${ponto.endereco}`;

         card.appendChild(img);
         card.appendChild(h2);
         card.appendChild(category);
         card.appendChild(address);

         cardsContainer.appendChild(card);
       });
     })
     .catch(error => console.error('Erro ao carregar pontos de coleta:', error));
};

document.addEventListener('DOMContentLoaded', () => {
  const inputNome = document.getElementById('nome');
  const container = document.getElementById('cards-container');
  const totalPontos = document.getElementById('total-pontos');

  fetch('/api/pontos')
    .then(res => res.json())
    .then(pontos => {
      renderizarPontos(pontos);

      inputNome.addEventListener('input', () => {
        const termo = inputNome.value.toLowerCase();
        const filtrados = pontos.filter(p => p.nome.toLowerCase().includes(termo));
        renderizarPontos(filtrados);
      });
    });

  function renderizarPontos(pontos) {
    container.innerHTML = '';
    totalPontos.textContent = `${pontos.length} ponto${pontos.length !== 1 ? 's' : ''} encontrado${pontos.length !== 1 ? 's' : ''}`;
    
    pontos.forEach(ponto => {
      const card = document.createElement('a');
      card.className = 'card';
      card.href = `/editar?id=${ponto.id}`;
      card.innerHTML = `
        <img src="/uploads/${ponto.imagem || 'default.png'}" alt="${ponto.nome}">
        <h2>${ponto.nome}</h2>
        <p class="category"><strong>${ponto.categorias || 'Sem categorias'}</strong></p>
        <p class="address">
          ${ponto.complemento || 'Endereço não informado'}<br>
          CEP: ${ponto.cep || '---'}<br>
          Lat: ${ponto.latitude}, Long: ${ponto.longitude}
        </p>
      `;
      container.appendChild(card);
    });
  }
});
