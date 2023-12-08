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

    // Save the updated array back to localStorage
    localStorage.setItem('savedPoems', JSON.stringify(savedPoems));
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
    const poem = document.getElementById('daily-poem-text').textContent;
    const title = document.getElementById('daily-poem-title').textContent;
    const author = document.getElementById('daily-poem-author').textContent;

    const savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    const newPoem = { title, poem, author };
    savedPoems.push(newPoem);

    localStorage.setItem('savedPoems', JSON.stringify(savedPoems));

    const formattedPoem = formatPoem(newPoem);
    const poemDiv = document.createElement('div');
    poemDiv.innerHTML = formattedPoem;
    document.getElementById('saved-poems').appendChild(poemDiv);

    poemDiv.querySelector('.remove-btn').addEventListener('click', function() {
        const index = savedPoems.indexOf(newPoem);
        savedPoems.splice(index, 1);
        localStorage.setItem('savedPoems', JSON.stringify(savedPoems));
        poemDiv.remove();
    });
}