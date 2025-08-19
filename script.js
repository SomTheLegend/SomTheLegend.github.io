AOS.init({
    duration: 800, // Animation duration in milliseconds
    once: true,    // Whether animation should happen only once
});

// --- Sticky Navbar with Glassmorphism ---
const navbar = document.getElementById('navbar');
// Add 'sticky' class to navbar when user scrolls down
window.onscroll = function() {
    if (window.scrollY > 50) {
        navbar.classList.add('sticky');
    } else {
        navbar.classList.remove('sticky');
    }
};

// --- Testimonial Slider ---
const testimonials = document.querySelectorAll('.testimonial');
let currentTestimonial = 0;

// Function to show a specific testimonial
function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('active', i === index);
    });
}

// Function to cycle to the next testimonial
function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}

// Start the testimonial slider if there's more than one
if (testimonials.length > 1) {
    showTestimonial(currentTestimonial); // Show the first one initially
    setInterval(nextTestimonial, 5000); // Change every 5 seconds
}

// --- Contact Form Submission ---
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission
    
    // Create a custom confirmation message box
    const messageBox = document.createElement('div');
    messageBox.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 1rem 2rem; background-color: var(--primary); color: white; border-radius: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 1000;';
    messageBox.innerText = 'Thank you for your message!';
    document.body.appendChild(messageBox);
    
    // Remove the message box after 3 seconds
    setTimeout(() => document.body.removeChild(messageBox), 3000);
    
    contactForm.reset(); // Clear the form fields
});

// --- Gemini API Integration ---
const API_KEY = ""; // This key is handled by the environment, no need to add one here.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

// Get elements for the Project Brainstormer feature
const aiIdeaBtn = document.getElementById('ai-idea-btn');
const aiIdeaInput = document.getElementById('ai-idea-input');
const aiLoader = document.getElementById('ai-loader');
const aiResultsContainer = document.getElementById('ai-results-container');
const aiResults = document.getElementById('ai-results');

// Get elements for the Contact Assistant feature
const contactAiBtn = document.getElementById('contact-ai-btn');
const contactMessage = document.getElementById('contactMessage');
const contactLoader = document.getElementById('contact-loader');

// --- Reusable function to call the Gemini API ---
async function callGemini(prompt) {
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const result = await response.json();
        // Extract the text from the API response
        if (result.candidates && result.candidates.length > 0) {
            return result.candidates[0].content.parts[0].text;
        }
        return "Sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
        console.error("Gemini API call error:", error);
        return "An error occurred while contacting the AI. Please check the console for details.";
    }
}

// --- Event Listener for Project Brainstormer ---
aiIdeaBtn.addEventListener('click', async () => {
    const idea = aiIdeaInput.value.trim();
    if (!idea) {
        aiResults.textContent = "Please enter an idea first.";
        aiResultsContainer.style.display = 'block';
        return;
    }

    // Show loader and disable button during API call
    aiLoader.style.display = 'block';
    aiResultsContainer.style.display = 'none';
    aiIdeaBtn.disabled = true;

    // Create a detailed prompt for the Gemini API
    const prompt = `As a creative tech consultant, brainstorm a project based on this idea: "${idea}".
    Provide a response structured with the following sections:
    - **Concept:** A one-sentence summary of the app.
    - **Key Features:** A bulleted list of 3-5 core features.
    - **Target Audience:** A brief description of the ideal users.
    - **Suggested Tech Stack:** A list of technologies for frontend, backend, and database.
    Keep the tone enthusiastic and professional.`;
    
    const responseText = await callGemini(prompt);
    
    // Display the results and re-enable the button
    aiResults.textContent = responseText;
    aiLoader.style.display = 'none';
    aiResultsContainer.style.display = 'block';
    aiIdeaBtn.disabled = false;
});

// --- Event Listener for Contact Assistant ---
contactAiBtn.addEventListener('click', async () => {
    const message = contactMessage.value.trim();
    if (!message) {
        // A standard alert is used here for simplicity, but could be a custom modal
        alert("Please write a draft of your message first.");
        return;
    }

    // Show loader and disable button
    contactLoader.style.display = 'block';
    contactAiBtn.disabled = true;

    // Create the prompt to help rewrite the user's message
    const prompt = `I am writing to a developer named Som. Here is my rough draft: "${message}".
    Please rewrite this to sound more professional, clear, and friendly. Make sure to keep the original intent.
    The final output should only be the revised message text, without any extra commentary.`;

    const responseText = await callGemini(prompt);

    // Update the textarea with the AI-generated message
    contactMessage.value = responseText;
    contactLoader.style.display = 'none';
    contactAiBtn.disabled = false;
});
