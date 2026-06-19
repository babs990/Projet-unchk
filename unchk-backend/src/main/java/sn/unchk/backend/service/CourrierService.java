package sn.unchk.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import sn.unchk.backend.dto.CourrierRequestDTO;
import sn.unchk.backend.exception.GenerationDocumentException;

import java.io.ByteArrayOutputStream;

/**
 * Génère la mise en forme officielle PDF d'un courrier administratif
 * (arrivée ou départ), à partir de la fiche déjà créée et référencée
 * côté Middle Tier (table `courriers`).
 */
@Service
public class CourrierService {

    private final MisePageService misePage;

    public CourrierService(MisePageService misePage) {
        this.misePage = misePage;
    }

    public byte[] genererCourrier(CourrierRequestDTO requete) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 60, 60, 60, 60);
            PdfWriter.getInstance(document, baos);
            document.open();

            String libelleType = "arrivee".equalsIgnoreCase(requete.getType())
                ? "COURRIER ARRIVÉE" : "COURRIER DÉPART";

            misePage.ajouterEnTete(document, libelleType);

            // Référence et date, alignées à droite (convention administrative)
            Paragraph reference = new Paragraph("Référence : " + requete.getReference(), MisePageService.POLICE_NORMALE_GRASSE);
            reference.setAlignment(Element.ALIGN_RIGHT);
            document.add(reference);

            Paragraph date = new Paragraph(
                "Date : " + misePage.formaterDate(requete.getDateCourrier()),
                MisePageService.POLICE_NORMALE
            );
            date.setAlignment(Element.ALIGN_RIGHT);
            date.setSpacingAfter(20);
            document.add(date);

            // Bloc expéditeur/destinataire
            String libelleContact = "arrivee".equalsIgnoreCase(requete.getType()) ? "Expéditeur" : "Destinataire";
            Paragraph contact = new Paragraph(libelleContact + " : " + requete.getExpediteur(), MisePageService.POLICE_NORMALE_GRASSE);
            contact.setSpacingAfter(10);
            document.add(contact);

            // Objet
            Paragraph objetLibelle = new Paragraph("Objet :", MisePageService.POLICE_NORMALE_GRASSE);
            document.add(objetLibelle);
            Paragraph objet = new Paragraph(requete.getObjet(), MisePageService.POLICE_NORMALE);
            objet.setSpacingAfter(15);
            document.add(objet);

            // Description / contenu
            if (requete.getDescription() != null && !requete.getDescription().isBlank()) {
                Paragraph descLibelle = new Paragraph("Description :", MisePageService.POLICE_NORMALE_GRASSE);
                document.add(descLibelle);
                Paragraph description = new Paragraph(requete.getDescription(), MisePageService.POLICE_NORMALE);
                description.setSpacingAfter(20);
                document.add(description);
            }

            // Signature / traitement
            if (requete.getTraiteParNom() != null) {
                Paragraph espace = new Paragraph(" ");
                espace.setSpacingBefore(30);
                document.add(espace);

                Paragraph traitePar = new Paragraph(
                    "Traité par : " + (requete.getTraiteParPrenom() != null ? requete.getTraiteParPrenom() + " " : "")
                        + requete.getTraiteParNom(),
                    MisePageService.POLICE_NORMALE
                );
                traitePar.setAlignment(Element.ALIGN_RIGHT);
                document.add(traitePar);
            }

            misePage.ajouterPiedDePage(document);

            document.close();
            return baos.toByteArray();

        } catch (DocumentException e) {
            throw new GenerationDocumentException("Impossible de générer le courrier PDF", e);
        }
    }
}
