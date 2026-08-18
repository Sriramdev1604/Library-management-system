package com.library.backend.services;

import com.library.backend.entity.Book;
import com.library.backend.entity.Member;
import com.library.backend.entity.Borrowing;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.exception.BadRequestException;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.MemberRepository;
import com.library.backend.repository.BorrowingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BorrowingService {

    @Autowired
    private BorrowingRepository borrowingRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Transactional
    public Borrowing borrowBook(Integer bookId, Integer memberId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + memberId));

        if (book.getQuantity() == null || book.getQuantity() <= 0) {
            throw new BadRequestException("Book is out of stock (quantity is 0) and cannot be borrowed");
        }

        // Reduce quantity
        book.setQuantity(book.getQuantity() - 1);
        bookRepository.save(book);

        // Create borrowing entry
        Borrowing borrowing = new Borrowing();
        borrowing.setBookId(bookId);
        borrowing.setMemberId(memberId);
        borrowing.setBorrowDate(LocalDate.now());
        borrowing.setStatus("BORROWED");

        return borrowingRepository.save(borrowing);
    }

    @Transactional
    public Borrowing returnBook(Integer borrowingId) {
        Borrowing borrowing = borrowingRepository.findById(borrowingId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found with id: " + borrowingId));

        if ("RETURNED".equals(borrowing.getStatus())) {
            throw new BadRequestException("This book has already been returned");
        }

        Book book = bookRepository.findById(borrowing.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + borrowing.getBookId()));

        // Increase quantity
        book.setQuantity(book.getQuantity() + 1);
        bookRepository.save(book);

        // Update borrowing entry
        borrowing.setReturnDate(LocalDate.now());
        borrowing.setStatus("RETURNED");

        return borrowingRepository.save(borrowing);
    }

    public List<Borrowing> getBorrowingsByMember(Integer memberId) {
        // Verify member exists
        if (!memberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("Member not found with id: " + memberId);
        }
        return borrowingRepository.findByMemberId(memberId);
    }
}
