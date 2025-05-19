package com.opera.shows.model;

import lombok.Data;

import java.time.Year;

/**
 * This is a representation of an Opera from the Opera Service.
 * Used for GraphQL federation.
 */
@Data
public class Opera {
    private String id;
    private String title;
    private String description;
    private Year premiereYear;
    private String composer;
    private String librettist;
    private String language;
}
