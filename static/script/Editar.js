let map, marker;

// ============================
// INICIALIZAÇÃO DO MAPA COM LOCALIZAÇÃO DO USUÁRIO
// ============================
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Cria o mapa
      map = L.map('map', {
        center: [latitude, longitude],
        zoom: 16,
        minZoom: 10,
        maxZoom: 19
      });

      // Adiciona o tile layer (OpenStreetMap)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 10,
        maxZoom: 19,
      }).addTo(map);

      // Cria marcador na posição atual
      marker = L.marker([latitude, longitude]).addTo(map);

      // Busca o CEP da localização inicial
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          if (data?.address?.postcode) {
            document.getElementById('cep').value = data.address.postcode;
          }
        })
        .catch(error => console.error("Erro ao buscar CEP:", error));

      // Evento de clique no mapa
      map.on('click', async function (e) {
        const { lat, lng } = e.latlng;

        // Move ou cria marcador
        if (!marker) {
          marker = L.marker([lat, lng]).addTo(map);
        } else {
          marker.setLatLng([lat, lng]);
        }

        // Busca CEP da nova localização
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
          const data = await response.json();

          if (data?.address?.postcode) {
            document.getElementById('cep').value = data.address.postcode;
          } else {
            alert("Não foi possível encontrar o CEP para esta localização.");
          }
        } catch (error) {
          console.error("Erro ao buscar CEP por coordenadas:", error);
          alert("Erro ao tentar obter o CEP.");
        }
      });
    },
    function () {
      alert("Não foi possível obter sua localização. Verifique se o acesso à geolocalização está permitido.");
    }
  );
} else {
  alert("Geolocalização não é suportada pelo seu navegador.");
}

// ============================
// EVENTOS AO CARREGAR A PÁGINA
// ============================
document.addEventListener("DOMContentLoaded", () => {
  // === Máscaras de input ===
  const whatsappInput = document.getElementById("whatsapp");
  const cepInput = document.getElementById("cep");

  if (whatsappInput) {
    IMask(whatsappInput, { mask: '(00) 00000-0000' });
  }

  if (cepInput) {
    IMask(cepInput, { mask: '00000-000' });
  }

  // === Seleção de itens na grid ===
  const items = document.querySelectorAll('.items-grid .item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
    });
  });

  // === Busca endereço ao perder foco do CEP ===
  if (cepInput) {
    cepInput.addEventListener('blur', async () => {
      const cep = cepInput.value.replace(/\D/g, '');
      if (cep.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();

          if (!data.erro) {
            const address = `${data.logradouro}, ${data.localidade}, ${data.uf}`;
            const location = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const geo = await location.json();

            if (geo.length > 0) {
              const { lat, lon } = geo[0];
              map.setView([lat, lon], 16);
              marker.setLatLng([lat, lon]);
            } else {
              alert("Localização não encontrada.");
            }
          } else {
            alert("CEP não encontrado.");
          }
        } catch (err) {
          alert("Erro ao buscar endereço.");
          console.error(err);
        }
      }
    });
  }

  // === Submissão de formulário ===
  const botaoCadastrar = document.querySelector('.button-submit');
  const modal = document.getElementById('success-modal');
  const formData = new FormData();

  if (botaoCadastrar) {
    botaoCadastrar.addEventListener('click', async (event) => {
      event.preventDefault();

      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const whatsapp = document.getElementById("whatsapp").value;
      const cep = document.getElementById("cep").value;
      const complemento = document.getElementById("complemento").value;

      formData.append('nome', nome);
      formData.append('email', email);
      formData.append('whatsapp', whatsapp);
      formData.append('cep', cep);
      formData.append('complemento', complemento);

      if (marker) {
        const latlng = marker.getLatLng();
        formData.append('latitude', latlng.lat);
        formData.append('longitude', latlng.lng);
      }

      const imagemInput = document.getElementById("imagem");
      if (imagemInput?.files.length > 0) {
        formData.append('imagem', imagemInput.files[0]);
      }

      try {
        const response = await fetch('/cadastrar', {
          method: 'POST',
          body: formData,
        });

        const resultado = await response.json();
        console.log("Resposta do servidor:", resultado);

        if (response.ok) {
          modal.classList.remove('hidden');
          setTimeout(() => {
            modal.classList.add('hidden');
          }, 3000);
        } else {
          alert(resultado.erro || "Erro ao cadastrar.");
        }

      } catch (err) {
        console.error("Erro ao enviar dados:", err);
        alert("Falha ao enviar os dados.");
      }
    });
  }

  // === Upload de imagem com pré-visualização ===
  const fileInput = document.getElementById('fileInput');
  const uploadDiv = document.querySelector('.upload');
  const previewImg = document.getElementById('preview');
  const infoText = uploadDiv?.querySelector('p');

  fileInput?.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadDiv.style.backgroundImage = `url('${e.target.result}')`;
        previewImg.style.display = 'none';
        if (infoText) infoText.style.display = 'none';
        uploadDiv.classList.add('sem-borda');
      }
      reader.readAsDataURL(file);
    }
  });

  // ============================
  // HABILITA/DESABILITA HORÁRIOS DE FUNCIONAMENTO POR DIA
  // ============================
  document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name$="_disable"]');

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener("change", function () {
        const dayDiv = checkbox.closest(".dia");
        const inputs = dayDiv.querySelectorAll('input[type="time"]');

        if (checkbox.checked) {
          dayDiv.classList.add("disabled-day");
          inputs.forEach(input => input.disabled = true);
        } else {
          dayDiv.classList.remove("disabled-day");
          inputs.forEach(input => input.disabled = false);
        }
      });
    });
  });

  // ============================
  // FORMULÁRIO - COLETA DE DADOS DOS DIAS E HORÁRIOS
  // ============================
  document.addEventListener("DOMContentLoaded", () => {
    const botaoCadastrar = document.querySelector('.button-submit');
    const modal = document.getElementById('success-modal');
    const formData = new FormData();

    if (botaoCadastrar) {
      botaoCadastrar.addEventListener('click', async (event) => {
        event.preventDefault();

        // Coleta os dados do formulário
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const whatsapp = document.getElementById("whatsapp").value;
        const cep = document.getElementById("cep").value;
        const complemento = document.getElementById("complemento").value;

        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('whatsapp', whatsapp);
        formData.append('cep', cep);
        formData.append('complemento', complemento);

        if (marker) {
          const latlng = marker.getLatLng();
          formData.append('latitude', latlng.lat);
          formData.append('longitude', latlng.lng);
        }

        const imagemInput = document.getElementById("imagem");
        if (imagemInput?.files.length > 0) {
          formData.append('imagem', imagemInput.files[0]);
        }

        // Coleta os horários de funcionamento
        const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        diasSemana.forEach(dia => {
          const checkbox = document.getElementById(`${dia}_disable`);
          const horaInicio = document.getElementById(`${dia}_inicio`).value;
          const horaFim = document.getElementById(`${dia}_fim`).value;

          if (checkbox && !checkbox.checked) {
            if (horaInicio && horaFim) {
              formData.append('dias[]', dia);
              formData.append('hora_inicio[]', horaInicio);
              formData.append('hora_fim[]', horaFim);
            }
          }
        });

        try {
          const response = await fetch('/cadastrar', {
            method: 'POST',
            body: formData,
          });

          const resultado = await response.json();
          console.log("Resposta do servidor:", resultado);

          if (response.ok) {
            modal.classList.remove('hidden');
            setTimeout(() => {
              modal.classList.add('hidden');
            }, 3000);
          } else {
            alert(resultado.erro || "Erro ao cadastrar.");
          }

        } catch (err) {
          console.error("Erro ao enviar dados:", err);
          alert("Falha ao enviar os dados.");
        }
      });
    }
  });

  // === Previne envio do formulário ao pressionar Enter ===
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        input.blur();
      }
    });
  });
});

