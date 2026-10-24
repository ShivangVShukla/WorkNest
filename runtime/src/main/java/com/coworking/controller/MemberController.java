package com.coworking.controller;

import com.coworking.dto.MemberResponse;
import com.coworking.entity.Member;
import com.coworking.entity.User;
import com.coworking.repository.MemberRepository;
import com.coworking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public MemberResponse getCurrentMember(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Member member = memberRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Member newMember = new Member(user, "Independent / Freelance", "+91 9876543210", "PRO");
                    return memberRepository.save(newMember);
                });

        return new MemberResponse(member);
    }

    @PutMapping("/me")
    public MemberResponse updateCurrentMember(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Member member = memberRepository.findByUserId(user.getId())
                .orElseGet(() -> new Member(user, "Independent / Freelance", "+91 9876543210", "BASIC"));

        if (payload.containsKey("companyName")) {
            member.setCompanyName(payload.get("companyName"));
        }
        if (payload.containsKey("phone")) {
            member.setPhone(payload.get("phone"));
        }
        if (payload.containsKey("membershipTier")) {
            member.setMembershipTier(payload.get("membershipTier"));
        }

        return new MemberResponse(memberRepository.save(member));
    }
}
