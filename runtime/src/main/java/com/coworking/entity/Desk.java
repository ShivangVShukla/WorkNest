package com.coworking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "desks")
@Getter
@Setter
@NoArgsConstructor
public class Desk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "space_id", nullable = false)
    @JsonIgnore
    private Space space;

    @Column(nullable = false)
    private String deskCode; // e.g. "D-101", "C-01", "CABIN-A"

    @Column(nullable = false)
    private String deskType; // "DESK" or "CABIN"

    @Column(name = "grid_row", nullable = false)
    private Integer rowNumber;

    @Column(name = "grid_col", nullable = false)
    private Integer colNumber;

    private Integer capacity = 1;

    private boolean active = true;

    private BigDecimal dailyPriceMultiplier = BigDecimal.ONE;

    public Desk(Space space, String deskCode, String deskType, Integer rowNumber, Integer colNumber, Integer capacity) {
        this.space = space;
        this.deskCode = deskCode;
        this.deskType = deskType;
        this.rowNumber = rowNumber;
        this.colNumber = colNumber;
        this.capacity = capacity;
        this.active = true;
        this.dailyPriceMultiplier = BigDecimal.ONE;
    }
}
