package com.library.backend.controller;

import com.library.backend.bean.BookBean;
import com.library.backend.entity.Book;
import com.library.backend.services.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping
    public ResponseEntity<Book> createBook(@Valid @RequestBody BookBean bookBean) {
        Book book = new Book();
        book.setTitle(bookBean.getName());
        book.setAuthor(bookBean.getAuthor());
        book.setIsbn(bookBean.getIsbn());
        book.setQuantity(bookBean.getQuantity());
        book.setPublishedDate(bookBean.getPublishedDate());
        return new ResponseEntity<>(bookService.createBook(book), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Integer id, @Valid @RequestBody BookBean bookBean) {
        Book bookDetails = new Book();
        bookDetails.setTitle(bookBean.getName());
        bookDetails.setAuthor(bookBean.getAuthor());
        bookDetails.setIsbn(bookBean.getIsbn());
        bookDetails.setQuantity(bookBean.getQuantity());
        bookDetails.setPublishedDate(bookBean.getPublishedDate());
        return ResponseEntity.ok(bookService.updateBook(id, bookDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Integer id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam String query) {
        return bookService.searchBooks(query);
    }

    @GetMapping("/low-stock")
    public List<Book> getLowStockBooks() {
        return bookService.getLowStockBooks();
    }
}
