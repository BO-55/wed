document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const elementTypeSelect = document.getElementById('elementType');
    const controlsDiv = document.getElementById('controls');
    const previewArea = document.getElementById('previewArea');
    const cssOutput = document.getElementById('cssOutput');
    const copyButton = document.getElementById('copyButton');
    const themeToggle = document.getElementById('themeToggle');
    const websiteContent = document.getElementById('websiteContent');
    const contentPreview = document.getElementById('contentPreview');

    // Theme handling
    const setTheme = (theme) => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('theme', theme);
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Element configurations
    const elements = {
        button: {
            controls: [
                { label: 'Background Color', type: 'color', id: 'bgColor', default: '#4CAF50' },
                { label: 'Border Radius', type: 'range', id: 'borderRadius', min: 0, max: 30, default: 5 },
                { label: 'Padding', type: 'range', id: 'padding', min: 5, max: 30, default: 10 }
            ],
            preview: () => `<button id="previewButton">Click Me</button>`,
            className: 'button',
            generateCSS: (values) => `
.button {
    background-color: ${values.bgColor};
    color: white;
    padding: ${values.padding}px 20px;
    border: none;
    border-radius: ${values.borderRadius}px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
.button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}`
        },
        card: {
            controls: [
                { label: 'Gradient Color 1', type: 'color', id: 'gradientColor1', default: '#ff6b6b' },
                { label: 'Gradient Color 2', type: 'color', id: 'gradientColor2', default: '#4ecdc4' },
                { label: 'Shadow Blur', type: 'range', id: 'shadowBlur', min: 0, max: 20, default: 10 },
                { label: 'Border Radius', type: 'range', id: 'borderRadius', min: 0, max: 20, default: 10 }
            ],
            preview: () => `<div class="card" id="previewCard">Card Content</div>`,
            className: 'card',
            generateCSS: (values) => `
.card {
    background: linear-gradient(135deg, ${values.gradientColor1}, ${values.gradientColor2});
    box-shadow: 0 4px ${values.shadowBlur}px rgba(0, 0, 0, 0.2);
    border-radius: ${values.borderRadius}px;
    padding: 20px;
}`
        },
        input: {
            controls: [
                { label: 'Border Color', type: 'color', id: 'borderColor', default: '#007BFF' },
                { label: 'Padding', type: 'range', id: 'padding', min: 5, max: 15, default: 8 },
                { label: 'Focus Shadow Spread', type: 'range', id: 'focusShadow', min: 0, max: 10, default: 5 }
            ],
            preview: () => `<input type="text" id="previewInput" placeholder="Type here...">`,
            className: 'input',
            generateCSS: (values) => `
.input {
    border: 2px solid ${values.borderColor};
    padding: ${values.padding}px;
    border-radius: 5px;
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    color: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus {
    border-color: ${values.borderColor};
    box-shadow: 0 0 ${values.focusShadow}px ${values.borderColor};
}`
        },
        badge: {
            controls: [
                { label: 'Background Color', type: 'color', id: 'bgColor', default: '#28a745' },
                { label: 'Text Color', type: 'color', id: 'textColor', default: '#ffffff' },
                { label: 'Corner Radius', type: 'range', id: 'borderRadius', min: 0, max: 20, default: 10 }
            ],
            preview: () => `<span class="badge" id="previewBadge">New</span>`,
            className: 'badge',
            generateCSS: (values) => `
.badge {
    background-color: ${values.bgColor};
    color: ${values.textColor};
    padding: 5px 10px;
    border-radius: ${values.borderRadius}px;
    font-size: 0.9rem;
    display: inline-block;
}`
        }
    };

    // State
    let currentValues = {};
    let currentElementType = 'button';

    // Render controls
    function renderControls(elementType) {
        controlsDiv.innerHTML = '';
        const config = elements[elementType];
        currentValues = {};

        config.controls.forEach(control => {
            const div = document.createElement('div');
            div.className = 'control-group';
            let input;
            if (control.type === 'color') {
                input = `<input type="color" id="${control.id}" value="${control.default}">`;
            } else if (control.type === 'range') {
                input = `<input type="range" id="${control.id}" min="${control.min}" max="${control.max}" value="${control.default}">
                         <span id="${control.id}Value">${control.default}px</span>`;
            }
            div.innerHTML = `<label>${control.label}: ${input}</label>`;
            controlsDiv.appendChild(div);
            currentValues[control.id] = control.default;
        });

        config.controls.forEach(control => {
            const input = document.getElementById(control.id);
            input.addEventListener('input', () => {
                currentValues[control.id] = input.value;
                if (control.type === 'range') {
                    document.getElementById(`${control.id}Value`).textContent = `${input.value}px`;
                }
                updatePreviews(elementType);
            });
        });
    }

    // Apply styles to content preview
    function applyStylesToContent(elementType, content) {
        const config = elements[elementType];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content || websiteContent.value || '<p>Enter content above...</p>';

        // Apply the generated class to matching elements
        const elementsToStyle = tempDiv.querySelectorAll(config.className === 'input' ? 'input[type="text"], input[type="email"], input[type="password"]' : `.${config.className}`);
        elementsToStyle.forEach(el => {
            el.classList.add(config.className);
        });

        // Inject the generated CSS
        const styleEl = document.createElement('style');
        styleEl.textContent = config.generateCSS(currentValues);
        tempDiv.prepend(styleEl);

        return tempDiv.innerHTML;
    }

    // Update both previews
    function updatePreviews(elementType) {
        const config = elements[elementType];
        // Element preview
        previewArea.innerHTML = config.preview();
        const previewElement = previewArea.querySelector(`#preview${elementType.charAt(0).toUpperCase() + elementType.slice(1)}`);

        if (elementType === 'button') {
            previewElement.style.backgroundColor = currentValues.bgColor;
            previewElement.style.borderRadius = `${currentValues.borderRadius}px`;
            previewElement.style.padding = `${currentValues.padding}px 20px`;
            previewElement.style.color = 'white';
            previewElement.style.border = 'none';
            previewElement.style.cursor = 'pointer';
        } else if (elementType === 'card') {
            previewElement.style.background = `linear-gradient(135deg, ${currentValues.gradientColor1}, ${currentValues.gradientColor2})`;
            previewElement.style.boxShadow = `0 4px ${currentValues.shadowBlur}px rgba(0, 0, 0, 0.2)`;
            previewElement.style.borderRadius = `${currentValues.borderRadius}px`;
            previewElement.style.padding = '20px';
        } else if (elementType === 'input') {
            previewElement.style.border = `2px solid ${currentValues.borderColor}`;
            previewElement.style.padding = `${currentValues.padding}px`;
            previewElement.style.borderRadius = '5px';
            previewElement.style.background = 'rgba(255, 255, 255, 0.1)';
            previewElement.style.color = 'inherit';
        } else if (elementType === 'badge') {
            previewElement.style.backgroundColor = currentValues.bgColor;
            previewElement.style.color = currentValues.textColor;
            previewElement.style.borderRadius = `${currentValues.borderRadius}px`;
            previewElement.style.padding = '5px 10px';
        }

        // Content preview
        contentPreview.innerHTML = applyStylesToContent(elementType);

        // CSS output
        cssOutput.textContent = config.generateCSS(currentValues);
    }

    // Copy to clipboard
    copyButton.addEventListener('click', () => {
        const cssText = cssOutput.textContent;
        navigator.clipboard.writeText(cssText).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy CSS';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });

    // Element type change handler
    elementTypeSelect.addEventListener('change', () => {
        currentElementType = elementTypeSelect.value;
        renderControls(currentElementType);
        updatePreviews(currentElementType);
    });

    // Website content input handler
    websiteContent.addEventListener('input', () => {
        updatePreviews(currentElementType);
    });

    // Initialize
    renderControls('button');
    updatePreviews('button');
});
