package com.opera.shows.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "shows")
@Getter
@Setter
public class Show extends BaseEntity {
    
    public enum ShowStatus {
        SCHEDULED, CANCELLED, COMPLETED, POSTPONED
    }
    
    @NotNull
    private UUID operaId;  // Reference to Opera in the Opera Service
    
    @NotNull
    private LocalDateTime startTime;
    
    @NotNull
    private LocalDateTime endTime;
    
    private String venue;
    private String description;
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    private ShowStatus status = ShowStatus.SCHEDULED;
    
    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ShowSinger> cast = new HashSet<>();
    
    // For GraphQL Federation
    @Transient
    private Opera opera;
    
    public void addCastMember(ShowSinger castMember) {
        cast.add(castMember);
        castMember.setShow(this);
    }
    
    public void removeCastMember(ShowSinger castMember) {
        cast.remove(castMember);
        castMember.setShow(null);
    }
}
