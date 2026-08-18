package com.library.backend.services;

import com.library.backend.entity.Book;
import com.library.backend.entity.Member;
import com.library.backend.entity.Borrowing;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.exception.BadRequestException;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.MemberRepository;
import com.library.backend.repository.BorrowingRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BorrowingServiceTest {

    @Mock
    private BorrowingRepository borrowingRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private BorrowingService borrowingService;

    private Book testBook;
    private Member testMember;
    private Borrowing testBorrowing;

    @BeforeEach
    void setUp() {
        testBook = new Book();
        testBook.setId(1);
        testBook.setTitle("Test Book");
        testBook.setQuantity(5);

        testMember = new Member();
        testMember.setId(1);
        testMember.setName("John Doe");
        testMember.setEmail("john@example.com");

        testBorrowing = new Borrowing();
        testBorrowing.setId(100);
        testBorrowing.setBookId(1);
        testBorrowing.setMemberId(1);
        testBorrowing.setBorrowDate(LocalDate.now());
        testBorrowing.setStatus("BORROWED");
    }



    @Test
    void testBorrowBook_Success() {
        when(bookRepository.findById(1)).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(1)).thenReturn(Optional.of(testMember));
        when(borrowingRepository.save(any(Borrowing.class))).thenAnswer(invocation -> {
            Borrowing b = invocation.getArgument(0);
            b.setId(100);
            return b;
        });

        Borrowing result = borrowingService.borrowBook(1, 1);

        assertNotNull(result);
        assertEquals(100, result.getId());
        assertEquals(1, result.getBookId());
        assertEquals(1, result.getMemberId());
        assertEquals("BORROWED", result.getStatus());
        assertEquals(LocalDate.now(), result.getBorrowDate());
        assertEquals(4, testBook.getQuantity());

        verify(bookRepository, times(1)).save(testBook);
        verify(borrowingRepository, times(1)).save(any(Borrowing.class));
    }

    @Test
    void testBorrowBook_BookNotFound() {
        when(bookRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            borrowingService.borrowBook(1, 1);
        });

        verify(bookRepository, never()).save(any(Book.class));
        verify(borrowingRepository, never()).save(any(Borrowing.class));
    }

    @Test
    void testBorrowBook_MemberNotFound() {
        when(bookRepository.findById(1)).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            borrowingService.borrowBook(1, 1);
        });

        verify(bookRepository, never()).save(any(Book.class));
        verify(borrowingRepository, never()).save(any(Borrowing.class));
    }

    @Test
    void testBorrowBook_OutOfStock() {
        testBook.setQuantity(0);
        when(bookRepository.findById(1)).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(1)).thenReturn(Optional.of(testMember));

        assertThrows(BadRequestException.class, () -> {
            borrowingService.borrowBook(1, 1);
        });

        verify(bookRepository, never()).save(any(Book.class));
        verify(borrowingRepository, never()).save(any(Borrowing.class));
    }


    @Test
    void testReturnBook_Success() {
        when(borrowingRepository.findById(100)).thenReturn(Optional.of(testBorrowing));
        when(bookRepository.findById(1)).thenReturn(Optional.of(testBook));
        when(borrowingRepository.save(any(Borrowing.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Borrowing result = borrowingService.returnBook(100);

        assertNotNull(result);
        assertEquals("RETURNED", result.getStatus());
        assertEquals(LocalDate.now(), result.getReturnDate());
        assertEquals(6, testBook.getQuantity());

        verify(bookRepository, times(1)).save(testBook);
        verify(borrowingRepository, times(1)).save(testBorrowing);
    }

    @Test
    void testReturnBook_NotFound() {
        when(borrowingRepository.findById(100)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            borrowingService.returnBook(100);
        });

        verify(bookRepository, never()).save(any(Book.class));
        verify(borrowingRepository, never()).save(any(Borrowing.class));
    }

    @Test
    void testReturnBook_AlreadyReturned() {
        testBorrowing.setStatus("RETURNED");
        when(borrowingRepository.findById(100)).thenReturn(Optional.of(testBorrowing));

        assertThrows(BadRequestException.class, () -> {
            borrowingService.returnBook(100);
        });

        verify(bookRepository, never()).save(any(Book.class));
        verify(borrowingRepository, never()).save(any(Borrowing.class));
    }

    @Test
    void testReturnBook_BookNotFound() {
        when(borrowingRepository.findById(100)).thenReturn(Optional.of(testBorrowing));
        when(bookRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            borrowingService.returnBook(100);
        });

        verify(bookRepository, never()).save(any(Book.class));
        verify(borrowingRepository, never()).save(any(Borrowing.class));
    }

    // --- Tests for getBorrowingsByMember ---

    @Test
    void testGetBorrowingsByMember_Success() {
        when(memberRepository.existsById(1)).thenReturn(true);
        when(borrowingRepository.findByMemberId(1)).thenReturn(Arrays.asList(testBorrowing));

        List<Borrowing> result = borrowingService.getBorrowingsByMember(1);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testBorrowing, result.get(0));

        verify(borrowingRepository, times(1)).findByMemberId(1);
    }

    @Test
    void testGetBorrowingsByMember_MemberNotFound() {
        when(memberRepository.existsById(1)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> {
            borrowingService.getBorrowingsByMember(1);
        });

        verify(borrowingRepository, never()).findByMemberId(anyInt());
    }
}
