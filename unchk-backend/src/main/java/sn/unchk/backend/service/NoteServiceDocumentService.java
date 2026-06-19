package sn.unchk.backend.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import sn.unchk.backend.dto.NoteServiceRequestDTO;
import sn.unchk.backend.exception.GenerationDocumentException;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Genere la mise en forme officielle PDF d'une note de service
 * (interne, externe ou administrative), a partir de la fiche deja creee
 * et referencee cote Middle Tier (table notes_service).
 */
@Service
public class NoteServiceDocumentService {

    private final MisePageService misePage;

    public NoteServiceDocumentService(MisePageService misePage) {
        this.misePage = misePage;
    }

    public byte[] genererNoteService(NoteServiceRequestDTO requete) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 60, 60, 60, 60);
            PdfWriter.getInstance(document, baos);
            document.open();

            misePage.ajouterEnTete(document, "NOTE DE SERVICE");

            Paragraph reference = new Paragraph("Reference : " + requete.getReference(), MisePageService.POLICE_NORMALE_GRASSE);
            reference.setAlignment(Element.ALIGN_RIGHT);
            document.add(reference);

            String dateAffichee = requete.getCreeLe() != null
                ? misePage.formaterDate(requete.getCreeLe())
                : LocalDate.now().format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH));

            Paragraph date = new Paragraph("Date : " + dateAffichee, MisePageService.POLICE_NORMALE);
            date.setAlignment(Element.ALIGN_RIGHT);
            date.setSpacingAfter(20);
            document.add(date);

            Paragraph destinataire = new Paragraph("A l'attention de : " + requete.getDestinataire(), MisePageService.POLICE_NORMALE_GRASSE);
            destinataire.setSpacingAfter(10);
            document.add(destinataire);

            String libelleType;
            switch (requete.getType()) {
                case "interne":        libelleType = "Note interne"; break;
                case "externe":        libelleType = "Note externe"; break;
                case "administrative": libelleType = "Note administrative"; break;
                default:               libelleType = requete.getType();
            }
            Paragraph typeP = new Paragraph("Type : " + libelleType, MisePageService.POLICE_NORMALE);
            typeP.setSpacingAfter(15);
            document.add(typeP);

            Paragraph objetLibelle = new Paragraph("Objet :", MisePageService.POLICE_NORMALE_GRASSE);
            document.add(objetLibelle);
            Paragraph objet = new Paragraph(requete.getObjet(), MisePageService.POLICE_NORMALE);
            objet.setSpacingAfter(15);
            document.add(objet);

            if (requete.getContenu() != null && !requete.getContenu().isBlank()) {
                Paragraph contenu = new Paragraph(requete.getContenu(), MisePageService.POLICE_NORMALE);
                contenu.setSpacingAfter(25);
                document.add(contenu);
            }

            if (requete.getAuteurNom() != null) {
                Paragraph espace = new Paragraph(" ");
                espace.setSpacingBefore(30);
                document.add(espace);

                Paragraph auteur = new Paragraph(
                    "Emis par : " + (requete.getAuteurPrenom() != null ? requete.getAuteurPrenom() + " " : "")
                        + requete.getAuteurNom(),
                    MisePageService.POLICE_NORMALE
                );
                auteur.setAlignment(Element.ALIGN_RIGHT);
                document.add(auteur);
            }

            misePage.ajouterPiedDePage(document);

            document.close();
            return baos.toByteArray();

        } catch (DocumentException e) {
            throw new GenerationDocumentException("Impossible de generer la note de service PDF", e);
        }
    }
}
