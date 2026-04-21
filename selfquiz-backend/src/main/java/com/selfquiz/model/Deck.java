package com.selfquiz.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "decks")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
public class Deck extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "deck")
    private List<TestHistory> testHistories = new ArrayList<>();

    public Deck(String name, String description, Subject subject) {
        this.name = name;
        this.description = description;
        this.subject = subject;
    }
}
