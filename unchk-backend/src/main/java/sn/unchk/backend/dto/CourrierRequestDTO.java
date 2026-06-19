package sn.unchk.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Corps de la requête POST /api/documents/courrier.
 * Correspond aux colonnes de la table `courriers` (référence déjà
 * générée côté middle : C{A|D}-{année}-{numéro}).
 */
public class CourrierRequestDTO {

    @NotBlank(message = "La référence est requise")
    private String reference;

    @NotBlank(message = "L'objet est requis")
    private String objet;

    @NotBlank(message = "L'expéditeur/destinataire est requis")
    private String expediteur;

    @NotBlank(message = "Le type est requis (arrivee ou depart)")
    private String type;

    private String description;

    @NotBlank(message = "La date du courrier est requise")
    private String dateCourrier; // ISO YYYY-MM-DD

    private String traiteParNom;
    private String traiteParPrenom;

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getObjet() { return objet; }
    public void setObjet(String objet) { this.objet = objet; }

    public String getExpediteur() { return expediteur; }
    public void setExpediteur(String expediteur) { this.expediteur = expediteur; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDateCourrier() { return dateCourrier; }
    public void setDateCourrier(String dateCourrier) { this.dateCourrier = dateCourrier; }

    public String getTraiteParNom() { return traiteParNom; }
    public void setTraiteParNom(String traiteParNom) { this.traiteParNom = traiteParNom; }

    public String getTraiteParPrenom() { return traiteParPrenom; }
    public void setTraiteParPrenom(String traiteParPrenom) { this.traiteParPrenom = traiteParPrenom; }
}
