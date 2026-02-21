/* ═══════════════════════════════════════════════
   SON OF ANTON — Frontend Logic
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    // DOM Elements
    const codeInput = document.getElementById('code');
    const problemInput = document.getElementById('problem');
    const languageSelect = document.getElementById('language');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const lineNumbers = document.getElementById('lineNumbers');

    // Output sections
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const results = document.getElementById('results');
    const errorState = document.getElementById('errorState');
    const verdictBadge = document.getElementById('verdictBadge');

    // Result elements
    const resultHeader = document.getElementById('resultHeader');
    const verdictIcon = document.getElementById('verdictIcon');
    const verdictTitle = document.getElementById('verdictTitle');
    const verdictHotTake = document.getElementById('verdictHotTake');
    const linesRemoved = document.getElementById('linesRemoved');
    const destructionScore = document.getElementById('destructionScore');
    const linesBefore = document.getElementById('linesBefore');
    const linesAfter = document.getElementById('linesAfter');
    const explanationText = document.getElementById('explanationText');
    const removedList = document.getElementById('removedList');
    const simplifiedCode = document.getElementById('simplifiedCode');
    const copyBtn = document.getElementById('copyBtn');
    const errorMsg = document.getElementById('errorMsg');

    // Loading elements
    const loadingLine1 = document.getElementById('loadingLine1');
    const loadingBar = document.getElementById('loadingBar');

    // ═══ PARTICLES ═══
    function createParticles() {
        const container = document.getElementById('particles');
        const count = 25;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (8 + Math.random() * 15) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.width = (1 + Math.random() * 2) + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);
        }
    }

    // ═══ LINE NUMBERS ═══
    function updateLineNumbers() {
        const lines = codeInput.value.split('\n').length;
        const nums = [];
        for (let i = 1; i <= Math.max(lines, 1); i++) {
            nums.push(i);
        }
        lineNumbers.textContent = nums.join('\n');
    }

    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('scroll', function () {
        lineNumbers.scrollTop = codeInput.scrollTop;
    });

    // ═══ KEYBOARD SHORTCUT ═══
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!analyzeBtn.disabled) {
                analyzeBtn.click();
            }
        }
    });

    // ═══ STATE MANAGEMENT ═══
    function showState(state) {
        emptyState.classList.add('hidden');
        loadingState.classList.add('hidden');
        results.classList.add('hidden');
        errorState.classList.add('hidden');

        if (state === 'empty') emptyState.classList.remove('hidden');
        if (state === 'loading') loadingState.classList.remove('hidden');
        if (state === 'results') results.classList.remove('hidden');
        if (state === 'error') errorState.classList.remove('hidden');
    }

    // ═══ LOADING ANIMATION ═══
    const loadingMessages = [
        'Scanning for bloat...',
        'Targeting unnecessary abstractions...',
        'Calculating destruction potential...',
        'Identifying dead code...',
        'Preparing annihilation sequence...',
        'Compiling elimination report...',
    ];

    let loadingInterval = null;

    function startLoading() {
        showState('loading');
        analyzeBtn.disabled = true;

        let msgIndex = 0;
        let progress = 0;

        const typingEl = loadingLine1.querySelector('.typing');
        typingEl.textContent = '';

        function typeMessage(msg, callback) {
            let charIndex = 0;
            const typeInterval = setInterval(() => {
                if (charIndex < msg.length) {
                    typingEl.textContent += msg[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(callback, 400);
                }
            }, 30);
        }

        function nextMessage() {
            if (msgIndex < loadingMessages.length) {
                typingEl.textContent = '';
                progress = Math.min(90, ((msgIndex + 1) / loadingMessages.length) * 90);
                loadingBar.style.width = progress + '%';
                typeMessage(loadingMessages[msgIndex], () => {
                    msgIndex++;
                    nextMessage();
                });
            }
        }

        nextMessage();
    }

    function stopLoading() {
        loadingBar.style.width = '100%';
        analyzeBtn.disabled = false;
    }

    // ═══ ANIMATE NUMBER ═══
    function animateNumber(el, target, duration = 800) {
        const start = 0;
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(start + (target - start) * eased);
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    // ═══ RENDER RESULTS ═══
    function renderResults(data) {
        stopLoading();
        showState('results');

        const verdict = (data.verdict || 'SIMPLIFY').toUpperCase();
        const verdictClass = 'verdict-' + verdict.toLowerCase();

        // Verdict badge
        verdictBadge.className = 'panel-badge verdict-badge ' + verdictClass;
        verdictBadge.textContent = verdict;

        // Result header
        resultHeader.className = 'result-header ' + verdictClass;

        const icons = {
            DELETE: '🗑️',
            SIMPLIFY: '✂️',
            REFACTOR: '🔧',
            ADD: '➕',
        };
        verdictIcon.textContent = icons[verdict] || '⚡';
        verdictTitle.textContent = data.title || verdict;
        verdictHotTake.textContent = data.hot_take || '';

        // Stats
        const origLines = data.original_lines || 0;
        const resultLines = data.result_lines || 0;
        const removed = origLines - resultLines;
        const destruction = data.destruction_score || 0;

        animateNumber(linesBefore, origLines);
        animateNumber(linesAfter, resultLines);
        animateNumber(linesRemoved, Math.max(0, removed));
        animateNumber(destructionScore, destruction);

        // Color the destruction score
        if (destruction >= 70) {
            destructionScore.style.color = '#ff3333';
            destructionScore.style.textShadow = '0 0 10px rgba(255, 51, 51, 0.5)';
        } else if (destruction >= 40) {
            destructionScore.style.color = '#ff6b35';
            destructionScore.style.textShadow = '0 0 10px rgba(255, 107, 53, 0.5)';
        } else {
            destructionScore.style.color = '';
            destructionScore.style.textShadow = '';
        }

        // Explanation
        explanationText.textContent = data.explanation || 'No explanation provided.';

        // What was removed
        removedList.innerHTML = '';
        if (data.what_was_removed && data.what_was_removed.length > 0) {
            document.getElementById('removedSection').classList.remove('hidden');
            data.what_was_removed.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                removedList.appendChild(li);
            });
        } else {
            document.getElementById('removedSection').classList.add('hidden');
        }

        // Simplified code
        if (data.simplified_code && data.simplified_code.trim()) {
            document.getElementById('codeSection').classList.remove('hidden');
            simplifiedCode.textContent = data.simplified_code;
        } else {
            document.getElementById('codeSection').classList.add('hidden');
        }
    }

    // ═══ SHOW ERROR ═══
    function showError(message) {
        stopLoading();
        showState('error');
        errorMsg.textContent = message;
        verdictBadge.className = 'panel-badge verdict-badge';
        verdictBadge.textContent = 'ERROR';
    }

    // ═══ ANALYZE ═══
    async function analyze() {
        const code = codeInput.value.trim();
        const problem = problemInput.value.trim();
        const language = languageSelect.value;

        if (!code) {
            showError('No code provided. Son of Anton approves of your emptiness, but needs something to delete.');
            return;
        }

        startLoading();

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, problem, language }),
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.error || 'Something went wrong.');
                return;
            }

            renderResults(data);
        } catch (err) {
            showError('Network error: ' + err.message);
        }
    }

    analyzeBtn.addEventListener('click', analyze);

    // ═══ COPY BUTTON ═══
    copyBtn.addEventListener('click', function () {
        const code = simplifiedCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>COPIED!</span>';
            copyBtn.style.borderColor = 'var(--green-300)';
            copyBtn.style.color = 'var(--green-100)';
            setTimeout(() => {
                copyBtn.innerHTML = original;
                copyBtn.style.borderColor = '';
                copyBtn.style.color = '';
            }, 2000);
        });
    });

    // ═══ TAB KEY IN CODE EDITOR ═══
    codeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 2;
            updateLineNumbers();
        }
    });

    // ═══ INIT ═══
    createParticles();
    updateLineNumbers();
})();
