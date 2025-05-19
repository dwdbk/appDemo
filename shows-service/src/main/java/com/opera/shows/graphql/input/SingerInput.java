package com.opera.shows.graphql.input;

import com.opera.shows.model.Singer;
import lombok.Data;

@Data
public class SingerInput {
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String nationality;
    private String bio;
    private String imageUrl;
    private Singer.VoiceType voiceType;
}
