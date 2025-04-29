document.getElementById('scanButton').addEventListener('click', async () => {
  const listText = document.getElementById('pokemonList').value.trim();
  const userList = listText.split('\n').map(item => item.trim().toLowerCase());

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scanPokemon,
  }, (injectedResults) => {
    const pageCapturedPokemon = injectedResults[0].result;
    const notCaptured = userList.filter(name => 
      !pageCapturedPokemon.includes(name)
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
  const capturedNames = [];

  allPokemonDivs.forEach(div => {
    const isCaptured = div.classList.contains('captured');
    if (isCaptured) {
      const nameElement = div.querySelector('h4');
      if (nameElement) {
        capturedNames.push(nameElement.innerText.trim().toLowerCase());
      }
    }
  });

  return capturedNames;
}