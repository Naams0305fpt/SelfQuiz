package com.selfquiz.controller;

import com.selfquiz.dto.request.LoginRequest;
import com.selfquiz.dto.request.RegisterRequest;
import com.selfquiz.dto.response.MessageResponse;
import com.selfquiz.dto.response.UserInfoResponse;
import com.selfquiz.model.RefreshToken;
import com.selfquiz.model.Role;
import com.selfquiz.model.User;
import com.selfquiz.repository.UserRepository;
import com.selfquiz.security.JwtService;
import com.selfquiz.security.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder encoder, JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User userDetails = (User) authentication.getPrincipal();

        String jwt = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        setCookie(response, "accessToken", jwt, 86400); // 1 day
        setCookie(response, "refreshToken", refreshToken.getToken(), 604800); // 7 days

        return ResponseEntity.ok(new UserInfoResponse(
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole().name()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getEmail(),
                Role.ROLE_USER);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshtoken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getCookieValueByName(request, "refreshToken");

        if (refreshToken != null && !refreshToken.isEmpty()) {
            return refreshTokenService.findByToken(refreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        String newAccessToken = jwtService.generateToken(user);
                        setCookie(response, "accessToken", newAccessToken, 86400); // 1 day
                        return ResponseEntity.ok(new MessageResponse("Token is refreshed successfully!"));
                    })
                    .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Refresh Token is empty!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        Object principle = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principle instanceof User) {
            Long userId = ((User) principle).getId();
            refreshTokenService.deleteByUserId(userId);
        }

        clearCookie(response, "accessToken");
        clearCookie(response, "refreshToken");

        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }
        
        User userDetails = (User) authentication.getPrincipal();
        return ResponseEntity.ok(new UserInfoResponse(
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole().name()
        ));
    }

    private void setCookie(HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(false) // Set to true in production
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getCookieValueByName(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(name)) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
