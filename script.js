document.addEventListener("DOMContentLoaded", function () {
    extractQuestions().then(questions => {
        createQuiz(questions);
    });

    async function extractQuestions() {
        const text = await fetch('questions.html').then(res => res.text());
        const questionsDocument = new DOMParser().parseFromString(text.toString() ?? '', 'text/html');
        const questionContainers = questionsDocument.querySelectorAll('#questions > p');

        const questions = [];
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

                if (optionElement.querySelector('span[correctOption]')) {
                    correctAnswers.push(optionText);
                }
            });

            var explanation = undefined
            const explanationDiv = ulElement.nextElementSibling;
            if (explanationDiv?.className.match('message_box')) {
                const explanationElement = explanationDiv.querySelector('p')
                explanation = explanationElement?.textContent?.replace(/\n/g, ' ')?.replace(/ {2,}/g, ' ')?.trim()
            }

            const question = {
                text: questionText,
                images: images,
                options: options,
                correctAnswers: correctAnswers,
                explanation: explanation,
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
            optionsListElement.classList.add('options');
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
            submitButton.setAttribute("type", "submit")
            submitButton.addEventListener('click', function () {
                checkAnswer(question);
            });

            questionElement.appendChild(submitButton);

            quizContainer.innerHTML = '';
            quizContainer.appendChild(questionElement);
        }

        function checkAnswer(question) {
            const selectedOptions = Array.from(document.querySelectorAll('input[name="options"]:checked')).map(el => el.value);

            const correctionElement = document.createElement('div');
            correctionElement.classList.add('correction');

            var answeredCorrectly = selectedOptions.length === question.correctAnswers.length
                && selectedOptions.every((el, i) => el === question.correctAnswers[i]);
            if (answeredCorrectly) {
                correctionElement.textContent = 'Correct!';
                correctionElement.style.color = '#4caf50';
            } else {
                correctionElement.textContent = question.correctAnswers.length == 1
                    ? 'Incorrect. The correct answer is: ' + question.correctAnswers[0]
                    : 'Incorrect. The correct answers are: ' + question.correctAnswers.join(', ');
                correctionElement.style.color = '#f44336';
                correctionElement.style.margin = "10px"
            }
            if (question.explanation) {
                correctionElement.innerHTML += '<br><br>'
                correctionElement.innerHTML += question.explanation
            }
            const options = document.querySelectorAll('input[name="options"]');
            options.forEach(el => {
                if (question.correctAnswers.includes(el.value)) {
                    el.classList.add('correct');
                } else if (selectedOptions.includes(el.value)) {
                    el.classList.add('wrong');
                }
            });

            const submitButton = document.querySelector('button[type=submit]');
            submitButton.disabled = true;
            document.querySelectorAll('input[name="options"]').forEach(option => {
                option.disabled = true
            });

            quizContainer.appendChild(correctionElement);

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next Question';
            nextButton.addEventListener('click', function () {
                correctionElement.remove();
                currentQuestionIndex++;
                displayQuestion();
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
