package com.eathub.common.controller;

import com.eathub.common.service.FavoriteService;
import com.eathub.common.service.UserService;
import com.eathub.common.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    @PostMapping("/toggle")
    public ResponseEntity<Boolean> toggleFavorite(
            @RequestHeader("Authorization") String token,
            @RequestParam String targetId,
            @RequestParam String targetType) {
        User user = userService.getUserByToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(favoriteService.toggleFavorite(user.getId(), targetId, targetType));
    }

    @GetMapping("/ids")
    public ResponseEntity<Map<String, List<String>>> getFavoriteIds(@RequestHeader("Authorization") String token) {
        User user = userService.getUserByToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(favoriteService.getAllFavoriteIds(user.getId()));
    }

    @GetMapping("/details")
    public ResponseEntity<List<Object>> getDetailedFavorites(
            @RequestHeader("Authorization") String token,
            @RequestParam String targetType) {
        User user = userService.getUserByToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(favoriteService.getDetailedFavorites(user.getId(), targetType));
    }
}
