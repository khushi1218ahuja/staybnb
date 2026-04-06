package com.staybnb.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthenticatedUser {
    private Integer id;
    private String email;
    private String role;
}
