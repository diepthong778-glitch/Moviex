package com.moviex.service;

import com.moviex.dto.MovieDto;
import com.moviex.dto.WatchlistAddRequest;
import com.moviex.model.User;
import com.moviex.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WatchlistServiceImpl implements WatchlistService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final MovieService movieService;

    public WatchlistServiceImpl(UserRepository userRepository,
                                CurrentUserService currentUserService,
                                MovieService movieService) {
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.movieService = movieService;
    }

    @Override
    public void addToWatchlist(WatchlistAddRequest request) {
        if (request.getMovieId() == null || request.getMovieId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "movieId is required");
        }

        User user = currentUserService.getCurrentUser();
        movieService.getMovieById(request.getMovieId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        user.getWatchlist().add(request.getMovieId());
        userRepository.save(user);
    }

    @Override
    public List<MovieDto> getWatchlist() {
        User user = currentUserService.getCurrentUser();
        return user.getWatchlist().stream()
                .map(movieService::getMovieById)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
    }

    @Override
    public void removeFromWatchlist(String movieId) {
        User user = currentUserService.getCurrentUser();
        user.getWatchlist().remove(movieId);
        userRepository.save(user);
    }
}
