package sn.unchk.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sante")
@Tag(name = "Sante", description = "Healthcheck du service")
public class SanteController {

    @Operation(summary = "Verifie que le service de generation de documents est operationnel")
    @GetMapping
    public Map<String, Object> sante() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Service UNCHK Backend (generation PDF) operationnel");
        body.put("heure", LocalDateTime.now().toString());
        body.put("version", "1.0.0");
        return body;
    }
}
