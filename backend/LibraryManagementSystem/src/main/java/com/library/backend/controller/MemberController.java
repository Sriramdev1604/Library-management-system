package com.library.backend.controller;

import com.library.backend.bean.MemberBean;
import com.library.backend.entity.Member;
import com.library.backend.services.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Integer id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }

    @PostMapping
    public ResponseEntity<Member> createMember(@Valid @RequestBody MemberBean memberBean) {
        Member member = new Member();
        member.setName(memberBean.getName());
        member.setEmail(memberBean.getEmail());
        member.setPhone(memberBean.getPhone());
        member.setMembershipDate(memberBean.getMembershipDate());
        return new ResponseEntity<>(memberService.createMember(member), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Integer id, @Valid @RequestBody MemberBean memberBean) {
        Member memberDetails = new Member();
        memberDetails.setName(memberBean.getName());
        memberDetails.setEmail(memberBean.getEmail());
        memberDetails.setPhone(memberBean.getPhone());
        memberDetails.setMembershipDate(memberBean.getMembershipDate());
        return ResponseEntity.ok(memberService.updateMember(id, memberDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Integer id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/joined-yesterday")
    public List<Member> getMembersJoinedYesterday() {
        return memberService.getMembersJoinedYesterday();
    }
}
