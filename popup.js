// When the "Scan Now" button is clicked...
document.getElementById('scanButton').addEventListener('click', async () => {
  // Get the user input (list of Pokémon names)
  const listText = document.getElementById('pokemonList').value.trim();

  // Split input into an array of lowercase Pokémon names
  const userList = listText.split('\n').map(item => item.trim().toLowerCase());

  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject the `scanPokemon` function into the page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scanPokemon,
  }, (injectedResults) => {
    // Get names of Pokémon that are not captured on the page
    const notCapturedPokemon = injectedResults[0].result;

    // Filter user list to only include Pokémon still uncaptured
    const notCaptured = userList.filter(name =>
      notCapturedPokemon.includes(name)
    );

    // Format the results to Title Case before displaying
    const formatted = notCaptured.map(toTitleCase).join('\n');
    document.getElementById('resultArea').innerText = formatted;

    // Show the copy button if there's anything to copy
    const copyButton = document.getElementById('copyButton');
    copyButton.style.display = notCaptured.length ? 'block' : 'none';

    // Copy results to clipboard when the button is clicked
    copyButton.onclick = () => {
      navigator.clipboard.writeText(formatted);
    };
  });
});

// This function runs in the context of the page.
// It checks for Pokémon divs that are not marked as "captured"
function scanPokemon() {
  const allPokemonDivs = document.querySelectorAll('.pokemon');
  const notCapturedNames = [];

  allPokemonDivs.forEach(div => {
    const notCaptured = !div.classList.contains('captured');
    if (notCaptured) {
      const nameElement = div.querySelector('h4');
      if (nameElement) {
        // Add the name to the list (lowercased for matching)
        notCapturedNames.push(nameElement.innerText.trim().toLowerCase());
      }
    }
  });

  return notCapturedNames;
}

// Converts a string to Title Case (e.g., "mr. mime" → "Mr. Mime")
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}
