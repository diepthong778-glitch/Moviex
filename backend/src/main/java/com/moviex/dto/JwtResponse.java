package com.moviex.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private List<String> roles;
    private String subscriptionPlan;

    public JwtResponse(String accessToken, String id, String email, List<String> roles, String subscriptionPlan) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.roles = roles;
        this.subscriptionPlan = subscriptionPlan;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public String getSubscriptionPlan() {
    	return subscriptionPlan;
    }
}
