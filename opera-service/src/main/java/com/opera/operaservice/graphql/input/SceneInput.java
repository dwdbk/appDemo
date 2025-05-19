package com.opera.operaservice.graphql.input;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SceneInput {
    private String title;
    private String description;
    private Integer sequenceNumber;
    private UUID actId;
    private List<UUID> characterIds;
    private List<UUID> decorIds;
}
