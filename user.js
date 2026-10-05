/* =========================================================
   QUIZ BUILDER - USER JAVASCRIPT
   ========================================================= */

const defaultQuizzes = [
    {
        id: 1,
        title: "JavaScript Basics",
        description: "Test your knowledge of JavaScript fundamentals.",
        category: "Programming",
        difficulty: "Easy",
        time: 60,
        icon: "💻",
        creator: "Admin",
        plays: 245,
        questions: [
            {
                type: "mcq",
                question: "Which keyword is used to declare a variable in JavaScript?",
                options: ["var", "int", "string", "define"],
                answer: "var"
            },
            {
                type: "mcq",
                question: "Which symbol is used for comments in JavaScript?",
                options: ["//", "#", "<!--", "**"],
                answer: "//"
            },
            {
                type: "truefalse",
                question: "JavaScript is a programming language.",
                options: ["True", "False"],
                answer: "True"
            }
        ]
    },

    {
        id: 2,
        title: "General Science",
        description: "Challenge yourself with basic science questions.",
        category: "Science",
        difficulty: "Medium",
        time: 60,
        icon: "🔬",
        creator: "Admin",
        plays: 312,
        questions: [
            {
                type: "mcq",
                question: "What is the chemical symbol for water?",
                options: ["CO2", "H2O", "O2", "NaCl"],
                answer: "H2O"
            },
            {
                type: "mcq",
                question: "Which planet is known as the Red Planet?",
                options: ["Earth", "Mars", "Venus", "Jupiter"],
                answer: "Mars"
            },
            {
                type: "truefalse",
                question: "The Sun is a star.",
                options: ["True", "False"],
                answer: "True"
            }
        ]
    },

    {
        id: 3,
        title: "Computer Fundamentals",
        description: "Check your knowledge of computers and technology.",
        category: "Technology",
        difficulty: "Easy",
        time: 60,
        icon: "🖥️",
        creator: "Admin",
        plays: 198,
        questions: [
            {
                type: "mcq",
                question: "What does CPU stand for?",
                options: [
                    "Central Processing Unit",
                    "Computer Personal Unit",
                    "Central Program Utility",
                    "Control Processing User"
                ],
                answer: "Central Processing Unit"
            },
            {
                type: "mcq",
                question: "Which device is used to enter text?",
                options: ["Monitor", "Keyboard", "Speaker", "Printer"],
                answer: "Keyboard"
            }
        ]
    },

    {
        id: 4,
        title: "Mathematics Challenge",
        description: "Solve these interesting mathematics questions.",
        category: "Mathematics",
        difficulty: "Hard",
        time: 70,
        icon: "➗",
        creator: "Admin",
        plays: 156,
        questions: [
            {
                type: "mcq",
                question: "What is 12 × 8?",
                options: ["86", "96", "108", "88"],
                answer: "96"
            },
            {
                type: "mcq",
                question: "What is the square root of 144?",
                options: ["10", "11", "12", "14"],
                answer: "12"
            }
        ]
    }
];

let quizzes = JSON.parse(localStorage.getItem("qbQuizzes"));

if (!quizzes || quizzes.length === 0) {
    quizzes = defaultQuizzes;
    saveQuizzes();
}

let users = JSON.parse(localStorage.getItem("qbUsers")) || [
    {
        name: "Demo User",
        email: "user@gmail.com",
        password: "123456"
    }
];

localStorage.setItem("qbUsers", JSON.stringify(users));

let results = JSON.parse(localStorage.getItem("qbResults")) || [];

let currentUser =
    JSON.parse(localStorage.getItem("qbCurrentUser")) || null;

let currentQuiz = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let timerInterval = null;
let remainingTime = 60;
let activeCategory = "All";


/* =========================================================
   STORAGE
   ========================================================= */

function saveQuizzes() {
    localStorage.setItem("qbQuizzes", JSON.stringify(quizzes));
}

function saveUsers() {
    localStorage.setItem("qbUsers", JSON.stringify(users));
}

function saveResults() {
    localStorage.setItem("qbResults", JSON.stringify(results));
}


/* =========================================================
   SECTION NAVIGATION
   ========================================================= */

function showSection(sectionId) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    document.getElementById("navigation").classList.remove("open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (sectionId === "quizzes") {
        renderQuizzes();
    }

    if (sectionId === "leaderboard") {
        renderLeaderboard();
    }

    if (sectionId === "results") {
        renderMyResults();
    }
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMenu() {
    document.getElementById("navigation").classList.toggle("open");
}


