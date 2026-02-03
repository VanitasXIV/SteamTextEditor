const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeToggle = document.getElementById('theme-toggle');

// Theme toggle functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load
initTheme();

// Add event listener to theme toggle button
themeToggle.addEventListener('click', toggleTheme);

// Update preview in real-time
editor.addEventListener('input', updatePreview);

function insertTag(tag) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const beforeText = editor.value.substring(0, start);
    const afterText = editor.value.substring(end);
    
    const placeholder = selectedText || 'text';
    const newText = `[${tag}]${placeholder}[/${tag}]`;
    
    editor.value = beforeText + newText + afterText;
    
    // Position cursor
    if (!selectedText) {
        editor.selectionStart = editor.selectionEnd = start + tag.length + 2;
    } else {
        editor.selectionStart = editor.selectionEnd = start + newText.length;
    }
    
    editor.focus();
    updatePreview();
}

function insertHR() {
    const start = editor.selectionStart;
    const beforeText = editor.value.substring(0, start);
    const afterText = editor.value.substring(start);
    
    editor.value = beforeText + '[hr][/hr]\n' + afterText;
    editor.selectionStart = editor.selectionEnd = start + 10;
    editor.focus();
    updatePreview();
}

function insertURL() {
    const url = prompt('Enter the URL (example: store.steampowered.com):');
    if (!url) return;
    
    const text = prompt('Link text:', 'Link');
    if (!text) return;
    
    const start = editor.selectionStart;
    const beforeText = editor.value.substring(0, start);
    const afterText = editor.value.substring(start);
    
    const urlTag = `[url=${url}]${text}[/url]`;
    editor.value = beforeText + urlTag + afterText;
    editor.selectionStart = editor.selectionEnd = start + urlTag.length;
    editor.focus();
    updatePreview();
}

function parseBBCode(text) {
    // Escape HTML
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Process noparse first
    const noparseBlocks = [];
    text = text.replace(/\[noparse\](.*?)\[\/noparse\]/gi, (match, content) => {
        noparseBlocks.push(content);
        return `___NOPARSE_${noparseBlocks.length - 1}___`;
    });
    
    // Headers
    text = text.replace(/\[h1\](.*?)\[\/h1\]/gi, '<h1>$1</h1>');
    text = text.replace(/\[h2\](.*?)\[\/h2\]/gi, '<h2>$1</h2>');
    text = text.replace(/\[h3\](.*?)\[\/h3\]/gi, '<h3>$1</h3>');
    
    // Text formatting
    text = text.replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>');
    text = text.replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>');
    text = text.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');
    text = text.replace(/\[strike\](.*?)\[\/strike\]/gi, '<s>$1</s>');
    
    // Spoiler
    text = text.replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, '<span class="spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');
    
    // HR
    text = text.replace(/\[hr\]\[\/hr\]/gi, '<hr>');
    
    // URLs
    text = text.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '<a href="https://$1" target="_blank">$2</a>');
    
    // Restore noparse blocks
    noparseBlocks.forEach((content, index) => {
        text = text.replace(`___NOPARSE_${index}___`, content);
    });
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function updatePreview() {
    const bbcode = editor.value;
    preview.innerHTML = parseBBCode(bbcode);
}

function clearEditor() {
    if (confirm('Are you sure you want to clear the editor?')) {
        editor.value = '';
        updatePreview();
    }
}

function copyToClipboard() {
    const bbcode = editor.value;
    if (!bbcode) {
        alert('Nothing to copy');
        return;
    }
    
    navigator.clipboard.writeText(bbcode).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Error copying: ' + err);
    });
}

// Initial example text
editor.value = `[h1]My Game Review[/h1]

[h2]Positive Points[/h2]
[b]Stunning graphics:[/b] The visual quality is exceptional.
[b]Solid gameplay:[/b] The controls respond perfectly.

[h2]Negative Points[/h2]
[i]Some minor bugs that need to be fixed.[/i]

[hr][/hr]

[h3]Conclusion[/h3]
A highly recommended game. [spoiler]The ending is incredible[/spoiler]

[url=store.steampowered.com]View on Steam[/url]`;

updatePreview();
