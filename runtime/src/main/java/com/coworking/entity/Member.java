package com.coworking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String companyName;

    private String phone;

    private String membershipTier = "BASIC"; // BASIC, PRO, ENTERPRISE

    private LocalDateTime memberSince;

    @PrePersist
    public void onCreate() {
        if (memberSince == null) {
            memberSince = LocalDateTime.now();
        }
    }

    public Member(User user, String companyName, String phone, String membershipTier) {
        this.user = user;
        this.companyName = companyName;
        this.phone = phone;
        this.membershipTier = membershipTier;
        this.memberSince = LocalDateTime.now();
    }
}