/* =========================================================
   DARK / LIGHT THEME
   ========================================================= */

function toggleTheme() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "qbTheme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
}

if (localStorage.getItem("qbTheme") === "dark") {
    document.body.classList.add("dark");
}


/* =========================================================
   QUIZ DISPLAY
   ========================================================= */

function renderQuizzes(list = quizzes) {

    const container = document.getElementById("quizContainer");

    if (!container) return;

    if (list.length === 0) {
        container.innerHTML =
            `<p>No quizzes found.</p>`;
        return;
    }

    container.innerHTML = list.map(quiz => `

        <div class="quiz-card">

            <div class="quiz-icon">
                ${quiz.icon || "🧠"}
            </div>

            <h3>${escapeHTML(quiz.title)}</h3>

            <p>${escapeHTML(quiz.description)}</p>

            <div class="quiz-meta">
                <span>📚 ${quiz.category}</span>
                <span>❓ ${quiz.questions.length}</span>
            </div>

            <div class="quiz-meta">
                <span>⭐ ${quiz.difficulty}</span>
                <span>⏱️ ${quiz.time}s</span>
            </div>

            <button
                class="primary"
                onclick="openQuiz(${quiz.id})">
                View Quiz
            </button>

        </div>

    `).join("");
}


function renderPopularQuizzes() {

    const container =
        document.getElementById("popularQuizzes");

    if (!container) return;

    const popular =
        [...quizzes]
            .sort((a,b) => b.plays - a.plays)
            .slice(0,4);

    container.innerHTML = popular.map(quiz => `

        <div class="quiz-card">

            <div class="quiz-icon">
                ${quiz.icon || "🧠"}
            </div>

            <h3>${escapeHTML(quiz.title)}</h3>

            <p>${escapeHTML(quiz.description)}</p>

            <div class="quiz-meta">
                <span>🔥 ${quiz.plays} plays</span>
                <span>${quiz.difficulty}</span>
            </div>

            <button
                class="primary"
                onclick="openQuiz(${quiz.id})">
                Start
            </button>

        </div>

    `).join("");
}


/* =========================================================
   FILTER
   ========================================================= */

function filterCategory(category) {

    activeCategory = category;

    showSection("quizzes");

    filterQuizzes();
}


function filterQuizzes() {

    const difficulty =
        document.getElementById("difficultyFilter").value;

    let filtered = [...quizzes];

    if (activeCategory !== "All") {
        filtered = filtered.filter(
            q => q.category === activeCategory
        );
    }

    if (difficulty !== "All") {
        filtered = filtered.filter(
            q => q.difficulty === difficulty
        );
    }

    renderQuizzes(filtered);
}


/* =========================================================
   SEARCH
   ========================================================= */

function searchQuizzes() {

    const value =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    if (!value) {
        renderQuizzes();
        showSection("quizzes");
        return;
    }

    const filtered = quizzes.filter(q =>
        q.title.toLowerCase().includes(value) ||
        q.category.toLowerCase().includes(value) ||
        q.description.toLowerCase().includes(value)
    );

    showSection("quizzes");
    renderQuizzes(filtered);
}


/* =========================================================
   QUIZ DETAILS
   ========================================================= */

function openQuiz(id) {

    currentQuiz =
        quizzes.find(q => q.id === id);

    if (!currentQuiz) return;

    const container =
        document.getElementById("quizDetailContainer");

    container.innerHTML = `

        <div class="form-box">

            <div class="quiz-icon">
                ${currentQuiz.icon || "🧠"}
            </div>

            <h1>${escapeHTML(currentQuiz.title)}</h1>

            <p>${escapeHTML(currentQuiz.description)}</p>

            <br>

            <p>📚 Category: <b>${currentQuiz.category}</b></p>
            <p>⭐ Difficulty: <b>${currentQuiz.difficulty}</b></p>
            <p>❓ Questions: <b>${currentQuiz.questions.length}</b></p>
            <p>⏱️ Time: <b>${currentQuiz.time} seconds</b></p>
            <p>👥 Plays: <b>${currentQuiz.plays}</b></p>

            <br>

            <label class="check-label">
                <input
                    type="checkbox"
                    id="randomizePlay">
                Randomize questions
            </label>

            <button
                class="primary"
                onclick="startQuiz()">
                🚀 Start Quiz
            </button>

            <button
                class="secondary"
                onclick="showSection('quizzes')">
                ← Back
            </button>

        </div>

    `;

    showSection("quizDetails");
}


