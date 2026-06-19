package sn.unchk.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre de sécurité service-à-service.
 *
 * Ce service n'est JAMAIS exposé directement au frontend Angular : seul le
 * Middle Tier Express.js l'appelle. Chaque requête doit porter le header
 * X-Internal-Token avec la valeur partagée configurée dans application.yml
 * (unchk.internal-token / variable d'env INTERNAL_SERVICE_TOKEN).
 *
 * Les endpoints de documentation (Swagger) et de santé restent ouverts
 * pour faciliter le diagnostic en développement.
 */
@Component
public class InternalTokenFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-Internal-Token";

    @Value("${unchk.internal-token}")
    private String tokenAttendu;

    private static final String[] CHEMINS_PUBLICS = {
        "/api/sante",
        "/swagger-ui",
        "/api-docs",
        "/v3/api-docs"
    };

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String chemin = request.getRequestURI();
        for (String prefixe : CHEMINS_PUBLICS) {
            if (chemin.startsWith(prefixe)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String tokenRecu = request.getHeader(HEADER_NAME);

        if (tokenRecu == null || !tokenRecu.equals(tokenAttendu)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Accès refusé : token de service interne manquant ou invalide\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}
