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

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("nome");
  const cardsContainer = document.querySelector(".cards");
  const subtitle = document.querySelector(".subtitle");

  let todosOsPontos = [];

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function renderizarCards(pontos) {
    cardsContainer.innerHTML = "";

    pontos.forEach(ponto => {
      const card = document.createElement("a");
      card.href = `/editar/${ponto.id}`;
      card.classList.add("card");

      card.innerHTML = `
        <img src="/uploads/${ponto.imagem || 'default.jpg'}" alt="${ponto.nome}">
        <h2>${ponto.nome}</h2>
        <p class="category"><strong>${ponto.categorias || 'Sem categorias'}</strong></p>
        <p class="address">
          Endereço: ${ponto.endereco || ''} -
          ${ponto.complemento || ''}<br>
          CEP: ${ponto.cep || '---'}
        </p>
      `;

      cardsContainer.appendChild(card);
    });

    subtitle.innerHTML = `<strong>${pontos.length} ponto${pontos.length !== 1 ? "s" : ""}</strong> encontrado${pontos.length !== 1 ? "s" : ""}`;
  }

  function filtrar() {
    const termo = normalizar(input.value.trim());

    const filtrados = todosOsPontos.filter(p => {
      const nome = normalizar(p.nome || '');
      const categoria = normalizar(p.categorias || '');
      const endereco = normalizar(p.endereco || '');

      return nome.includes(termo) || categoria.includes(termo) || endereco.includes(termo);
    });

    renderizarCards(filtrados);
  }

  fetch('/api/pontos')  // OU '/consultar', dependendo do seu backend
    .then(res => res.json())
    .then(pontos => {
      todosOsPontos = pontos;
      renderizarCards(pontos);
      input.addEventListener("input", filtrar);
    })
    .catch(error => {
      console.error("Erro ao carregar pontos:", error);
    });
  });

  function renderizarPontos(pontos) {
    container.innerHTML = '';
    totalPontos.textContent = `${pontos.length} ponto${pontos.length !== 1 ? 's' : ''} encontrado${pontos.length !== 1 ? 's' : ''}`;
    
    pontos.forEach(ponto => {
      const card = document.createElement('a');
      card.className = 'card';
      card.href = `/editar/${ponto.id}`;
      card.innerHTML = `
        <img src="/uploads/${ponto.imagem || 'default.jpg'}" alt="${ponto.nome}">
        <h2>${ponto.nome}</h2>
        <p class="category"><strong>${ponto.categorias || 'Sem categorias'}</strong></p>
        <p class="address">
          Endereço: ${ponto.endereco} - 
          ${ponto.complemento || 'Endereço não informado'}<br>
          CEP: ${ponto.cep || '---'}<br>
        </p>
      `;
      container.appendChild(card);
    });
  }
