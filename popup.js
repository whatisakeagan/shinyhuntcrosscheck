document.getElementById('scanButton').addEventListener('click', async () => {
  const listText = document.getElementById('pokemonList').value.trim();
  const userList = listText.split('\n').map(item => item.trim().toLowerCase());

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scanPokemon,
  }, (injectedResults) => {
    const notCapturedPokemon = injectedResults[0].result;
    const notCaptured = userList.filter(name => 
      notCapturedPokemon.includes(name)
    );

    document.getElementById('resultArea').innerText = notCaptured.join('\n');

    const copyButton = document.getElementById('copyButton');
    copyButton.style.display = notCaptured.length ? 'block' : 'none';
    copyButton.onclick = () => {
      navigator.clipboard.writeText(notCaptured.join('\n'));
    };
  });
});

function scanPokemon() {
  const allPokemonDivs = document.querySelectorAll('.pokemon');
  const notCapturedNames = [];

  allPokemonDivs.forEach(div => {
    const notCaptured = !div.classList.contains('captured');
    if (notCaptured) {
      const nameElement = div.querySelector('h4');
      if (nameElement) {
        notCapturedNames.push(nameElement.innerText.trim().toLowerCase());
      }
    }
  });

  return notCapturedNames;
}
