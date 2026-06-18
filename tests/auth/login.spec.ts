import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/login.page";
import {DashboardPage} from "../../pages/dashboard.page";

test.describe('Auth module - Login', () => {
    test.beforeEach(async ({page}) => {
        await page.context().clearCookies();
        console.log('before each: clear cookies');
    })

    test.afterEach(async ({page}) => {
        console.log("test completed");
    })

    test('TC-AUTH-LOGIN-1 - Login with valid credentials @smoke @auth', async ({ page }) => {
    const loginPage = new LoginPage(page);
        await loginPage.gotoLoginPage();
    await loginPage.loginWithValidCredentials();
    // Assert masuk ke dashboard
    const dashboardPage = new DashboardPage(page);
    const isDashboardVisible = await dashboardPage.isDashboardVisible();
  });
})