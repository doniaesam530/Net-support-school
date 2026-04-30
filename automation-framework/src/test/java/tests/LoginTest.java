package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test
    public void websiteLoadsSuccessfully() {

        String currentUrl = driver.getCurrentUrl();

        System.out.println(currentUrl);

        Assert.assertTrue(currentUrl.contains("localhost"));
    }
}