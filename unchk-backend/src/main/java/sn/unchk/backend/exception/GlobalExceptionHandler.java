package sn.unchk.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestionnaire d'erreurs centralisé.
 * Le format de réponse JSON reprend volontairement la même structure que
 * le Middle Tier Express ({ success, message, errors }) pour que le
 * middle puisse relayer l'erreur au frontend Angular sans transformation.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Erreurs de validation des DTO (@Valid) → 422, comme express-validator côté middle */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> gererValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> erreurs = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> {
                Map<String, String> m = new LinkedHashMap<>();
                m.put("champ", fe.getField());
                m.put("message", fe.getDefaultMessage());
                return m;
            })
            .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", "Données de la requête invalides");
        body.put("errors", erreurs);

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    /** Échec de génération de document → 500 */
    @ExceptionHandler(GenerationDocumentException.class)
    public ResponseEntity<Map<String, Object>> gererGenerationDocument(GenerationDocumentException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", "Erreur lors de la génération du document : " + ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /** Toute autre erreur inattendue → 500 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> gererErreurGenerique(Exception ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", "Erreur interne du service de documents");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
