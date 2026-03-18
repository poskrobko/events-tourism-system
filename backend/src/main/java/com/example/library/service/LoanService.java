package com.example.library.service;

import com.example.library.dto.LoanDtos;
import com.example.library.model.Book;
import com.example.library.model.Loan;
import com.example.library.model.LoanStatus;
import com.example.library.model.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.LoanRepository;
import com.example.library.repository.RatingRepository;
import com.example.library.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final RatingRepository ratingRepository;
    private final ReservationService reservationService;
    private final CurrentUserService currentUserService;

    public LoanService(LoanRepository loanRepository,
                       UserRepository userRepository,
                       BookRepository bookRepository,
                       RatingRepository ratingRepository,
                       ReservationService reservationService,
                       CurrentUserService currentUserService) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.ratingRepository = ratingRepository;
        this.reservationService = reservationService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public LoanDtos.LoanResponse borrow(LoanDtos.BorrowRequest request) {
        currentUserService.requireSameUserOrAdmin(request.userId());
        return toDto(createIssuedLoan(request.userId(), request.bookId()));
    }

    @Transactional
    public LoanDtos.LoanResponse issueLoan(Long id) {
        Loan loan = loanRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        if (loan.getStatus() != LoanStatus.REQUESTED) {
            throw new IllegalStateException("Only requested loans can be issued");
        }
        Book book = loan.getBook();
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available");
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        loan.setStatus(LoanStatus.ISSUED);
        loan.setBorrowedAt(LocalDate.now());
        loan.setDueDate(LocalDate.now().plusDays(14));
        return toDto(loanRepository.save(loan));
    }

    @Transactional
    public LoanDtos.LoanResponse returnLoan(Long id) {
        if (!currentUserService.isLibrarianOrAdmin()) {
            throw new IllegalArgumentException("Only librarians can mark loans as returned");
        }
        return markReturned(id);
    }

    @Transactional
    public LoanDtos.LoanResponse markReturned(Long id) {
        Loan loan = loanRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        if (loan.getStatus() != LoanStatus.ISSUED && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new IllegalStateException("Loan already closed");
        }
        loan.setStatus(LoanStatus.RETURNED);
        loan.setReturnedAt(LocalDate.now());
        loan.getBook().setAvailableCopies(loan.getBook().getAvailableCopies() + 1);
        reservationService.notifyFirstWaitingForBook(loan.getBook().getId());
        return toDto(loanRepository.save(loan));
    }

    @Transactional
    public LoanDtos.LoanResponse extend(Long id) {
        Loan loan = loanRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        if (loan.getStatus() != LoanStatus.ISSUED && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new IllegalStateException("Only issued loans can be extended");
        }
        loan.setDueDate(loan.getDueDate().plusDays(7));
        return toDto(loanRepository.save(loan));
    }

    @Transactional(readOnly = true)
    public List<LoanDtos.LoanResponse> getCurrentUserLoans() {
        Long userId = currentUserService.getCurrentUserId();
        return loanRepository.findByUserIdOrderByBorrowedAtDesc(userId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<LoanDtos.LoanResponse> getUserLoans(Long userId) {
        currentUserService.requireSameUserOrAdmin(userId);
        return loanRepository.findByUserIdOrderByBorrowedAtDesc(userId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Loan findOpenLoanForReservation(Long userId, Long bookId) {
        return loanRepository.findFirstByUserIdAndBookIdAndStatusInOrderByBorrowedAtDesc(
                userId,
                bookId,
                List.of(LoanStatus.ISSUED, LoanStatus.OVERDUE)
        ).orElse(null);
    }

    @Transactional(readOnly = true)
    public Loan findLatestLoanForReservation(Long userId, Long bookId) {
        return loanRepository.findFirstByUserIdAndBookIdOrderByBorrowedAtDesc(userId, bookId).orElse(null);
    }


    private Loan createIssuedLoan(Long userId, Long bookId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available");
        }
        if (loanRepository.existsByUserIdAndBookIdAndStatusIn(user.getId(), book.getId(), List.of(LoanStatus.ISSUED, LoanStatus.OVERDUE))) {
            throw new IllegalArgumentException("Open loan already exists for this user/book");
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);

        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBook(book);
        loan.setBorrowedAt(LocalDate.now());
        loan.setDueDate(LocalDate.now().plusDays(14));
        loan.setStatus(LoanStatus.ISSUED);
        return loanRepository.save(loan);
    }

    private LoanDtos.LoanResponse toDto(Loan loan) {
        Integer myRating = ratingRepository.findByUserIdAndBookId(loan.getUser().getId(), loan.getBook().getId())
                .map(rating -> rating.getScore())
                .orElse(null);
        return new LoanDtos.LoanResponse(
                loan.getId(),
                loan.getUser().getId(),
                loan.getBook().getId(),
                loan.getStatus(),
                loan.getBook().getTitle(),
                loan.getBorrowedAt(),
                loan.getDueDate(),
                loan.getReturnedAt(),
                myRating);
    }
}
