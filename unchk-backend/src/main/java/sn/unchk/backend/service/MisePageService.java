package sn.unchk.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.Locale;

/**
 * Fournit les éléments de mise en page communs à tous les documents PDF
 * générés par le service : en-tête institutionnel, polices standardisées,
 * pied de page avec date/heure de génération.
 */
@Component
public class MisePageService {

    @Value("${unchk.universite.nom}")
    private String nomUniversite;

    @Value("${unchk.universite.sigle}")
    private String sigleUniversite;

    @Value("${unchk.universite.ville}")
    private String villeUniversite;

    // ─── Polices standardisées ────────────────────────────────────────────────
    public static final Font POLICE_TITRE        = new Font(Font.HELVETICA, 16, Font.BOLD, new Color(0, 51, 102));
    public static final Font POLICE_SOUS_TITRE    = new Font(Font.HELVETICA, 12, Font.BOLD, Color.DARK_GRAY);
    public static final Font POLICE_NORMALE       = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    public static final Font POLICE_NORMALE_GRASSE= new Font(Font.HELVETICA, 10, Font.BOLD, Color.BLACK);
    public static final Font POLICE_PETITE        = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);
    public static final Font POLICE_ENTETE_TABLE  = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);

    private static final Color COULEUR_ENTETE_TABLE = new Color(0, 51, 102); // bleu institutionnel

    /**
     * Ajoute l'en-tête officiel de l'université en haut du document.
     */
    public void ajouterEnTete(Document document, String titreDocument) throws DocumentException {
        Paragraph universite = new Paragraph(nomUniversite.toUpperCase(), POLICE_TITRE);
        universite.setAlignment(Element.ALIGN_CENTER);
        document.add(universite);

        Paragraph sousLigne = new Paragraph(sigleUniversite + " — " + villeUniversite, POLICE_PETITE);
        sousLigne.setAlignment(Element.ALIGN_CENTER);
        document.add(sousLigne);

        document.add(ligneSeparatrice());

        Paragraph titre = new Paragraph(titreDocument, POLICE_SOUS_TITRE);
        titre.setAlignment(Element.ALIGN_CENTER);
        titre.setSpacingBefore(15);
        titre.setSpacingAfter(15);
        document.add(titre);
    }

    /**
     * Ajoute le pied de page avec la date de génération.
     */
    public void ajouterPiedDePage(Document document) throws DocumentException {
        Paragraph espace = new Paragraph(" ");
        espace.setSpacingBefore(20);
        document.add(espace);

        String dateGeneration = LocalDate.now()
            .format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH));

        Paragraph piedDePage = new Paragraph(
            "Document généré électroniquement le " + dateGeneration + " — " + sigleUniversite,
            POLICE_PETITE
        );
        piedDePage.setAlignment(Element.ALIGN_CENTER);
        document.add(piedDePage);
    }

    /**
     * Ligne de séparation horizontale (table 1 colonne avec bordure inférieure).
     */
    public PdfPTable ligneSeparatrice() {
        PdfPTable table = new PdfPTable(1);
        try {
            table.setWidthPercentage(100);
        } catch (Exception ignored) { }
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(1.5f);
        cell.setBorderColor(new Color(0, 51, 102));
        cell.setFixedHeight(2);
        table.addCell(cell);
        return table;
    }

    /** Crée une cellule d'en-tête de table (fond bleu, texte blanc) */
    public PdfPCell celluleEntete(String texte) {
        PdfPCell cell = new PdfPCell(new Phrase(texte, POLICE_ENTETE_TABLE));
        cell.setBackgroundColor(COULEUR_ENTETE_TABLE);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    /** Crée une cellule de données standard */
    public PdfPCell celluleDonnee(String texte) {
        return celluleDonnee(texte, Element.ALIGN_LEFT);
    }

    public PdfPCell celluleDonnee(String texte, int alignement) {
        PdfPCell cell = new PdfPCell(new Phrase(texte != null ? texte : "", POLICE_NORMALE));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignement);
        return cell;
    }

    /** Capitalise le jour de la semaine français pour affichage propre */
    public String formaterDate(String isoDate) {
        if (isoDate == null || isoDate.isBlank()) return "—";
        try {
            LocalDate date = LocalDate.parse(isoDate.substring(0, 10));
            String jour = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.FRENCH);
            return jour.substring(0, 1).toUpperCase() + jour.substring(1) + " "
                + date.format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH));
        } catch (Exception e) {
            return isoDate;
        }
    }
}
