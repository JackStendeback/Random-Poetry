document.getElementById('generate-btn').addEventListener('click', generatePoem);

function generatePoem() {
    fetch('https://poetrydb.org/random')
        .then(response => response.json())
        .then(data => {
            let poem = data[0].lines.join('\n');
            let title = data[0].title;
            let author = data[0].author;

            if (poem.split(' ').length <= 100) {
                document.getElementById('poem-text').textContent = poem;
                document.getElementById('poem-title').textContent = title;
                document.getElementById('poem-author').textContent = author;
            } else {
                generatePoem();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displaySavedPoems() {
    const savedPoemsContainer = document.getElementById('saved-poems');
    savedPoemsContainer.innerHTML = '';

    const savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    savedPoems.forEach(poem => {
        const poemElement = document.createElement('div');
        poemElement.innerHTML = `
            <h2 class="poem-title">${poem.title}</h2>
            <p class="poem-text">${poem.text}</p>
            <p class="poem-author">${poem.author}</p>
            <button class="remove-btn">Remove Poem</button>
        `;
        savedPoemsContainer.appendChild(poemElement);
    });
}

function savePoem(title, text, author) {
    console.log('savePoem called with:', { title, text, author });
    // Ignore calls with incorrect parameters
    if (typeof title !== 'string' || typeof text !== 'string' || typeof author !== 'string') {
        console.error('savePoem called with incorrect parameters:', { title, text, author });
        return;
    }

    // Get the current list of saved poems from localStorage
    let savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    // Add the new poem to the list
    savedPoems.push({ title, text, author });

    // Save the updated list back to localStorage
    localStorage.setItem('savedPoems', JSON.stringify(savedPoems));
}

document.getElementById('save-btn').addEventListener('click', () => {
    // Get the current poem's title, text, and author
    let title = document.getElementById('poem-title').innerText;
    let text = document.getElementById('poem-text').innerText;
    let author = document.getElementById('poem-author').innerText;

    // Save the current poem
    savePoem(title, text, author);
});

let saveDailyBtn = document.getElementById('save-daily-btn');

// Remove all previous event listeners for saveDailyBtn
let newSaveDailyBtn = saveDailyBtn.cloneNode(true);
saveDailyBtn.parentNode.replaceChild(newSaveDailyBtn, saveDailyBtn);

// Attach the new event listener for the cloned button
newSaveDailyBtn.addEventListener('click', saveDailyPoem);

// Only keep one event listener for the save-daily-btn, remove the additional one if present
let isSaveDailyPoemListenerAttached = false;

if (!isSaveDailyPoemListenerAttached) {
    document.getElementById('save-daily-btn').addEventListener('click', saveDailyPoem);
    isSaveDailyPoemListenerAttached = true;
}

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.dataset.tab;

        // Remove the 'active' class from all tabs and hide all sections
        document.querySelectorAll('.tab-btn, .tab-content').forEach(element => {
            element.classList.remove('active');
        });

        // Add the 'active' class to the clicked tab and show the corresponding section
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');

        // If the "Saved Poems" tab was clicked, display the saved poems
        if (tabId === 'saved-poems') {
            displaySavedPoems();
        }
    });
});

window.onload = function () {
    document.querySelector('[data-tab="daily-poem"]').click();

    // Check localStorage for any saved poems
    const savedPoems = JSON.parse(localStorage.getItem('savedPoems')) || [];

    // Format each poem and join them into a single string
    const formattedPoems = savedPoems.map(formatPoem).join('');

    // Display the saved poems
    document.getElementById('saved-poems').innerHTML = formattedPoems;

    // Generate the daily poem
    generateDailyPoem();
};

function formatPoem(poemObject) {
    return `<div class="poem">
                <h2 class="poem-title">${poemObject.title}</h2>
                <p class="poem-text">${poemObject.text}</p>
                <p class="poem-author">${poemObject.author}</p>
                <button class="remove-btn">Remove</button>
            </div>`;
}

function generateDailyPoem() {
    const currentDate = new Date().toDateString();
    const lastFetchDate = localStorage.getItem('lastFetchDate');
    const savedPoem = JSON.parse(localStorage.getItem('dailyPoem'));

    if (currentDate === lastFetchDate && savedPoem) {
        document.getElementById('daily-poem-text').textContent = savedPoem.text;
        document.getElementById('daily-poem-title').textContent = savedPoem.title;
        document.getElementById('daily-poem-author').textContent = savedPoem.author;
    } else {
        fetch('https://poetrydb.org/random/5') // Fetch 5 poems at once
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
                        localStorage.setItem('dailyPoem', JSON.stringify({ title, text: poem, author }));

                        break; // Stop checking the rest of the poems
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
    // Get the current poem's title, text, and author
    let title = document.getElementById('daily-poem-title').innerText;
    let text = document.getElementById('daily-poem-text').innerText;
    let author = document.getElementById('daily-poem-author').innerText;

    console.log('Saving daily poem:', { title, text, author });

    // Save the current poem
    savePoem(title, text, author);
}

document.getElementById('save-daily-btn').addEventListener('click', saveDailyPoem);

// Event listener for the remove button
document.getElementById('saved-poems').addEventListener('click', function (event) {
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

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.dataset.tab;

        // Remove the 'active' class from all tabs and hide all sections
        document.querySelectorAll('.tab-btn, .tab-content').forEach(element => {
            element.classList.remove('active');
        });

        // Add the 'active' class to the clicked tab and show the corresponding section
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});
