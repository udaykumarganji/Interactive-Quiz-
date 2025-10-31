// ========================================
// Quiz App JavaScript - ApexPlanet Task-3
// Features: Timer, Sound Effects, localStorage, Animations, Review
// ========================================

class QuizApp {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.userAnswers = [];
        this.questionTimes = [];
        this.startTime = null;
        this.timer = null;
        this.timeLeft = 10;
        this.bestScore = parseInt(localStorage.getItem('quizBestScore')) || 0;
        
        this.questions = [
            {
                question: "What does HTML stand for?",
                options: [
                    "Hypertext Markup Language",
                    "High Tech Modern Language", 
                    "Home Tool Markup Language",
                    "Hyperlink and Text Markup Language"
                ],
                correct: 0,
                explanation: "HTML stands for Hypertext Markup Language, the standard markup language for creating web pages."
            },
            {
                question: "Which CSS property is used to change the text color of an element?",
                options: [
                    "font-color",
                    "text-color",
                    "color",
                    "font-style"
                ],
                correct: 2,
                explanation: "The 'color' property is used to set the text color of an element in CSS."
            },
            {
                question: "What is the correct way to write a JavaScript function?",
                options: [
                    "function myFunction()",
                    "func myFunction()",
                    "def myFunction()",
                    "function = myFunction()"
                ],
                correct: 0,
                explanation: "In JavaScript, functions are declared using the 'function' keyword followed by the function name and parentheses."
            },
            {
                question: "Which HTML tag is used to create a hyperlink?",
                options: [
                    "<link>",
                    "<href>",
                    "<a>",
                    "<url>"
                ],
                correct: 2,
                explanation: "The <a> (anchor) tag is used to create hyperlinks in HTML."
            },
            {
                question: "What does CSS stand for?",
                options: [
                    "Creative Style Sheets",
                    "Cascading Style Sheets",
                    "Computer Style Sheets",
                    "Colorful Style Sheets"
                ],
                correct: 1,
                explanation: "CSS stands for Cascading Style Sheets, used for styling HTML elements."
            },
            {
                question: "Which JavaScript method is used to parse a string to an integer?",
                options: [
                    "parseInt()",
                    "parseInteger()",
                    "toInteger()",
                    "convertInt()"
                ],
                correct: 0,
                explanation: "The parseInt() function parses a string and returns an integer."
            },
            {
                question: "What is the correct HTML element for the largest heading?",
                options: [
                    "<heading>",
                    "<h1>",
                    "<h6>",
                    "<header>"
                ],
                correct: 1,
                explanation: "The <h1> tag represents the largest heading in HTML, with headings ranging from h1 to h6."
            },
            {
                question: "Which CSS property controls the space between lines of text?",
                options: [
                    "line-height",
                    "text-spacing",
                    "line-spacing",
                    "text-height"
                ],
                correct: 0,
                explanation: "The line-height property controls the space between lines of text."
            },
            {
                question: "What is the result of 2 + '2' in JavaScript?",
                options: [
                    "4",
                    "'22'",
                    "NaN",
                    "Error"
                ],
                correct: 1,
                explanation: "In JavaScript, the + operator concatenates strings, so 2 + '2' results in '22'."
            },
            {
                question: "Which attribute is used to provide alternative text for an image?",
                options: [
                    "title",
                    "src",
                    "alt",
                    "longdesc"
                ],
                correct: 2,
                explanation: "The 'alt' attribute provides alternative text for images, important for accessibility."
            }
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateBestScore();
        this.showScreen('welcome-screen');
    }
    
