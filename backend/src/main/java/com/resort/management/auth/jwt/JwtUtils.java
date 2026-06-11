package com.resort.management.auth.jwt;

import com.resort.management.auth.service.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.web.util.WebUtils;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration-ms}")
    private int jwtExpirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }

    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "jwt");
        if (cookie != null) {
            return cookie.getValue();
        } else {
            return null;
        }
    }

    public ResponseCookie generateJwtCookie(Authentication authentication) {
        String jwt = generateJwtToken(authentication);
        return ResponseCookie.from("jwt", jwt)
                .path("/api")
                .maxAge(jwtExpirationMs / 1000)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from("jwt", "")
                .path("/api")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    public String getJwtRefreshFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "jwt-refresh");
        if (cookie != null) {
            return cookie.getValue();
        } else {
            return null;
        }
    }

    @Value("${jwt.refresh-token-expiration-ms}")
    private Long refreshTokenDurationMs;

    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        return ResponseCookie.from("jwt-refresh", refreshToken)
                .path("/api/v1/auth/refreshtoken")
                .maxAge(refreshTokenDurationMs / 1000)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    public ResponseCookie getCleanJwtRefreshCookie() {
        return ResponseCookie.from("jwt-refresh", "")
                .path("/api/v1/auth/refreshtoken")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }
}
