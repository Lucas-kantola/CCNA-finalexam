document.addEventListener("DOMContentLoaded", function () {
    const questions = extractQuestions();
    createQuiz(questions);

    function extractQuestions() {
        const questions = [];
        const questionContainers = document.querySelectorAll('.thecontent > p');

        questionContainers.forEach((questionContainer) => {
            const questionTextElement = questionContainer.querySelector('strong');
            if (!questionTextElement) {
                return;
            }

            const questionText = questionTextElement.textContent.trim();
            const images = [];

            const imageElements = questionContainer.querySelectorAll('img');
            imageElements.forEach(imageElement => {
                const imageURL = imageElement.getAttribute('src');
                images.push(imageURL);
            });

            const options = [];
            let correctAnswers = [];

            const ulElement = questionContainer.nextElementSibling;
            if (!ulElement || ulElement.tagName.toLowerCase() !== 'ul') {
                return;
            }

            const optionElements = ulElement.querySelectorAll('li');
            optionElements.forEach(optionElement => {
                const optionText = optionElement.textContent.trim();
                options.push(optionText);

                if (optionElement.querySelector('span[style="color: #ff0000;"]')) {
                    correctAnswers.push(optionText);
                }
            });

            const question = {
                text: questionText,
                images: images,
                options: options,
                correctAnswers: correctAnswers
            };

            questions.push(question);
        });

        return questions;
    }

    function createQuiz(quizQuestions) {
        const quizContainer = document.getElementById('quiz-container');
        quizQuestions = shuffleArray(quizQuestions);

        var currentQuestionIndex = 0;

        function displayQuestion() {
            const question = quizQuestions[currentQuestionIndex];

            const questionElement = document.createElement('div');
            questionElement.classList.add('question');

            const questionTextElement = document.createElement('p');
            questionTextElement.textContent = question.text;

            question.images.forEach(imageURL => {
                const imageElement = document.createElement('img');
                imageElement.src = imageURL;
                questionElement.appendChild(imageElement);
            });

            const optionsListElement = document.createElement('ul');
            const isMultipleCorrect = question.correctAnswers.length > 1;

            question.options.forEach((option, index) => {
                const optionElement = document.createElement('label');
                const inputElement = document.createElement(isMultipleCorrect ? 'input' : 'input');
                inputElement.type = isMultipleCorrect ? 'checkbox' : 'radio';
                inputElement.name = 'options';
                inputElement.value = option;

                optionElement.appendChild(inputElement);
                optionElement.appendChild(document.createTextNode(option));

                optionsListElement.appendChild(optionElement);
            });

            questionElement.appendChild(questionTextElement);
            questionElement.appendChild(optionsListElement);

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit Answer';
            submitButton.setAttribute("id", "sub")
            submitButton.addEventListener('click', function () {
                checkAnswer(question);
            });

            questionElement.appendChild(submitButton);

            quizContainer.innerHTML = '';
            quizContainer.appendChild(questionElement);
        }

        function checkAnswer(question) {
            const selectedOption = document.querySelector('input[name="options"]:checked');
            const selectedAnswer = selectedOption ? selectedOption.value : null;

            const submit = document.getElementById("sub")
            const correctionElement = document.createElement('div');
            correctionElement.classList.add('correction');

            if (selectedAnswer && question.correctAnswers.includes(selectedAnswer)) {
                correctionElement.textContent = 'Correct!';
                correctionElement.style.color = '#4caf50';
                submit.disabled = true
            } else {
                correctionElement.textContent = 'Incorrect. The correct answers are: ' + question.correctAnswers.join(', ');
                correctionElement.style.color = '#f44336';
                correctionElement.style.margin = "10px"
                submit.disabled = true
            }

            quizContainer.appendChild(correctionElement);

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next Question';
            nextButton.addEventListener('click', function () {
                correctionElement.remove();
                displayQuestion();
                currentQuestionIndex++;
                submit.disabled = false
            });

            quizContainer.appendChild(nextButton);
        }

        function shuffleArray(array) {
            if (!array || array.length === 0) {
                return array;
            }

            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        displayQuestion();
    }
});
