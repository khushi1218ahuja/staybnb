package com.staybnb.service;

import com.staybnb.dto.AuthResponse;
import com.staybnb.dto.LoginRequest;
import com.staybnb.dto.RegisterRequest;
import com.staybnb.entity.User;
import com.staybnb.repository.UserRepository;
import com.staybnb.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1)
                .name("Test User")
                .email("test@example.com")
                .password("hashedPassword")
                .role(User.Role.GUEST)
                .isVerified(false)
                .build();
    }

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("password123");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(req.getPassword())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(any(), anyString(), anyString())).thenReturn("mock-token");

        AuthResponse response = authService.register(req);

        assertThat(response.getToken()).isEqualTo("mock-token");
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_emailAlreadyExists_throwsConflict() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");
        req.setName("Test");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email already in use");
    }

    @Test
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(req.getPassword(), testUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(any(), anyString(), anyString())).thenReturn("mock-token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("mock-token");
        assertThat(response.getUser().getRole()).isEqualTo("GUEST");
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("wrongpassword");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(req.getPassword(), testUser.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_userNotFound_throwsUnauthorized() {
        LoginRequest req = new LoginRequest();
        req.setEmail("notfound@example.com");
        req.setPassword("password");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void register_withHostRole_setsHostRole() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Host User");
        req.setEmail("host@example.com");
        req.setPassword("password123");
        req.setRole("HOST");

        User hostUser = User.builder().id(2).name("Host User").email("host@example.com")
                .password("hashed").role(User.Role.HOST).isVerified(false).build();

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(hostUser);
        when(jwtUtil.generateToken(any(), anyString(), anyString())).thenReturn("host-token");

        AuthResponse response = authService.register(req);
        assertThat(response.getUser().getRole()).isEqualTo("HOST");
    }
}
