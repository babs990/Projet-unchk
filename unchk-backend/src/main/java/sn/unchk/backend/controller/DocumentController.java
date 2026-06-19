package sn.unchk.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.unchk.backend.dto.BulletinRequestDTO;
import sn.unchk.backend.dto.CourrierRequestDTO;
import sn.unchk.backend.dto.NoteServiceRequestDTO;
import sn.unchk.backend.dto.ReleveRequestDTO;
import sn.unchk.backend.service.BulletinService;
import sn.unchk.backend.service.CourrierService;
import sn.unchk.backend.service.NoteServiceDocumentService;
import sn.unchk.backend.service.ReleveService;

/**
 * Expose les endpoints de generation de documents PDF.
 *
 * Tous les endpoints :
 *  - sont appeles UNIQUEMENT par le Middle Tier Express.js (jamais par Angular directement)
 *  - sont proteges par le header X-Internal-Token (voir InternalTokenFilter)
 *  - recoivent du JSON et renvoient un flux binaire application/pdf
 *  - n'accedent JAMAIS directement a PostgreSQL
 */
@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents", description = "Generation de documents PDF (bulletins, releves, courriers, notes de service)")
public class DocumentController {

    private final BulletinService bulletinService;
    private final ReleveService releveService;
    private final CourrierService courrierService;
    private final NoteServiceDocumentService noteServiceDocumentService;

    public DocumentController(BulletinService bulletinService,
                               ReleveService releveService,
                               CourrierService courrierService,
                               NoteServiceDocumentService noteServiceDocumentService) {
        this.bulletinService = bulletinService;
        this.releveService = releveService;
        this.courrierService = courrierService;
        this.noteServiceDocumentService = noteServiceDocumentService;
    }

    @Operation(summary = "Genere le bulletin de notes PDF d'un etudiant pour un semestre")
    @PostMapping(value = "/bulletin", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> genererBulletin(@Valid @RequestBody BulletinRequestDTO requete) {
        byte[] pdf = bulletinService.genererBulletin(requete);
        String nomFichier = "bulletin_" + requete.getEtudiant().getIne() + "_" + sanitiser(requete.getSemestre()) + ".pdf";
        return reponsePdf(pdf, nomFichier);
    }

    @Operation(summary = "Genere le releve de notes PDF complet (toute la scolarite) d'un etudiant")
    @PostMapping(value = "/releve", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> genererReleve(@Valid @RequestBody ReleveRequestDTO requete) {
        byte[] pdf = releveService.genererReleve(requete);
        String nomFichier = "releve_" + requete.getEtudiant().getIne() + ".pdf";
        return reponsePdf(pdf, nomFichier);
    }

    @Operation(summary = "Genere la mise en forme officielle PDF d'un courrier administratif")
    @PostMapping(value = "/courrier", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> genererCourrier(@Valid @RequestBody CourrierRequestDTO requete) {
        byte[] pdf = courrierService.genererCourrier(requete);
        String nomFichier = "courrier_" + sanitiser(requete.getReference()) + ".pdf";
        return reponsePdf(pdf, nomFichier);
    }

    @Operation(summary = "Genere la mise en forme officielle PDF d'une note de service")
    @PostMapping(value = "/note-service", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> genererNoteService(@Valid @RequestBody NoteServiceRequestDTO requete) {
        byte[] pdf = noteServiceDocumentService.genererNoteService(requete);
        String nomFichier = "note_service_" + sanitiser(requete.getReference()) + ".pdf";
        return reponsePdf(pdf, nomFichier);
    }

    private ResponseEntity<byte[]> reponsePdf(byte[] contenu, String nomFichier) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nomFichier + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(contenu);
    }

    /** Nettoie une chaîne pour un usage sûr comme nom de fichier */
    private String sanitiser(String valeur) {
        if (valeur == null) return "document";
        return valeur.replaceAll("[^a-zA-Z0-9_\\-]", "_");
    }
}