    bindEvents() {
        // Welcome screen
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        
        // Quiz screen
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        
        // Results screen
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        document.getElementById('review-btn').addEventListener('click', () => this.showReview());
        
        // Review screen
        document.getElementById('back-to-results').addEventListener('click', () => this.showScreen('results-screen'));
        
        // Options click handlers (delegated)
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.handleOptionSelect(e.target);
            }
        });
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        document.getElementById(screenId).classList.add('active');
        
        // Add entrance animations
        if (screenId === 'quiz-screen') {
            this.animateQuestionEntry();
        }
    }
    
    startQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.userAnswers = [];
        this.questionTimes = [];
        this.startTime = Date.now();
        
        this.updateProgress();
        this.displayQuestion();
        this.showScreen('quiz-screen');
        this.startTimer();
    }
    
    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        
        document.getElementById('question-number').textContent = this.currentQuestion + 1;
        document.getElementById('question-text').textContent = question.question;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option fade-in';
            optionDiv.style.animationDelay = `${index * 0.1}s`;
            
            optionDiv.innerHTML = `
                <input type="radio" id="option${index}" name="question" value="${index}">
                <label for="option${index}">
                    <span class="option-label">${option}</span>
                </label>
            `;
            
            optionsContainer.appendChild(optionDiv);
        });
        
        document.getElementById('next-btn').disabled = true;
        this.timeLeft = 10;
        this.updateTimer();
    }
    
    handleOptionSelect(selectedOption) {
        const nextBtn = document.getElementById('next-btn');
        nextBtn.disabled = false;
        
        // Add visual feedback
        const options = document.querySelectorAll('.option label');
        options.forEach(option => {
            option.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        selectedOption.nextElementSibling.style.borderColor = 'var(--primary)';
        
        // Auto-advance after selection (with slight delay for visual feedback)
        setTimeout(() => {
            this.answerQuestion(parseInt(selectedOption.value));
        }, 500);
    }
    
    answerQuestion(selectedAnswer) {
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedAnswer === question.correct;
        
        // Record answer
        this.userAnswers[this.currentQuestion] = {
            selected: selectedAnswer,
            correct: question.correct,
            isCorrect: isCorrect
        };
        
        this.questionTimes[this.currentQuestion] = 10 - this.timeLeft;
        
        if (isCorrect) {
            this.score++;
            this.playSound('correct');
            this.showFeedback(true);
        } else {
            this.playSound('wrong');
            this.showFeedback(false);
        }
        
        this.updateScore();
        this.clearTimer();
        
        // Show next button after feedback
        setTimeout(() => {
            document.getElementById('next-btn').disabled = false;
            document.getElementById('next-btn').focus();
        }, 1500);
    }
    
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.updateProgress();
            this.displayQuestion();
            this.startTimer();
        } else {
            this.showResults();
        }
    }
    
    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
    }
    
    updateScore() {
        document.getElementById('current-score').textContent = this.score;
    }
    
    startTimer() {
        this.timeLeft = 10;
        this.updateTimer();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    updateTimer() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timeLeft;
        
        // Add warning animations
        timerElement.classList.remove('timer-warning', 'timer-critical');
        
        if (this.timeLeft <= 3 && this.timeLeft > 1) {
            timerElement.classList.add('timer-warning');
        } else if (this.timeLeft <= 1) {
            timerElement.classList.add('timer-critical');
        }
    }
    
    timeUp() {
        this.clearTimer();
        
        // Record timeout as incorrect answer
        this.userAnswers[this.currentQuestion] = {
            selected: -1,
            correct: this.questions[this.currentQuestion].correct,
            isCorrect: false
        };
        
        this.questionTimes[this.currentQuestion] = 10;
        this.showFeedback(false, true);
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    showFeedback(isCorrect, isTimeout = false) {
        const options = document.querySelectorAll('.option label');
        const question = this.questions[this.currentQuestion];
        
        // Reset all options
        options.forEach(option => {
            option.style.background = 'rgba(255, 255, 255, 0.05)';
            option.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Show correct answer
        options[question.correct].style.background = 'rgba(16, 185, 129, 0.2)';
        options[question.correct].style.borderColor = 'var(--success)';
        
        // Show incorrect answer if not timeout
        if (!isTimeout && this.userAnswers[this.currentQuestion].selected !== -1) {
            options[this.userAnswers[this.currentQuestion].selected].style.background = 'rgba(239, 68, 68, 0.2)';
            options[this.userAnswers[this.currentQuestion].selected].style.borderColor = 'var(--error)';
        }
    }
    
    showResults() {
        this.showScreen('results-screen');
        this.updateResultsScreen();
        this.updateBestScore();
        this.playSound('complete');
    }
    
    updateResultsScreen() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const avgTime = this.questionTimes.reduce((a, b) => a + b, 0) / this.questions.length;
        
        // Update score display
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('correct-count').textContent = this.score;
        document.getElementById('incorrect-count').textContent = this.questions.length - this.score;
        document.getElementById('avg-time').textContent = `${avgTime.toFixed(1)}s`;
        
        // Performance message
        const messageElement = document.getElementById('performance-msg').firstElementChild;
        messageElement.className = ''; // Reset classes
        
        if (percentage >= 90) {
            messageElement.className = 'excellent';
            messageElement.textContent = '🏆 Outstanding! You\'re a quiz master!';
        } else if (percentage >= 70) {
            messageElement.className = 'good';
            messageElement.textContent = '🎉 Great job! You really know your stuff!';
        } else {
            messageElement.className = 'needs-improvement';
            messageElement.textContent = '💪 Keep practicing! You\'ll get better!';
        }
        
        // Achievements
        this.showAchievements(percentage, avgTime);
        
        // Best score notice
        const bestScoreNotice = document.getElementById('best-score-notice');
        if (this.score > this.bestScore) {
            bestScoreNotice.classList.add('show');
        } else {
            bestScoreNotice.classList.remove('show');
        }
    }
    
    showAchievements(percentage, avgTime) {
        const achievements = document.getElementById('achievements');
        achievements.innerHTML = '';
        
        const unlockedAchievements = [];
        
        if (percentage === 100) {
            unlockedAchievements.push('Perfect Score');
        }
        if (percentage >= 90) {
            unlockedAchievements.push('Quiz Master');
        }
        if (avgTime <= 3) {
            unlockedAchievements.push('Speed Demon');
        }
        if (this.score >= this.questions.length * 0.8) {
            unlockedAchievements.push('Knowledge Expert');
        }
        if (this.score > this.bestScore) {
            unlockedAchievements.push('Personal Best');
        }
        
        if (unlockedAchievements.length > 0) {
            unlockedAchievements.forEach((achievement, index) => {
                const badge = document.createElement('div');
                badge.className = 'achievement';
                badge.style.animationDelay = `${index * 0.2}s`;
                badge.textContent = `🏅 ${achievement}`;
                achievements.appendChild(badge);
            });
        }
    }
    
    updateBestScore() {
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    restartQuiz() {
        this.clearTimer();
        this.showScreen('welcome-screen');
    }
    
    showReview() {
        this.showScreen('review-screen');
        this.displayReview();
    }
    
    displayReview() {
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item slide-up';
            reviewItem.style.animationDelay = `${index * 0.1}s`;
            
            const isCorrect = userAnswer && userAnswer.isCorrect;
            const selectedAnswer = userAnswer ? userAnswer.selected : -1;
            
            reviewItem.innerHTML = `
                <div class="review-question">
                    <strong>Question ${index + 1}:</strong> ${question.question}
                </div>
                <div class="review-options">
                    ${question.options.map((option, optIndex) => {
                        let className = 'review-option';
                        if (optIndex === question.correct) {
                            className += ' correct';
                        } else if (optIndex === selectedAnswer && !isCorrect) {
                            className += ' incorrect selected';
                        } else if (optIndex === selectedAnswer && isCorrect) {
                            className += ' selected';
                        }
                        
                        const indicator = optIndex === question.correct ? '✓' : 
                                        optIndex === selectedAnswer ? '✗' : '';
                        
                        return `<div class="${className}">${option} ${indicator}</div>`;
                    }).join('')}
                </div>
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
            `;
            
            reviewContainer.appendChild(reviewItem);
        });
    }
    
    playSound(type) {
        try {
            const sound = document.getElementById(`${type}-sound`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (error) {
            console.log('Sound playback not available');
        }
    }
    
    animateQuestionEntry() {
        const questionCard = document.querySelector('.question-card');
        questionCard.style.animation = 'none';
        setTimeout(() => {
            questionCard.style.animation = 'slideUp 0.5s ease-out';
        }, 10);
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const currentScreen = document.querySelector('.screen.active');
    
    if (currentScreen && currentScreen.id === 'quiz-screen') {
        if (e.key >= '1' && e.key <= '4') {
            const optionIndex = parseInt(e.key) - 1;
            const option = document.getElementById(`option${optionIndex}`);
            if (option && !option.disabled) {
                option.checked = true;
                option.dispatchEvent(new Event('change'));
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            const nextBtn = document.getElementById('next-btn');
            if (!nextBtn.disabled) {
                nextBtn.click();
            }
        }
    }
});

// Prevent form submission on Enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.type === 'radio') {
        e.preventDefault();
    }
});