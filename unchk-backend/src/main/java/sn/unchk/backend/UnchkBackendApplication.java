package sn.unchk.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée du service Spring Boot UNCHK.
 *
 * Ce service est STATELESS et n'a AUCUN accès direct à la base de données
 * PostgreSQL. Il reçoit les données nécessaires en JSON depuis le Middle
 * Tier Express.js, effectue des calculs/générations complexes (PDF), et
 * renvoie le résultat (binaire ou JSON) en synchrone.
 *
 * Rôle exclusif : génération de documents PDF
 *  - Bulletins de notes étudiants
 *  - Relevés de notes par semestre
 *  - Courriers administratifs (mise en forme officielle)
 *  - Notes de service (mise en forme officielle)
 */
@SpringBootApplication
public class UnchkBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnchkBackendApplication.class, args);
    }
}
