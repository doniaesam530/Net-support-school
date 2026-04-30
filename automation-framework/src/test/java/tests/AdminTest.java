package tests;

import base.BaseTest;
import org.testng.annotations.Test;
import pages.AdminPage;
import pages.LoginPage;

public class AdminTest extends BaseTest {

    @Test
    public void addStudentTest() {

        LoginPage loginPage = new LoginPage(driver);

        loginPage.login(
                "admin@edu.com",
                "password123"
        );

        AdminPage adminPage = new AdminPage(driver);

        adminPage.clickAddStudent();
    }
}