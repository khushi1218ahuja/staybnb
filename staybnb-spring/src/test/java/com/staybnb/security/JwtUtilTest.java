package com.staybnb.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "staybnb-super-secret-jwt-key-minimum-256-bits-long-for-security");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 604800000L);
    }

    @Test
    void generateToken_andExtractClaims() {
        String token = jwtUtil.generateToken(42, "user@test.com", "GUEST");

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("user@test.com");
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(42);
        assertThat(jwtUtil.extractRole(token)).isEqualTo("GUEST");
    }

    @Test
    void isTokenValid_validToken_returnsTrue() {
        String token = jwtUtil.generateToken(1, "a@b.com", "HOST");
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_invalidToken_returnsFalse() {
        assertThat(jwtUtil.isTokenValid("invalid.token.here")).isFalse();
    }

    @Test
    void isTokenValid_tamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken(1, "a@b.com", "ADMIN");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtUtil.isTokenValid(tampered)).isFalse();
    }
}