/* =========================================================
   START QUIZ
   ========================================================= */

function startQuiz() {

    if (!currentQuiz) return;

    currentQuestions =
        JSON.parse(
            JSON.stringify(currentQuiz.questions)
        );

    const randomize =
        document.getElementById("randomizePlay").checked ||
        currentQuiz.randomize;

    if (randomize) {
        shuffle(currentQuestions);
    }

    currentQuestionIndex = 0;

    selectedAnswers =
        new Array(currentQuestions.length).fill(null);

    remainingTime = currentQuiz.time || 60;

    currentQuiz.plays =
        (currentQuiz.plays || 0) + 1;

    saveQuizzes();

    showSection("playQuiz");

    document.getElementById("playQuizTitle").textContent =
        currentQuiz.title;

    startTimer();

    renderQuestion();
}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer() {

    clearInterval(timerInterval);

    document.getElementById("timer").textContent =
        remainingTime;

    timerInterval = setInterval(() => {

        remainingTime--;

        document.getElementById("timer").textContent =
            remainingTime;

        if (remainingTime <= 0) {

            clearInterval(timerInterval);

            finishQuiz();
        }

    },1000);
}


/* =========================================================
   RENDER QUESTION
   ========================================================= */

function renderQuestion() {

    const question =
        currentQuestions[currentQuestionIndex];

    if (!question) return;

    document.getElementById("questionNumber")
        .textContent =
        `${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    document.getElementById("questionText")
        .textContent = question.question;

    const progress =
        ((currentQuestionIndex + 1) /
        currentQuestions.length) * 100;

    document.getElementById("progressBar")
        .style.width = progress + "%";

    const container =
        document.getElementById("answerContainer");

    if (question.type === "open") {

        container.innerHTML = `

            <textarea
                class="open-answer"
                id="openAnswer"
                placeholder="Type your answer here...">${selectedAnswers[currentQuestionIndex] || ""}</textarea>

        `;

        return;
    }

    container.innerHTML =
        question.options.map(option => `

            <label class="answer-option">

                <input
                    type="radio"
                    name="answer"
                    value="${escapeAttribute(option)}"
                    ${selectedAnswers[currentQuestionIndex] === option ? "checked" : ""}>

                ${escapeHTML(option)}

            </label>

        `).join("");
}


/* =========================================================
   SAVE CURRENT ANSWER
   ========================================================= */

function saveCurrentAnswer() {

    const question =
        currentQuestions[currentQuestionIndex];

    if (question.type === "open") {

        const input =
            document.getElementById("openAnswer");

        if (input) {
            selectedAnswers[currentQuestionIndex] =
                input.value.trim();
        }

    } else {

        const selected =
            document.querySelector(
                'input[name="answer"]:checked'
            );

        selectedAnswers[currentQuestionIndex] =
            selected ? selected.value : null;
    }
}


/* =========================================================
   NEXT QUESTION
   ========================================================= */

function nextQuestion() {

    saveCurrentAnswer();

    if (
        currentQuestionIndex <
        currentQuestions.length - 1
    ) {

        currentQuestionIndex++;

        renderQuestion();

    } else {

        finishQuiz();
    }
}


/* =========================================================
   PREVIOUS
   ========================================================= */

function previousQuestion() {

    saveCurrentAnswer();

    if (currentQuestionIndex > 0) {

        currentQuestionIndex--;

        renderQuestion();
    }
}


/* =========================================================
   FINISH QUIZ
   ========================================================= */

function finishQuiz() {

    clearInterval(timerInterval);

    saveCurrentAnswer();

    let correct = 0;

    currentQuestions.forEach((question,index) => {

        const userAnswer =
            selectedAnswers[index];

        if (
            question.type !== "open" &&
            userAnswer === question.answer
        ) {
            correct++;
        }

    });

    const total =
        currentQuestions.length;

    const wrong =
        total - correct;

    const percentage =
        total === 0
            ? 0
            : Math.round((correct / total) * 100);

    const result = {

        id: Date.now(),

        user:
            currentUser
                ? currentUser.name
                : "Guest",

        email:
            currentUser
                ? currentUser.email
                : "guest",

        quiz:
            currentQuiz.title,

        quizId:
            currentQuiz.id,

        correct: correct,

        wrong: wrong,

        total: total,

        score: percentage,

        date:
            new Date().toLocaleString()

    };

    results.push(result);

    saveResults();

    document.getElementById("finalScore")
        .textContent = percentage + "%";

    document.getElementById("correctAnswers")
        .textContent = correct;

    document.getElementById("wrongAnswers")
        .textContent = wrong;

    document.getElementById("totalQuestions")
        .textContent = total;

    document.getElementById("resultMessage")
        .textContent =
        percentage >= 80
            ? "Excellent performance! 🎉"
            : percentage >= 50
                ? "Good job! Keep improving. 👍"
                : "Keep practicing and try again! 💪";

    showSection("quizResult");
}


/* =========================================================
   QUESTION BUILDER
   ========================================================= */

let questionCount = 0;

function addQuestionField() {

    questionCount++;

    const container =
        document.getElementById("questionBuilder");

    const div =
        document.createElement("div");

    div.className = "question-builder";

    div.innerHTML = `

        <h3>Question ${questionCount}</h3>

        <input
            class="new-question"
            placeholder="Enter question">

        <select class="question-type"
                onchange="changeQuestionType(this)">

            <option value="mcq">
                Multiple Choice
            </option>

            <option value="truefalse">
                True / False
            </option>

            <option value="open">
                Open Ended
            </option>

        </select>

        <div class="options-area">

            <input class="option"
                   placeholder="Option 1">

            <input class="option"
                   placeholder="Option 2">

            <input class="option"
                   placeholder="Option 3">

            <input class="option"
                   placeholder="Option 4">

        </div>

        <input
            class="correct-answer"
            placeholder="Correct answer">

        <button
            class="secondary"
            onclick="this.parentElement.remove()">
            Remove
        </button>

    `;

    container.appendChild(div);
}


function changeQuestionType(select) {

    const box =
        select.closest(".question-builder");

    const optionsArea =
        box.querySelector(".options-area");

    const correct =
        box.querySelector(".correct-answer");

    if (select.value === "truefalse") {

        optionsArea.innerHTML = `
            <input class="option"
                   value="True"
                   readonly>

            <input class="option"
                   value="False"
                   readonly>
        `;

    } else if (select.value === "open") {

        optionsArea.innerHTML = "";

        correct.placeholder =
            "Correct answer";

    } else {

        optionsArea.innerHTML = `

            <input class="option"
                   placeholder="Option 1">

            <input class="option"
                   placeholder="Option 2">

            <input class="option"
                   placeholder="Option 3">

            <input class="option"
                   placeholder="Option 4">

        `;
    }
}


/* =========================================================
   CREATE QUIZ
   ========================================================= */

function createQuiz() {

    const title =
        document.getElementById("quizTitle").value.trim();

    const description =
        document.getElementById("quizDescription").value.trim();

    if (!title) {

        showMessage(
            "createMessage",
            "Please enter a quiz title.",
            "error"
        );

        return;
    }

    const questionBoxes =
        document.querySelectorAll(".question-builder");

    if (questionBoxes.length === 0) {

        showMessage(
            "createMessage",
            "Please add at least one question.",
            "error"
        );

        return;
    }

    const questions = [];

    questionBoxes.forEach(box => {

        const question =
            box.querySelector(".new-question")
            .value.trim();

        const type =
            box.querySelector(".question-type")
            .value;

        const options =
            [...box.querySelectorAll(".option")]
            .map(input => input.value.trim())
            .filter(Boolean);

        const answer =
            box.querySelector(".correct-answer")
            .value.trim();

        if (question && answer) {

            questions.push({
                type: type,
                question: question,
                options: options,
                answer: answer
            });

        }

    });

    if (questions.length === 0) {

        showMessage(
            "createMessage",
            "Please enter valid questions and answers.",
            "error"
        );

        return;
    }

    const quiz = {

        id: Date.now(),

        title: title,

        description:
            description || "Interactive quiz",

        category:
            document.getElementById("quizCategory").value,

        difficulty:
            document.getElementById("quizDifficulty").value,

        time:
            Number(document.getElementById("quizTime").value) || 60,

        icon: "🧠",

        creator:
            currentUser
                ? currentUser.name
                : "User",

        plays: 0,

        randomize:
            document.getElementById("randomizeQuestions").checked,

        questions: questions

    };

    quizzes.push(quiz);

    saveQuizzes();

    showMessage(
        "createMessage",
        "Quiz created successfully! 🎉",
        "success"
    );

    document.getElementById("questionBuilder")
        .innerHTML = "";

    questionCount = 0;

    document.getElementById("quizTitle").value = "";
    document.getElementById("quizDescription").value = "";

    setTimeout(() => {
        showSection("quizzes");
        renderQuizzes();
    }, 1200);
}


/* =========================================================
   LOGIN
   ========================================================= */

function loginUser() {

    const email =
        document.getElementById("loginEmail")
        .value.trim();

    const password =
        document.getElementById("loginPassword")
        .value;

    const user =
        users.find(
            u =>
                u.email === email &&
                u.password === password
        );

    if (!user) {

        showMessage(
            "loginMessage",
            "Invalid email or password.",
            "error"
        );

        return;
    }

    currentUser = user;

    localStorage.setItem(
        "qbCurrentUser",
        JSON.stringify(user)
    );

    showMessage(
        "loginMessage",
        `Welcome ${user.name}! 🎉`,
        "success"
    );

    setTimeout(() => {
        showSection("home");
    }, 800);
}


/* =========================================================
   REGISTER
   ========================================================= */

function registerUser() {

    const name =
        document.getElementById("registerName")
        .value.trim();

    const email =
        document.getElementById("registerEmail")
        .value.trim();

    const password =
        document.getElementById("registerPassword")
        .value;

    const confirm =
        document.getElementById("confirmPassword")
        .value;

    if (!name || !email || !password) {

        showMessage(
            "registerMessage",
            "Please fill all fields.",
            "error"
        );

        return;
    }

    if (password !== confirm) {

        showMessage(
            "registerMessage",
            "Passwords do not match.",
            "error"
        );

        return;
    }

    if (users.some(u => u.email === email)) {

        showMessage(
            "registerMessage",
            "Email already registered.",
            "error"
        );

        return;
    }

    const user = {
        name,
        email,
        password
    };

    users.push(user);

    saveUsers();

    showMessage(
        "registerMessage",
        "Registration successful! 🎉",
        "success"
    );

    setTimeout(() => {
        showSection("login");
    }, 1000);
}


/* =========================================================
   LEADERBOARD
   ========================================================= */

function renderLeaderboard() {

    const body =
        document.getElementById("leaderboardBody");

    if (!body) return;

    const sorted =
        [...results]
        .sort((a,b) => b.score - a.score)
        .slice(0,20);

    if (sorted.length === 0) {

        body.innerHTML =
            `<tr>
                <td colspan="5">No results yet.</td>
             </tr>`;

        return;
    }

    body.innerHTML =
        sorted.map((r,index) => `

            <tr>

                <td>${index + 1}</td>

                <td>${escapeHTML(r.user)}</td>

                <td>${escapeHTML(r.quiz)}</td>

                <td>
                    <b>${r.score}%</b>
                </td>

                <td>${r.date}</td>

            </tr>

        `).join("");
}


/* =========================================================
   MY RESULTS
   ========================================================= */

function renderMyResults() {

    const container =
        document.getElementById("myResults");

    if (!container) return;

    const email =
        currentUser
            ? currentUser.email
            : "guest";

    const mine =
        results.filter(r => r.email === email);

    if (mine.length === 0) {

        container.innerHTML =
            `<p>No quiz results yet. Play a quiz!</p>`;

        return;
    }

    container.innerHTML =
        mine.reverse().map(r => `

            <div class="result-item">

                <h3>${escapeHTML(r.quiz)}</h3>

                <p>Score:
                    <b>${r.score}%</b>
                </p>

                <p>
                    Correct:
                    ${r.correct}/${r.total}
                </p>

                <p>${r.date}</p>

            </div>

        `).join("");
}


/* =========================================================
   HELPERS
   ========================================================= */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}


function showMessage(id, message, type) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent = message;

    element.style.color =
        type === "error"
            ? "#ff7675"
            : "#00b894";
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {
    return escapeHTML(value);
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    renderQuizzes();
    renderPopularQuizzes();

    addQuestionField();

});