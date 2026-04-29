package com.example.library.service;

import com.example.library.dto.AuthDtos;
import com.example.library.model.Role;
import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import com.example.library.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final String mailFrom;

    private final Map<String, ResetCodeData> resetCodes = new ConcurrentHashMap<>();
    private static final long RESET_CODE_TTL_SECONDS = 10 * 60;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager, JavaMailSender mailSender,
                       @Value("${app.mail.from:no-reply@eventflow.local}") String mailFrom) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already used");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDtos.AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDtos.AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public AuthDtos.MessageResponse requestPasswordResetCode(AuthDtos.PasswordResetRequest request) {
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
        resetCodes.put(user.getEmail().toLowerCase(), new ResetCodeData(code, Instant.now().plusSeconds(RESET_CODE_TTL_SECONDS)));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(user.getEmail());
        message.setSubject("Код для восстановления пароля");
        message.setText("Ваш одноразовый код: " + code + "\nКод действителен 10 минут.");
        mailSender.send(message);

        return new AuthDtos.MessageResponse("Код отправлен на почту");
    }

    public AuthDtos.MessageResponse verifyPasswordResetCode(AuthDtos.PasswordResetVerifyRequest request) {
        validateResetCode(request.email(), request.code());
        return new AuthDtos.MessageResponse("Код подтверждён");
    }

    public AuthDtos.MessageResponse confirmPasswordReset(AuthDtos.PasswordResetConfirmRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        resetCodes.remove(request.email().toLowerCase());
        return new AuthDtos.MessageResponse("Пароль успешно обновлён");
    }

    private void validateResetCode(String email, String code) {
        ResetCodeData data = resetCodes.get(email.toLowerCase());
        if (data == null || Instant.now().isAfter(data.expiresAt())) {
            resetCodes.remove(email.toLowerCase());
            throw new IllegalArgumentException("Код истёк или не был запрошен");
        }
        if (!data.code().equals(code)) {
            throw new IllegalArgumentException("Неверный код");
        }
    }

    private record ResetCodeData(String code, Instant expiresAt) {}
}
