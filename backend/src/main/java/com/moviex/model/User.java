package com.moviex.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String password;
    private Set<Role> roles = new HashSet<>();
    private boolean isVerified = false;
    private String verificationToken;
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.BASIC;
    private Set<String> watchlist = new HashSet<>();
    private String language = "en";
    private boolean darkMode = false;
    private boolean subtitle = true;
    private boolean online = false;
    private String currentlyWatching;
    private LocalDateTime lastLoginAt;
    private LocalDateTime lastSeenAt;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }
    public SubscriptionPlan getSubscriptionPlan() { return subscriptionPlan; }
    public void setSubscriptionPlan(SubscriptionPlan subscriptionPlan) { this.subscriptionPlan = subscriptionPlan; }
    public Set<String> getWatchlist() { return watchlist; }
    public void setWatchlist(Set<String> watchlist) { this.watchlist = watchlist; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public boolean isDarkMode() { return darkMode; }
    public void setDarkMode(boolean darkMode) { this.darkMode = darkMode; }
    public boolean isSubtitle() { return subtitle; }
    public void setSubtitle(boolean subtitle) { this.subtitle = subtitle; }
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
    public String getCurrentlyWatching() { return currentlyWatching; }
    public void setCurrentlyWatching(String currentlyWatching) { this.currentlyWatching = currentlyWatching; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
}