// ============================
// HABILITA/DESABILITA HORÁRIOS DE FUNCIONAMENTO POR DIA
// ============================
document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll('input[type="checkbox"][name$="_disable"]');

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function () {
      const dayDiv = checkbox.closest(".dia");
      const inputs = dayDiv.querySelectorAll('input[type="time"]');

      if (checkbox.checked) {
        dayDiv.classList.add("disabled-day");
        inputs.forEach(input => input.disabled = true);
      } else {
        dayDiv.classList.remove("disabled-day");
        inputs.forEach(input => input.disabled = false);
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("nome");
  const cardsSection = document.querySelector(".cards");
  const subtitle = document.querySelector(".subtitle");

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD") // separa acentos das letras
      .replace(/[\u0300-\u036f]/g, ""); // remove acentos
  }

  // Função para carregar os pontos de coleta do servidor
  function carregarPontos() {
    fetch('/consultar')
      .then(response => response.json())
      .then(pontos => {
        // Preencher a seção de cards com os pontos
        cardsSection.innerHTML = ''; // Limpar a seção antes de preencher
        let count = 0;
        
        pontos.forEach(ponto => {
          // Criar o HTML do card
          const card = document.createElement('a');
          card.classList.add('card');
          card.href = `/editar/${ponto.id}`; // Passar o ID para edição
          
          const img = document.createElement('img');
          img.src = ponto.imagem ? `/uploads/${ponto.imagem}` : 'assets/default.jpg'; // Ajustar conforme o caminho da imagem
          img.alt = ponto.nome;

          const h2 = document.createElement('h2');
          h2.textContent = ponto.nome;

          const category = document.createElement('p');
          category.classList.add('category');
          category.innerHTML = `<strong>${ponto.categoria}</strong>`;

          const address = document.createElement('p');
          address.classList.add('address');
          address.innerHTML = ponto.endereco;

          card.appendChild(img);
          card.appendChild(h2);
          card.appendChild(category);
          card.appendChild(address);

          cardsSection.appendChild(card);
          count++;
        });

        subtitle.innerHTML = `<strong>${count} ponto${count !== 1 ? "s" : ""}</strong> encontrado${count !== 1 ? "s" : ""}`;
      })
      .catch(error => {
        console.error('Erro ao carregar pontos:', error);
      });
  }

  // Filtrar cards com base na pesquisa
  function filtrarCards() {
    const termo = normalizar(input.value.trim());
    const regex = new RegExp(`\\b${termo}`, "i"); // palavra que começa com o termo
    let count = 0;

    const cards = document.querySelectorAll(".card");

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

  // Carregar pontos ao carregar a página
  carregarPontos();

  input.addEventListener("input", filtrarCards);
});
