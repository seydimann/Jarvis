# Jarvis
// Initialize variables
const chat = document.getElementById('chat');
const micButton = document.getElementById('micButton');
const statusElement = document.getElementById('status');
let chatModule = null;

// Initialize WebLLM
async function initializeAI() {
    try {
        statusElement.textContent = "Loading AI model (this may take a minute)...";
        
        // Initialize WebLLM
        chatModule = new webLLM.ChatModule();
        
        // Load the model (using a smaller model for faster loading)
        await chatModule.reload("RedPajama-INCITE-Chat-3B-v1-q4f32_1");
        
        statusElement.textContent = "Ready - Click mic to speak";
        micButton.style.display = "flex";
        
        // Initial greeting
        setTimeout(() => {
            addMessage("JARVIS online. How may I assist you today?", 'jarvis');
        }, 500);
        
    } catch (error) {
        console.error("AI initialization failed:", error);
        statusElement.textContent = "Failed to load AI. Refresh to try again.";
    }
}

// Initialize speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript;
    addMessage(userText, 'user');
    await generateResponse(userText);
};

recognition.onend = () => {
    micButton.style.background = '#00ff9d';
};

recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    addMessage("Speech recognition error. Please try again.", 'jarvis');
    micButton.style.background = '#00ff9d';
};

// Button click handler
micButton.onclick = () => {
    if (micButton.style.background === 'rgb(255, 71, 87)') {
        recognition.stop();
        micButton.style.background = '#00ff9d';
    } else {
        recognition.start();
        micButton.style.background = '#ff4757';
    }
};

// Add message to chat
function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}-message`;
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'message jarvis-message';
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Generate AI response
async function generateResponse(userInput) {
    if (!chatModule) {
        addMessage("AI model is still loading. Please wait...", 'jarvis');
        return;
    }
    
    showTypingIndicator();
    
    try {
        // Generate response
        const response = await chatModule.generate(userInput, {
            temperature: 0.7,
            max_gen_len: 150
        });
        
        removeTypingIndicator();
        addMessage(response, 'jarvis');
        speakResponse(response);
        
    } catch (error) {
        console.error("AI generation error:", error);
        removeTypingIndicator();
        addMessage("I encountered an error processing your request.", 'jarvis');
    }
}

// Text-to-speech function
function speakResponse(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Slightly higher pitch for JARVIS-like voice
        speechSynthesis.speak(utterance);
    }
}

// Initialize the app when the model is ready
document.addEventListener('DOMContentLoaded', () => {
    micButton.style.display = "none";
    initializeAI();
});
