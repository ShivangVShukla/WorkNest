package com.coworking;

import com.coworking.dto.LoginRequest;
import com.coworking.dto.RegisterRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthEmailValidationTests {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        validatorFactory.close();
    }

    @Test
    void loginOnlyAcceptsValidGmailAddresses() {
        LoginRequest validRequest = new LoginRequest();
        validRequest.setEmail("alex+work@gmail.com");
        validRequest.setPassword("password123");

        LoginRequest invalidRequest = new LoginRequest();
        invalidRequest.setEmail("alex@example.com");
        invalidRequest.setPassword("password123");

        assertFalse(hasEmailViolation(validRequest));
        assertTrue(hasEmailViolation(invalidRequest));
    }

    @Test
    void registrationOnlyAcceptsValidGmailAddresses() {
        RegisterRequest validRequest = new RegisterRequest();
        validRequest.setName("Alex Rivera");
        validRequest.setEmail("alex@GMAIL.COM");
        validRequest.setPassword("password123");

        RegisterRequest invalidRequest = new RegisterRequest();
        invalidRequest.setName("Alex Rivera");
        invalidRequest.setEmail("not-an-email@@gmail.com");
        invalidRequest.setPassword("password123");

        assertFalse(hasEmailViolation(validRequest));
        assertTrue(hasEmailViolation(invalidRequest));
    }

    private boolean hasEmailViolation(Object request) {
        return validator.validate(request).stream()
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("email"));
    }
}
