package com.library.backend.controller;

import com.library.backend.bean.BorrowBean;
import com.library.backend.entity.Borrowing;
import com.library.backend.services.BorrowingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrowings")
@CrossOrigin(origins = "*")
public class BorrowingController {

    @Autowired
    private BorrowingService borrowingService;

    @PostMapping("/borrow")
    public ResponseEntity<Borrowing> borrowBook(@Valid @RequestBody BorrowBean borrowBean) {
        return new ResponseEntity<>(borrowingService.borrowBook(borrowBean.getBookId(), borrowBean.getMemberId()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Borrowing> returnBook(@PathVariable Integer id) {
        return ResponseEntity.ok(borrowingService.returnBook(id));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Borrowing>> getBorrowingsByMember(@PathVariable Integer memberId) {
        return ResponseEntity.ok(borrowingService.getBorrowingsByMember(memberId));
    }
}
