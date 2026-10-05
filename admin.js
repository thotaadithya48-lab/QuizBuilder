/* =========================================================
   QUIZ BUILDER - ADMIN JAVASCRIPT
   ========================================================= */

let quizzes =
    JSON.parse(localStorage.getItem("qbQuizzes")) || [];

let users =
    JSON.parse(localStorage.getItem("qbUsers")) || [];

let results =
    JSON.parse(localStorage.getItem("qbResults")) || [];

let categories =
    JSON.parse(localStorage.getItem("qbCategories")) || [
        "Programming",
        "Science",
        "Mathematics",
        "Technology",
        "General Knowledge",
        "History"
    ];

let editingQuizId = null;


/* =========================================================
   STORAGE
   ========================================================= */

function saveAll() {

    localStorage.setItem(
        "qbQuizzes",
        JSON.stringify(quizzes)
    );

    localStorage.setItem(
        "qbUsers",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "qbResults",
        JSON.stringify(results)
    );

    localStorage.setItem(
        "qbCategories",
        JSON.stringify(categories)
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showAdminSection(id) {

    document.querySelectorAll(".admin-section")
        .forEach(section => {
            section.classList.remove("active");
        });

    const section =
        document.getElementById(id);

    if (section) {
        section.classList.add("active");
    }

    if (id === "dashboard") {
        renderDashboard();
    }

    if (id === "quizzes") {
        renderAdminQuizzes();
    }

    if (id === "questions") {
        renderQuestions();
    }

    if (id === "users") {
        renderUsers();
    }

    if (id === "results") {
        renderResults();
    }

    if (id === "categories") {
        renderCategories();
    }

    if (id === "reports") {
        renderReports();
    }
}


/* =========================================================
   THEME
   ========================================================= */

function toggleAdminTheme() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "qbAdminTheme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
}

if (
    localStorage.getItem("qbAdminTheme") === "dark"
) {
    document.body.classList.add("dark");
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    const questionCount =
        quizzes.reduce(
            (sum, quiz) =>
                sum + quiz.questions.length,
            0
        );

    const playCount =
        results.length;

    const average =
        results.length
            ? Math.round(
                results.reduce(
                    (sum,r) => sum + r.score,
                    0
                ) / results.length
            )
            : 0;

    document.getElementById("quizCount")
        .textContent = quizzes.length;

    document.getElementById("userCount")
        .textContent = users.length;

    document.getElementById("questionCount")
        .textContent = questionCount;

    document.getElementById("playCount")
        .textContent = playCount;

    document.getElementById("averageScore")
        .textContent = average + "%";


    const activity =
        document.getElementById("recentActivity");

    const recent =
        [...results]
        .reverse()
        .slice(0,8);

    if (recent.length === 0) {

        activity.innerHTML =
            "<p>No activity yet.</p>";

        return;
    }

    activity.innerHTML =
        recent.map(r => `

            <div class="activity">

                🎯 <b>${escapeHTML(r.user)}</b>
                completed
                <b>${escapeHTML(r.quiz)}</b>

                with
                <b>${r.score}%</b>

                <br>

                <span>${r.date}</span>

            </div>

        `).join("");
}


/* =========================================================
   QUIZ MANAGEMENT
   ========================================================= */

function renderAdminQuizzes() {

    const container =
        document.getElementById("quizTable");

    const search =
        document.getElementById("adminQuizSearch")
        ?.value
        .toLowerCase()
        .trim() || "";

    let filtered =
        quizzes.filter(q =>
            q.title.toLowerCase().includes(search) ||
            q.category.toLowerCase().includes(search)
        );

    if (filtered.length === 0) {

        container.innerHTML =
            "<p>No quizzes found.</p>";

        return;
    }

    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>
                    <th>ID</th>
                    <th>Quiz</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Questions</th>
                    <th>Plays</th>
                    <th>Actions</th>
                </tr>

            </thead>

            <tbody>

                ${filtered.map(q => `

                    <tr>

                        <td>${q.id}</td>

                        <td>
                            🧠 ${escapeHTML(q.title)}
                        </td>

                        <td>${q.category}</td>

                        <td>${q.difficulty}</td>

                        <td>${q.questions.length}</td>

                        <td>${q.plays || 0}</td>

                        <td>

                            <div class="action-buttons">

                                <button
                                    class="secondary"
                                    onclick="editQuiz(${q.id})">
                                    Edit
                                </button>

                                <button
                                    class="danger"
                                    onclick="deleteQuiz(${q.id})">
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

        </div>

    `;
}


/* =========================================================
   ADD / EDIT QUIZ
   ========================================================= */

function openQuizModal(id = null) {

    editingQuizId = id;

    const modal =
        document.getElementById("quizModal");

    const title =
        document.getElementById("modalTitle");

    if (id) {

        const quiz =
            quizzes.find(q => q.id === id);

        if (!quiz) return;

        title.textContent = "Edit Quiz";

        document.getElementById("adminQuizTitle")
            .value = quiz.title;

        document.getElementById("adminQuizDescription")
            .value = quiz.description;

        document.getElementById("adminQuizCategory")
            .value = quiz.category;

        document.getElementById("adminQuizDifficulty")
            .value = quiz.difficulty;

        document.getElementById("adminQuizTime")
            .value = quiz.time;

    } else {

        title.textContent = "Add Quiz";

        document.getElementById("adminQuizTitle")
            .value = "";

        document.getElementById("adminQuizDescription")
            .value = "";

        document.getElementById("adminQuizTime")
            .value = 60;
    }

    modal.classList.add("show");
}


function closeQuizModal() {

    document.getElementById("quizModal")
        .classList.remove("show");

    editingQuizId = null;
}


function saveAdminQuiz() {

    const title =
        document.getElementById("adminQuizTitle")
        .value.trim();

    const description =
        document.getElementById("adminQuizDescription")
        .value.trim();

    const category =
        document.getElementById("adminQuizCategory")
        .value;

    const difficulty =
        document.getElementById("adminQuizDifficulty")
        .value;

    const time =
        Number(
            document.getElementById("adminQuizTime")
            .value
        ) || 60;

    if (!title) {

        document.getElementById("modalMessage")
            .textContent =
            "Please enter a quiz title.";

        return;
    }

    if (editingQuizId) {

        const quiz =
            quizzes.find(q =>
                q.id === editingQuizId
            );

        if (quiz) {

            quiz.title = title;
            quiz.description = description;
            quiz.category = category;
            quiz.difficulty = difficulty;
            quiz.time = time;

        }

    } else {

        quizzes.push({

            id: Date.now(),

            title,

            description:
                description || "New interactive quiz",

            category,

            difficulty,

            time,

            icon: "🧠",

            creator: "Admin",

            plays: 0,

            questions: [

                {
                    type: "mcq",

                    question:
                        "Sample question?",

                    options: [
                        "Option A",
                        "Option B",
                        "Option C",
                        "Option D"
                    ],

                    answer: "Option A"
                }

            ]

        });

    }

    saveAll();

    closeQuizModal();

    renderAdminQuizzes();

    renderDashboard();
}


function editQuiz(id) {
    openQuizModal(id);
}


/* =========================================================
   DELETE QUIZ
   ========================================================= */

function deleteQuiz(id) {

    const quiz =
        quizzes.find(q => q.id === id);

    if (!quiz) return;

    if (
        !confirm(
            `Delete "${quiz.title}"?`
        )
    ) {
        return;
    }

    quizzes =
        quizzes.filter(q => q.id !== id);

    saveAll();

    renderAdminQuizzes();
    renderDashboard();
}


/* =========================================================
   QUESTION MANAGEMENT
   ========================================================= */

function renderQuestions() {

    const container =
        document.getElementById("questionTable");

    let rows = [];

    quizzes.forEach(quiz => {

        quiz.questions.forEach((question,index) => {

            rows.push({

                quiz: quiz.title,

                number: index + 1,

                type: question.type,

                question: question.question

            });

        });

    });

    if (rows.length === 0) {

        container.innerHTML =
            "<p>No questions available.</p>";

        return;
    }

    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>
                    <th>Quiz</th>
                    <th>No.</th>
                    <th>Type</th>
                    <th>Question</th>
                </tr>

            </thead>

            <tbody>

                ${rows.map(r => `

                    <tr>

                        <td>${escapeHTML(r.quiz)}</td>

                        <td>${r.number}</td>

                        <td>${r.type}</td>

                        <td>${escapeHTML(r.question)}</td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

        </div>

    `;
}


/* =========================================================
   USER MANAGEMENT
   ========================================================= */

function renderUsers() {

    const container =
        document.getElementById("usersTable");

    if (users.length === 0) {

        container.innerHTML =
            "<p>No users registered.</p>";

        return;
    }

    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Action</th>
                </tr>

            </thead>

            <tbody>

                ${users.map((u,index) => `

                    <tr>

                        <td>${index + 1}</td>

                        <td>${escapeHTML(u.name)}</td>

                        <td>${escapeHTML(u.email)}</td>

                        <td>

                            <button
                                class="danger"
                                onclick="deleteUser('${escapeAttribute(u.email)}')">
                                Delete
                            </button>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

        </div>

    `;
}


function deleteUser(email) {

    if (
        !confirm(
            "Delete this user?"
        )
    ) {
        return;
    }

    users =
        users.filter(
            u => u.email !== email
        );

    saveAll();

    renderUsers();
    renderDashboard();
}


/* =========================================================
   RESULTS
   ========================================================= */

function renderResults() {

    const container =
        document.getElementById("resultsTable");

    if (results.length === 0) {

        container.innerHTML =
            "<p>No quiz attempts yet.</p>";

        return;
    }

    const sorted =
        [...results].reverse();

    container.innerHTML = `

        <div class="table-wrapper">

        <table>

            <thead>

                <tr>

                    <th>User</th>
                    <th>Quiz</th>
                    <th>Correct</th>
                    <th>Score</th>
                    <th>Date</th>

                </tr>

            </thead>

            <tbody>

                ${sorted.map(r => `

                    <tr>

                        <td>${escapeHTML(r.user)}</td>

                        <td>${escapeHTML(r.quiz)}</td>

                        <td>
                            ${r.correct}/${r.total}
                        </td>

                        <td>
                            <b>${r.score}%</b>
                        </td>

                        <td>${r.date}</td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

        </div>

    `;
}


/* =========================================================
   CATEGORIES
   ========================================================= */

function renderCategories() {

    const container =
        document.getElementById("categoryList");

    container.innerHTML =
        categories.map((category,index) => `

            <div class="category-admin">

                <span>📚 ${escapeHTML(category)}</span>

                <button
                    class="danger"
                    onclick="deleteCategory(${index})">
                    Delete
                </button>

            </div>

        `).join("");
}


function addCategory() {

    const input =
        document.getElementById("newCategory");

    const category =
        input.value.trim();

    if (!category) return;

    if (
        categories
            .map(c => c.toLowerCase())
            .includes(category.toLowerCase())
    ) {

        alert("Category already exists.");

        return;
    }

    categories.push(category);

    saveAll();

    input.value = "";

    renderCategories();
}


function deleteCategory(index) {

    if (
        !confirm(
            "Delete this category?"
        )
    ) {
        return;
    }

    categories.splice(index,1);

    saveAll();

    renderCategories();
}


/* =========================================================
   REPORTS
   ========================================================= */

function renderReports() {

    const popular =
        [...quizzes]
        .sort(
            (a,b) =>
                (b.plays || 0) -
                (a.plays || 0)
        )[0];

    document.getElementById("popularQuiz")
        .textContent =
        popular
            ? popular.title
            : "-";

    const highest =
        results.length
            ? Math.max(
                ...results.map(r => r.score)
            )
            : 0;

    document.getElementById("highestScore")
        .textContent =
        highest + "%";

    document.getElementById("totalAttempts")
        .textContent =
        results.length;


    const container =
        document.getElementById("performanceBars");

    if (quizzes.length === 0) {

        container.innerHTML =
            "<p>No quiz data available.</p>";

        return;
    }

    container.innerHTML =
        quizzes.map(quiz => {

            const quizResults =
                results.filter(
                    r => r.quizId === quiz.id
                );

            const average =
                quizResults.length
                    ? Math.round(
                        quizResults.reduce(
                            (sum,r) =>
                                sum + r.score,
                            0
                        ) / quizResults.length
                    )
                    : 0;

            return `

                <div class="performance-row">

                    <div class="performance-label">

                        <span>
                            ${escapeHTML(quiz.title)}
                        </span>

                        <b>${average}%</b>

                    </div>

                    <div class="bar-background">

                        <div
                            class="bar-fill"
                            style="width:${average}%">
                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutAdmin() {

    if (
        confirm(
            "Logout from admin panel?"
        )
    ) {

        window.location.href =
            "user.html";

    }
}


/* =========================================================
   HELPERS
   ========================================================= */

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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderDashboard();

        renderAdminQuizzes();

        renderQuestions();

        renderUsers();

        renderResults();

        renderCategories();

        renderReports();

    }
);