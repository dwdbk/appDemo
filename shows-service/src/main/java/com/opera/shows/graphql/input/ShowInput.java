package com.opera.shows.graphql.input;

import com.opera.shows.model.Show;
import lombok.Data;

@Data
public class ShowInput {
    private String operaId;
    private String startTime;
    private String endTime;
    private String venue;
    private String description;
    private String imageUrl;
    private Show.ShowStatus status;
}
