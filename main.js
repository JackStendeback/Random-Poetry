document.getElementById('generate-btn').addEventListener('click', generatePoem);
document.getElementById('save-btn').addEventListener('click', savePoem);

function generatePoem() {
    fetch('https://poetrydb.org/random')
        .then(response => response.json())
        .then(data => {
            let poem = data[0].lines.join('\n');
            let title = data[0].title;
            let author = data[0].author;

            // * Check if the poem is below a certain length
            if (poem.split(' ').length <= 100) { 
                document.getElementById('poem-text').textContent = poem;
                document.getElementById('poem-title').textContent = title;
                document.getElementById('poem-author').textContent = author;
            } else {
                // * If the poem is too long, generate a new one
                generatePoem();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function savePoem() {

    // * Get the current poem, title, and author
    const poem = document.getElementById('poem-text').textContent;
    const title = document.getElementById('poem-title').textContent;
    const author = document.getElementById('poem-author').textContent;

    // * Get the existing poems from localStorage
    const savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    // * Add the new poem to the array
    savedPoems.push({ title, author, poem });
}

window.onload = function() {
    // * Check localStorage for any saved poems
    const savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    // * Format each poem and join them into a single string
    const formattedPoems = savedPoems.map(formatPoem).join('');

    // * Display the saved poems
    document.getElementById('saved-poems').innerHTML = formattedPoems;

    // * Generate the daily poem
    generateDailyPoem();
};

function formatPoem(poemObject) {
    return `<div class="poem">
                <h2 class="poem-title">${poemObject.title}</h2>
                <p class="poem-text">${poemObject.poem}</p>
                <p class="poem-author">${poemObject.author}</p>
                <button class="remove-btn">Remove</button>
            </div>`;
}

function generateDailyPoem() {
    const currentDate = new Date().toDateString();
    const lastFetchDate = localStorage.getItem('lastFetchDate');
    const savedPoem = JSON.parse(localStorage.getItem('dailyPoem'));

    if (currentDate === lastFetchDate && savedPoem) {
        document.getElementById('daily-poem-text').textContent = savedPoem.poem;
        document.getElementById('daily-poem-title').textContent = savedPoem.title;
        document.getElementById('daily-poem-author').textContent = savedPoem.author;
    } else {
        fetch('https://poetrydb.org/random/5')  // Fetch 5 poems at once
            .then(response => response.json())
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    let poem = data[i].lines.join('\n');
                    let title = data[i].title;
                    let author = data[i].author;

                    // Check if the poem is below a certain length
                    if (poem.split(' ').length <= 150) {
                        document.getElementById('daily-poem-text').textContent = poem;
                        document.getElementById('daily-poem-title').textContent = title;
                        document.getElementById('daily-poem-author').textContent = author;

                        // Save the current date and poem to localStorage
                        localStorage.setItem('lastFetchDate', currentDate);
                        localStorage.setItem('dailyPoem', JSON.stringify({ title, poem, author }));

                        break;  // Stop checking the rest of the poems
                    }
                }

                // If none of the fetched poems meet the word limit, fetch a new set
                if (document.getElementById('daily-poem-text').textContent === '') {
                    generateDailyPoem();
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function saveDailyPoem() {
    // Get the current daily poem, title, and author
    const dailyPoem = document.getElementById('daily-poem-text').textContent;
    const dailyTitle = document.getElementById('daily-poem-title').textContent;
    const dailyAuthor = document.getElementById('daily-poem-author').textContent;

    // Get the existing poems from localStorage
    const savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    // Add the new poem to the array
    savedPoems.push({ title: dailyTitle, author: dailyAuthor, poem: dailyPoem });

    // Save the updated array to localStorage
    localStorage.setItem('savedPoems', JSON.stringify(savedPoems));
}

document.getElementById('save-daily-btn').addEventListener('click', saveDailyPoem);

// Event listener for the remove button
document.getElementById('saved-poems').addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-btn')) {
        removePoem(event.target);
    }
});

// Function to remove a poem
function removePoem(button) {
    const poemElement = button.parentElement;

    // Get the existing poems from localStorage
    const savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    // Remove the poem from the array
    const poemIndex = savedPoems.findIndex(poem => poem.title === poemElement.querySelector('.poem-title').textContent);
    savedPoems.splice(poemIndex, 1);

    // Save the updated array to localStorage
    localStorage.setItem('savedPoems', JSON.stringify(savedPoems));

    // Remove the poem element from the DOM
    poemElement.remove();
}