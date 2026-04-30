package tests;

import base.BaseTest;
import org.testng.annotations.Test;
import pages.LoginPage;
import pages.QuizPage;

public class QuizTest extends BaseTest {

    @Test
    public void submitQuizTest() {

        LoginPage loginPage = new LoginPage(driver);

        loginPage.login(
                "student1@edu.com",
                "password123"
        );

        QuizPage quizPage = new QuizPage(driver);

        quizPage.submitQuiz();
    }
}