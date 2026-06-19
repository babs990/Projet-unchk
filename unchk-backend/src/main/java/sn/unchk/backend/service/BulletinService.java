package sn.unchk.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import sn.unchk.backend.dto.BulletinRequestDTO;
import sn.unchk.backend.dto.EtudiantInfoDTO;
import sn.unchk.backend.dto.NoteDTO;
import sn.unchk.backend.exception.GenerationDocumentException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

/**
 * Génère le bulletin de notes PDF d'un étudiant pour UN semestre donné.
 *
 * Règle métier reprise du Middle Tier : moyenne pondérée =
 *   SUM(note × crédit) / SUM(crédit)
 * recalculée ici à partir des notes du semestre transmises par le middle.
 */
@Service
public class BulletinService {

    private final MisePageService misePage;

    public BulletinService(MisePageService misePage) {
        this.misePage = misePage;
    }

    public byte[] genererBulletin(BulletinRequestDTO requete) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            EtudiantInfoDTO etudiant = requete.getEtudiant();
            List<NoteDTO> notes = requete.getNotes();

            misePage.ajouterEnTete(document, "BULLETIN DE NOTES — " + requete.getSemestre());

            document.add(blocIdentiteEtudiant(etudiant));
            document.add(new Paragraph(" "));
            document.add(tableNotes(notes));
            document.add(new Paragraph(" "));
            document.add(blocSyntheseMoyenne(notes));

            misePage.ajouterPiedDePage(document);

            document.close();
            return baos.toByteArray();

        } catch (DocumentException e) {
            throw new GenerationDocumentException("Impossible de générer le bulletin PDF", e);
        }
    }

    private PdfPTable blocIdentiteEtudiant(EtudiantInfoDTO e) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 2});

        ajouterLigneIdentite(table, "INE", e.getIne());
        ajouterLigneIdentite(table, "Nom et prénom", e.getNom() + " " + e.getPrenom());
        ajouterLigneIdentite(table, "Date de naissance",
            e.getDateNaissance() != null ? misePage.formaterDate(e.getDateNaissance()) : "—");
        ajouterLigneIdentite(table, "Lieu de naissance", e.getLieuNaissance() != null ? e.getLieuNaissance() : "—");
        ajouterLigneIdentite(table, "Formation", e.getFormationIntitule() != null ? e.getFormationIntitule() : "—");
        ajouterLigneIdentite(table, "Promotion", e.getPromo() != null ? e.getPromo() : "—");

        return table;
    }

    private void ajouterLigneIdentite(PdfPTable table, String libelle, String valeur) {
        PdfPCell celluleLibelle = new PdfPCell(new Phrase(libelle, MisePageService.POLICE_NORMALE_GRASSE));
        celluleLibelle.setBorder(Rectangle.NO_BORDER);
        celluleLibelle.setPadding(4);
        table.addCell(celluleLibelle);

        PdfPCell celluleValeur = new PdfPCell(new Phrase(valeur, MisePageService.POLICE_NORMALE));
        celluleValeur.setBorder(Rectangle.NO_BORDER);
        celluleValeur.setPadding(4);
        table.addCell(celluleValeur);
    }

    private PdfPTable tableNotes(List<NoteDTO> notes) {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 1, 1, 2});

        table.addCell(misePage.celluleEntete("Matière"));
        table.addCell(misePage.celluleEntete("Note /20"));
        table.addCell(misePage.celluleEntete("Crédits"));
        table.addCell(misePage.celluleEntete("Enseignant"));

        for (NoteDTO n : notes) {
            table.addCell(misePage.celluleDonnee(n.getMatiere()));
            table.addCell(misePage.celluleDonnee(String.format("%.2f", n.getNote()), Element.ALIGN_CENTER));
            table.addCell(misePage.celluleDonnee(String.valueOf(n.getCredit()), Element.ALIGN_CENTER));
            String enseignant = (n.getEnseignantPrenom() != null ? n.getEnseignantPrenom() + " " : "")
                + (n.getEnseignantNom() != null ? n.getEnseignantNom() : "");
            table.addCell(misePage.celluleDonnee(enseignant.isBlank() ? "—" : enseignant.trim()));
        }

        return table;
    }

    private PdfPTable blocSyntheseMoyenne(List<NoteDTO> notes) {
        double sommeNoteCredit = notes.stream().mapToDouble(n -> n.getNote() * n.getCredit()).sum();
        int sommeCredits = notes.stream().mapToInt(NoteDTO::getCredit).sum();
        double moyenne = sommeCredits > 0 ? sommeNoteCredit / sommeCredits : 0;

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPCell libelle = new PdfPCell(new Phrase("MOYENNE PONDÉRÉE", MisePageService.POLICE_NORMALE_GRASSE));
        libelle.setBackgroundColor(new Color(230, 240, 250));
        libelle.setPadding(8);
        table.addCell(libelle);

        PdfPCell valeur = new PdfPCell(new Phrase(
            String.format("%.2f / 20", moyenne),
            new Font(Font.HELVETICA, 12, Font.BOLD, moyenne >= 10 ? new Color(0, 120, 0) : new Color(180, 0, 0))
        ));
        valeur.setBackgroundColor(new Color(230, 240, 250));
        valeur.setPadding(8);
        valeur.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(valeur);

        PdfPCell totalCreditsLibelle = new PdfPCell(new Phrase("Total crédits ECTS", MisePageService.POLICE_NORMALE));
        totalCreditsLibelle.setPadding(6);
        table.addCell(totalCreditsLibelle);

        PdfPCell totalCreditsValeur = new PdfPCell(new Phrase(String.valueOf(sommeCredits), MisePageService.POLICE_NORMALE));
        totalCreditsValeur.setPadding(6);
        totalCreditsValeur.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(totalCreditsValeur);

        return table;
    }
}
