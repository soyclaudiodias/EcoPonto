let map, marker;

// Verifica se a geolocalização está disponível
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Cria o mapa centrado na posição do usuário
            const map = L.map('map', {
                center: [latitude, longitude],
                zoom: 16,
                minZoom: 10,
                maxZoom: 19
            });

            // Adiciona a camada do OpenStreetMap
            const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                minZoom: 10,
                maxZoom: 19,
            });
            layer.addTo(map);

            // Adiciona um marcador na posição do usuário
            const marker = L.marker([latitude, longitude]);
            marker.addTo(map);
        },
        function () {
            alert("Não foi possível obter sua localização.");
        }
    );
} else {
    alert("Geolocalização não é suportada pelo seu navegador.");
}

document.addEventListener("DOMContentLoaded", () => {
    // Máscara para WhatsApp
    const phoneInput = document.getElementById('whatsapp');
    IMask(phoneInput, {
        mask: '(00) 00000-0000'
    });

    // Máscara para CEP
    const cepInput = document.getElementById('cep');
    IMask(cepInput, {
        mask: '00000-000'
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll('.items-grid .item');

    items.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
  // Inicialização do mapa
  map = L.map('map').setView([-23.5505, -46.6333], 12); // São Paulo como default

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  marker = L.marker([-23.5505, -46.6333]).addTo(map);

  const cepInput = document.getElementById('cep');
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
});

document.addEventListener('DOMContentLoaded', function () {
  const btnAlterar = document.querySelector('button:nth-of-type(1)');
  const btnDeletar = document.querySelector('button:nth-of-type(2)');

  const confirmModal = document.getElementById('confirm-modal');
  const confirmText = document.getElementById('confirm-text');
  const confirmAction = document.getElementById('confirm-action');
  const cancelAction = document.getElementById('cancel-action');

  const successModal = document.getElementById('success-modal');
  const successMessage = document.getElementById('success-message');

  function showConfirmModal(actionType) {
    confirmText.textContent =
      actionType === 'alterar'
        ? 'Tem certeza que deseja alterar o ponto de coleta?'
        : 'Tem certeza que deseja deletar o ponto de coleta?';

    confirmAction.textContent = actionType === 'alterar' ? 'Alterar' : 'Deletar';
    confirmAction.style.backgroundColor = actionType === 'alterar' ? '#2e7d32' : '#d73030';
    confirmAction.dataset.action = actionType;

    confirmModal.classList.remove('hidden');
  }

  function showSuccessModal(message) {
    successMessage.textContent = message;
    successModal.classList.remove('hidden');
    setTimeout(() => {
      successModal.classList.add('hidden');
    }, 3000);
  }

  btnAlterar.addEventListener('click', () => {
    showConfirmModal('alterar');
  });

  btnDeletar.addEventListener('click', () => {
    showConfirmModal('deletar');
  });

  confirmAction.addEventListener('click', () => {
    const action = confirmAction.dataset.action;
    confirmModal.classList.add('hidden');
    if (action === 'alterar') {
      showSuccessModal('Alterado com sucesso!');
    } else if (action === 'deletar') {
      showSuccessModal('Deletado com sucesso!');
    }
  });

  cancelAction.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
  });
});