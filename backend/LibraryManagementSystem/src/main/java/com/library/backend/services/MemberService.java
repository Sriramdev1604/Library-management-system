package com.library.backend.services;

import com.library.backend.entity.Member;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.exception.BadRequestException;
import com.library.backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(Integer id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
    }

    public Member createMember(Member member) {
       
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new BadRequestException("Email already in use: " + member.getEmail());
        }
        if (member.getMembershipDate() == null) {
            member.setMembershipDate(LocalDate.now());
        }
        return memberRepository.save(member);
    }

    public Member updateMember(Integer id, Member memberDetails) {
        Member member = getMemberById(id);
        
        if (memberRepository.existsByEmailAndIdNot(memberDetails.getEmail(), id)) {
            throw new BadRequestException("Email already in use by another member: " + memberDetails.getEmail());
        }
        member.setName(memberDetails.getName());
        member.setEmail(memberDetails.getEmail());
        member.setPhone(memberDetails.getPhone());
        if (memberDetails.getMembershipDate() != null) {
            member.setMembershipDate(memberDetails.getMembershipDate());
        }
        return memberRepository.save(member);
    }

    public void deleteMember(Integer id) {
        Member member = getMemberById(id);
        memberRepository.delete(member);
    }

    public List<Member> getMembersJoinedYesterday() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        return memberRepository.findByMembershipDate(yesterday);
    }

   
}
