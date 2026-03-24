package com.moviex.config;

import com.moviex.model.Movie;
import com.moviex.repository.MovieRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moviex.model.Role;
import com.moviex.model.SubscriptionPlan;
import com.moviex.model.User;
import com.moviex.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(MovieRepository movieRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Users
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setEmail("admin@moviex.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRoles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER));
                admin.setVerified(true);
                admin.setSubscriptionPlan(SubscriptionPlan.PREMIUM);
                userRepository.save(admin);

                User user = new User();
                user.setEmail("user@moviex.com");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRoles(Set.of(Role.ROLE_USER));
                user.setVerified(true);
                user.setSubscriptionPlan(SubscriptionPlan.BASIC);
                userRepository.save(user);

                System.out.println("✅ Database seeded with Admin and Default User!");
            }

            // Seed Movies
            if (movieRepository.count() == 0) {
                List<Movie> sampleMovies = List.of(
                        new Movie(null, "Big Buck Bunny", "Animation", 2008,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                                SubscriptionPlan.BASIC),

                        new Movie(null, "Elephant's Dream", "Animation", 2006,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                                SubscriptionPlan.BASIC),

                        new Movie(null, "Sintel", "Fantasy", 2010,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                                SubscriptionPlan.STANDARD),

                        new Movie(null, "Tears of Steel", "Sci-Fi", 2012,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                                SubscriptionPlan.PREMIUM),

                        new Movie(null, "Subaru Outback", "Documentary", 2020,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                                SubscriptionPlan.BASIC),

                        new Movie(null, "Volkswagen GTI Review", "Documentary", 2019,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullworx.mp4",
                                SubscriptionPlan.STANDARD),

                        new Movie(null, "What Care Can You Get", "Comedy", 2021,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
                                "https://www.w3schools.com/html/mov_bbb.mp4",
                                SubscriptionPlan.PREMIUM),

                        new Movie(null, "The Digital Frontier", "Sci-Fi", 2023,
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                SubscriptionPlan.STANDARD));

                movieRepository.saveAll(sampleMovies);
                System.out.println("✅ Database seeded with " + sampleMovies.size() + " sample movies!");
            } else {
                System.out.println("ℹ️ Database already contains movies. Skipping seed.");
            }
        };
    }
}
