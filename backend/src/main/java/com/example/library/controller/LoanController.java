package com.example.library.controller;

import com.example.library.dto.LoanDtos;
import com.example.library.service.LoanService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class LoanController {
    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping("/loans")
    public LoanDtos.LoanResponse borrow(@Valid @RequestBody LoanDtos.BorrowRequest request) { return loanService.borrow(request); }

    @PostMapping("/loans/{id}/return")
    public LoanDtos.LoanResponse returnLoan(@PathVariable Long id) { return loanService.returnLoan(id); }

    @PostMapping("/loans/{id}/extend")
    public LoanDtos.LoanResponse extend(@PathVariable Long id) { return loanService.extend(id); }

    @GetMapping("/users/me/loans")
    public List<LoanDtos.LoanResponse> myLoans() { return loanService.getCurrentUserLoans(); }

    @GetMapping("/users/{userId}/loans")
    public List<LoanDtos.LoanResponse> userLoans(@PathVariable Long userId) { return loanService.getUserLoans(userId); }
}
