package com.example.library.model;

import jakarta.persistence.*;

@Entity
@Table(name = "recommendation_profiles")
public class RecommendationProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private User user;

    private String preferredGenresCsv;
    private String favoriteAuthorsCsv;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getPreferredGenresCsv() { return preferredGenresCsv; }
    public void setPreferredGenresCsv(String preferredGenresCsv) { this.preferredGenresCsv = preferredGenresCsv; }
    public String getFavoriteAuthorsCsv() { return favoriteAuthorsCsv; }
    public void setFavoriteAuthorsCsv(String favoriteAuthorsCsv) { this.favoriteAuthorsCsv = favoriteAuthorsCsv; }
}
