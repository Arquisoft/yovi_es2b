Feature: Register
  Validate the register form

  Scenario: Successful registration
    Given the register page is open
    When I navigate to signup and register with valid credentials
    Then I should see the home screen
