package com.opera.shows.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "show_singers")
@Getter
@Setter
public class ShowSinger extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "singer_id", nullable = false)
    private Singer singer;
    
    @Column(name = "character_name")
    private String characterName;
    
    private String role; // e.g., "Main", "Understudy", "Chorus"
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ShowSinger)) return false;
        return id != null && id.equals(((ShowSinger) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
