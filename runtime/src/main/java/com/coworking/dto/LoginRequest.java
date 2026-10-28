
package com.coworking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank
    @Email
    @Pattern(regexp = "^[^@\\s]+@(?i:gmail\\.com)$",
            message = "Email must be a valid gmail.com address")
    @Size(max = 254)
    private String email;

    @NotBlank
    @Size(max = 72)
    private String password;
}
