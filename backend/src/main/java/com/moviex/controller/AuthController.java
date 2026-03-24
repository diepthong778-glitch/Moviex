package com.moviex.controller;

import com.moviex.dto.JwtResponse;
import com.moviex.dto.LoginRequest;
import com.moviex.dto.MessageResponse;
import com.moviex.dto.SignupRequest;
import com.moviex.model.Role;
import com.moviex.model.User;
import com.moviex.repository.UserRepository;
import com.moviex.security.JwtUtils;
import com.moviex.security.UserDetailsImpl;
import com.moviex.service.EmailService;
import com.moviex.service.RealtimeActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final RealtimeActivityService realtimeActivityService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder encoder, JwtUtils jwtUtils, EmailService emailService,
                          RealtimeActivityService realtimeActivityService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
        this.realtimeActivityService = realtimeActivityService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOptional.isPresent() && !userOptional.get().isVerified()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is not verified!"));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        User loggedUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        loggedUser.setOnline(true);
        loggedUser.setLastLoginAt(LocalDateTime.now());
        loggedUser.setLastSeenAt(LocalDateTime.now());
        userRepository.save(loggedUser);
        realtimeActivityService.userLogin(loggedUser);

        String subscriptionPlan = loggedUser.getSubscriptionPlan().name();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                roles,
                subscriptionPlan));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        
        // Add default role
        user.getRoles().add(Role.ROLE_USER);
        
        // Generate Verification Token
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerified(false);

        // Save User
        userRepository.save(user);

        // Send Email Async
        new Thread(() -> emailService.sendVerificationEmail(user.getEmail(), token)).start();

        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please check your email."));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        Optional<User> user = userRepository.findByVerificationToken(token);
        
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid verification token!"));
        }
        
        User verifiedUser = user.get();
        if (verifiedUser.isVerified()) {
            return ResponseEntity.ok(new MessageResponse("Email is already verified!"));
        }

        verifiedUser.setVerified(true);
        verifiedUser.setVerificationToken(null);
        userRepository.save(verifiedUser);
        
        return ResponseEntity.ok(new MessageResponse("Email verified successfully! You can now login."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            userRepository.findByEmail(userDetails.getUsername()).ifPresent(user -> {
                user.setOnline(false);
                user.setLastSeenAt(LocalDateTime.now());
                userRepository.save(user);
                realtimeActivityService.userLogout(user);
            });
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Logged out"));
    }
}
