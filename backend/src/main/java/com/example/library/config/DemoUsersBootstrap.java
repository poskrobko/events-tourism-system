package com.example.library.config;

import com.example.library.model.Role;
import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DemoUsersBootstrap implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DemoUsersBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.password}")
    private String demoPassword;

    @Value("${app.demo.seed-enabled:true}")
    private boolean seedEnabled;

    public DemoUsersBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Demo user seed disabled");
            return;
        }

        createDemoUserIfMissing("anna.reader@library.local", "anna", Set.of(Role.ROLE_USER));
        createDemoUserIfMissing("boris.reader@library.local", "boris", Set.of(Role.ROLE_USER));
        createDemoUserIfMissing("librarian@library.local", "librarian", Set.of(Role.ROLE_LIBRARIAN));
        createDemoUserIfMissing("admin@library.local", "admin", Set.of(Role.ROLE_ADMIN));

        log.info("Demo users are ready. Login with APP_DEMO_PASSWORD for anna.reader@library.local, boris.reader@library.local, librarian@library.local, admin@library.local");
    }

    private void createDemoUserIfMissing(String email, String nickname, Set<Role> roles) {
        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setNickname(nickname);
        user.setPasswordHash(passwordEncoder.encode(demoPassword));
        user.setRoles(roles);
        userRepository.save(user);
    }
}
