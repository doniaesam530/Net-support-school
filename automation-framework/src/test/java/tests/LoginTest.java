package tests;

import base.BaseTest;

import org.testng.annotations.Test;

import org.openqa.selenium.By;

import org.testng.Assert;

import pages.LoginPage;


public class LoginTest extends BaseTest {

@Test
public void loginAsTutor() {

    LoginPage loginPage = new LoginPage(driver);

    loginPage.login(
            "tutor@edu.com",
            "password123"
    );

    Assert.assertTrue(
            driver.findElement(
                    By.xpath("//button[contains(.,'Chat')]")
            ).isDisplayed()
    );
}

@Test
public void loginAsAdmin() {

    LoginPage loginPage = new LoginPage(driver);

    loginPage.login(
            "admin@edu.com",
            "password123"
    );

    Assert.assertTrue(
            driver.findElement(
                    By.xpath("//h2[contains(text(),'Session Log')]")
            ).isDisplayed()
    );
}

@Test
public void invalidLogin() {

    LoginPage loginPage = new LoginPage(driver);

    loginPage.login(
            "wrong@edu.com",
            "wrongpass"
    );

    Assert.assertTrue(
            driver.findElement(
                    By.xpath("//*[contains(text(),'Invalid credentials')]")
            ).isDisplayed()
    );
}
}