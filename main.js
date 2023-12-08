document.getElementById('generate-btn').addEventListener('click', generatePoem);
document.getElementById('save-btn').addEventListener('click', savePoem);

function generatePoem() {
    fetch('https://poetrydb.org/random')
        .then(response => response.json())
        .then(data => {
            let poem = data[0].lines.join('\n');
            let title = data[0].title;
            let author = data[0].author;

            // Check if the poem is below a certain length
            if (poem.split(' ').length <= 100) { 
                document.getElementById('poem-text').textContent = poem;
                document.getElementById('poem-title').textContent = title;
                document.getElementById('poem-author').textContent = author;
            } else {
                // If the poem is too long, generate a new one
                generatePoem();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function savePoem() {
    // Get the current poem
    const poem = document.getElementById('poem-display').textContent;

    // Save the poem to localStorage
    localStorage.setItem('savedPoem', poem);
}
window.onload = function() {
    // Check localStorage for any saved poems
    const savedPoem = localStorage.getItem('savedPoem');

    // If there's a saved poem, display it in the saved poems area
    if (savedPoem) {
        document.getElementById('saved-poems').textContent = savedPoem;
    }
};