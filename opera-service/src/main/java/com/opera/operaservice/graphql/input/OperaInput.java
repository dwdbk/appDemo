package com.opera.operaservice.graphql.input;

import lombok.Data;

import java.time.Year;

@Data
public class OperaInput {
    private String title;
    private String description;
    private Integer premiereYear;
    private String composer;
    private String librettist;
    private String language;
}
