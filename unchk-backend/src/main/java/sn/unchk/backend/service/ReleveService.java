package sn.unchk.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import sn.unchk.backend.dto.EtudiantInfoDTO;
import sn.unchk.backend.dto.NoteDTO;
import sn.unchk.backend.dto.ReleveRequestDTO;
import sn.unchk.backend.exception.GenerationDocumentException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Génère le relevé de notes complet d'un étudiant : toutes les matières
 * de tous les semestres, regroupées par semestre, avec la moyenne
 * pondérée de chaque semestre et la moyenne générale du cursus.
 */
@Service
public class ReleveService {

    private final MisePageService misePage;

    public ReleveService(MisePageService misePage) {
        this.misePage = misePage;
    }

    public byte[] genererReleve(ReleveRequestDTO requete) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            EtudiantInfoDTO etudiant = requete.getEtudiant();
            List<NoteDTO> notes = requete.getNotes();

            misePage.ajouterEnTete(document, "RELEVÉ DE NOTES — SCOLARITÉ COMPLÈTE");

            document.add(blocIdentite(etudiant));
            document.add(new Paragraph(" "));

            // Regroupement par semestre, dans l'ordre d'apparition
            Map<String, List<NoteDTO>> parSemestre = notes.stream()
                .collect(Collectors.groupingBy(NoteDTO::getSemestre, LinkedHashMap::new, Collectors.toList()));

            double sommeGeneraleNoteCredit = 0;
            int sommeGeneraleCredits = 0;

            for (Map.Entry<String, List<NoteDTO>> entree : parSemestre.entrySet()) {
                String semestre = entree.getKey();
                List<NoteDTO> notesSemestre = entree.getValue();

                Paragraph titreSemestre = new Paragraph(semestre, MisePageService.POLICE_SOUS_TITRE);
                titreSemestre.setSpacingBefore(15);
                titreSemestre.setSpacingAfter(8);
                document.add(titreSemestre);

                document.add(tableNotesSemestre(notesSemestre));

                double sommeNoteCredit = notesSemestre.stream().mapToDouble(n -> n.getNote() * n.getCredit()).sum();
                int sommeCredits = notesSemestre.stream().mapToInt(NoteDTO::getCredit).sum();
                double moyenneSemestre = sommeCredits > 0 ? sommeNoteCredit / sommeCredits : 0;

                Paragraph moyenneSemestreP = new Paragraph(
                    String.format("Moyenne du semestre : %.2f/20  (Crédits : %d)", moyenneSemestre, sommeCredits),
                    MisePageService.POLICE_NORMALE_GRASSE
                );
                moyenneSemestreP.setAlignment(Element.ALIGN_RIGHT);
                moyenneSemestreP.setSpacingBefore(5);
                document.add(moyenneSemestreP);

                sommeGeneraleNoteCredit += sommeNoteCredit;
                sommeGeneraleCredits += sommeCredits;
            }

            document.add(new Paragraph(" "));
            document.add(misePage.ligneSeparatrice());
            document.add(blocMoyenneGenerale(
                sommeGeneraleCredits > 0 ? sommeGeneraleNoteCredit / sommeGeneraleCredits : 0,
                sommeGeneraleCredits
            ));

            misePage.ajouterPiedDePage(document);

            document.close();
            return baos.toByteArray();

        } catch (DocumentException e) {
            throw new GenerationDocumentException("Impossible de générer le relevé de notes PDF", e);
        }
    }

    private PdfPTable blocIdentite(EtudiantInfoDTO e) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 2});

        ajouterLigne(table, "INE", e.getIne());
        ajouterLigne(table, "Nom et prénom", e.getNom() + " " + e.getPrenom());
        ajouterLigne(table, "Formation", e.getFormationIntitule() != null ? e.getFormationIntitule() : "—");
        ajouterLigne(table, "Promotion", e.getPromo() != null ? e.getPromo() : "—");

        return table;
    }

    private void ajouterLigne(PdfPTable table, String libelle, String valeur) {
        PdfPCell celluleLibelle = new PdfPCell(new Phrase(libelle, MisePageService.POLICE_NORMALE_GRASSE));
        celluleLibelle.setBorder(Rectangle.NO_BORDER);
        celluleLibelle.setPadding(4);
        table.addCell(celluleLibelle);

        PdfPCell celluleValeur = new PdfPCell(new Phrase(valeur, MisePageService.POLICE_NORMALE));
        celluleValeur.setBorder(Rectangle.NO_BORDER);
        celluleValeur.setPadding(4);
        table.addCell(celluleValeur);
    }

    private PdfPTable tableNotesSemestre(List<NoteDTO> notes) {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 1, 1});

        table.addCell(misePage.celluleEntete("Matière"));
        table.addCell(misePage.celluleEntete("Note /20"));
        table.addCell(misePage.celluleEntete("Crédits"));

        for (NoteDTO n : notes) {
            table.addCell(misePage.celluleDonnee(n.getMatiere()));
            table.addCell(misePage.celluleDonnee(String.format("%.2f", n.getNote()), Element.ALIGN_CENTER));
            table.addCell(misePage.celluleDonnee(String.valueOf(n.getCredit()), Element.ALIGN_CENTER));
        }

        return table;
    }

    private PdfPTable blocMoyenneGenerale(double moyenne, int totalCredits) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.setSpacingBefore(10);

        PdfPCell libelle = new PdfPCell(new Phrase("MOYENNE GÉNÉRALE DU CURSUS", MisePageService.POLICE_NORMALE_GRASSE));
        libelle.setBackgroundColor(new Color(0, 51, 102));
        libelle.getPhrase().getFont().setColor(Color.WHITE);
        libelle.setPadding(10);
        table.addCell(libelle);

        PdfPCell valeur = new PdfPCell(new Phrase(
            String.format("%.2f / 20", moyenne),
            new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE)
        ));
        valeur.setBackgroundColor(new Color(0, 51, 102));
        valeur.setHorizontalAlignment(Element.ALIGN_CENTER);
        valeur.setPadding(10);
        table.addCell(valeur);

        return table;
    }
}
