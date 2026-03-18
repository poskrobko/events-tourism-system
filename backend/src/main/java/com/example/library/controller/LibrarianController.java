package com.example.library.controller;

import com.example.library.dto.AdminDtos;
import com.example.library.dto.LoanDtos;
import com.example.library.model.Loan;
import com.example.library.model.LoanStatus;
import com.example.library.repository.LoanRepository;
import com.example.library.service.LoanService;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/librarian")
public class LibrarianController {
    private final LoanRepository loanRepository;
    private final LoanService loanService;

    public LibrarianController(LoanRepository loanRepository, LoanService loanService) {
        this.loanRepository = loanRepository;
        this.loanService = loanService;
    }

    @GetMapping("/loans")
    public Page<AdminDtos.AdminLoanResponse> loans(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size,
                                                   @RequestParam(required = false) String userQuery,
                                                   @RequestParam(required = false) String bookQuery,
                                                   @RequestParam(required = false) String status) {
        return loanRepository.searchAdmin(userQuery, bookQuery, parseLoanStatus(status), PageRequest.of(page, size)).map(this::toLoanResponse);
    }

    @PostMapping("/loans/{id}/issue")
    public LoanDtos.LoanResponse issueLoan(@PathVariable Long id) {
        return loanService.issueLoan(id);
    }

    @PostMapping("/loans/{id}/return")
    public LoanDtos.LoanResponse markReturned(@PathVariable Long id) {
        return loanService.markReturned(id);
    }

    private AdminDtos.AdminLoanResponse toLoanResponse(Loan loan) {
        return new AdminDtos.AdminLoanResponse(
                loan.getId(),
                loan.getUser().getId(),
                loan.getUser().getEmail(),
                loan.getBook().getId(),
                loan.getBook().getTitle(),
                loan.getStatus(),
                loan.getBorrowedAt(),
                loan.getDueDate(),
                loan.getReturnedAt()
        );
    }

    private LoanStatus parseLoanStatus(String value) {
        if (value == null || value.isBlank()) return null;
        return LoanStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
