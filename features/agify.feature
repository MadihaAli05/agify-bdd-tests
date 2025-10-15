# language: en
@live @smoke
Feature: Agify age estimation API
  As a consumer of the Agify API
  I want to estimate ages from first names
  So that I can build data-driven experiences

  Background:
    Given the Agify base URL

  @single
  Scenario: Estimate age globally for a single valid name
    When I request the age for name "michael"
    Then the response status should be 200
    And the response content type should be "application/json; charset=utf-8"
    And the JSON should contain a non-empty string at "name"
    And the JSON should contain a number at "age"
    And the JSON should contain a number at "count"

  @localization
  Scenario: Estimate age with localization by country
    When I request the age for name "michael" with country "US"
    Then the response status should be 200
    And the JSON at "country_id" should equal "US"

  @batch
  Scenario: Estimate age for multiple names (up to 10)
    Given I have the following names:
      | name     |
      | michael  |
      | matthew  |
      | jane     |
      | alex     |
      | emma     |
      | oliver   |
      | sophia   |
      | liam     |
      | isabella |
      | noah     |
    When I request the ages for the list of names
    Then the response status should be 200
    And the response should be a JSON array of length 10
    And every item should contain keys "name", "age", and "count"

  @fallbacks @diacritics
  Scenario: Fallback by removing diacritics
    When I request the age for name "José"
    Then the response status should be 200
    And the JSON should contain a non-empty string at "name"
    And the JSON at "name" should equalCaseInsensitive "jose"

  @fallbacks @fullname
  Scenario: Fallback by extracting first name from a full name
    When I request the age for name "Michael Jordan"
    Then the response status should be 200
    And the JSON at "name" should containCaseInsensitive "michael"

  @negative
  Scenario: Missing name parameter returns 422
    When I request the age with no name
    Then the response status should be 422
    And the JSON error message should contain "Missing 'name' parameter"

  
  @edgecase
  Scenario: Empty name returns 200 with null age
  When I request the age for name ""
  Then the response status should be 200
  And the JSON at "name" should equal ""
  And the JSON at "age" should be null
  And the JSON at "count" should equalNumber 0

  @headers @optional
  Scenario: Response content type & charset are correct
    When I request the age for name "matthew"
    Then the response status should be 200
    And the response content type should be "application/json; charset=utf-8"

