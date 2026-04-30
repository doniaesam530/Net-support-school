package tests;

import base.BaseTest;
import org.testng.annotations.Test;
import pages.LoginPage;
import pages.TutorDashboardPage;

public class TutorDashboardTest extends BaseTest {

    @Test
    public void broadcastMessageTest() {

        LoginPage loginPage = new LoginPage(driver);

        loginPage.login(
                "tutor@edu.com",
                "password123"
        );

        TutorDashboardPage dashboardPage = new TutorDashboardPage(driver);

        dashboardPage.clickBroadcast();
    }

    @Test
    public void lockStudentsTest() {

        LoginPage loginPage = new LoginPage(driver);

        loginPage.login(
                "tutor@edu.com",
                "password123"
        );

        TutorDashboardPage dashboardPage = new TutorDashboardPage(driver);

        dashboardPage.clickLockStudents();
    }

    @Test
    public void openChatTest() {

        LoginPage loginPage = new LoginPage(driver);

        loginPage.login(
                "tutor@edu.com",
                "password123"
        );

        TutorDashboardPage dashboardPage = new TutorDashboardPage(driver);

        dashboardPage.openChat();
    }
}