package com.coworking.dto;

import com.coworking.entity.Member;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MemberResponse {
    private final Long id;
    private final Long userId;
    private final String name;
    private final String email;
    private final String companyName;
    private final String phone;
    private final String membershipTier;
    private final LocalDateTime memberSince;

    public MemberResponse(Member member) {
        this.id = member.getId();
        this.userId = member.getUser().getId();
        this.name = member.getUser().getName();
        this.email = member.getUser().getEmail();
        this.companyName = member.getCompanyName();
        this.phone = member.getPhone();
        this.membershipTier = member.getMembershipTier();
        this.memberSince = member.getMemberSince();
    }
}
