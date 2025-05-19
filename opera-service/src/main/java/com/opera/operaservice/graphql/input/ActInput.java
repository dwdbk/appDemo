package com.opera.operaservice.graphql.input;

import lombok.Data;

import java.util.UUID;

@Data
public class ActInput {
    private String title;
    private String description;
    private Integer sequenceNumber;
    private UUID operaId;
}
