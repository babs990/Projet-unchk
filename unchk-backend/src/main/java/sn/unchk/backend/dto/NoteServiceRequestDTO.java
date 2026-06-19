package sn.unchk.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Corps de la requête POST /api/documents/note-service.
 * Correspond aux colonnes de la table `notes_service` (référence déjà
 * générée côté middle : N{S|A}-{année}-{numéro}).
 */
public class NoteServiceRequestDTO {

    @NotBlank(message = "La référence est requise")
    private String reference;

    @NotBlank(message = "L'objet est requis")
    private String objet;

    @NotBlank(message = "Le destinataire est requis")
    private String destinataire;

    @NotBlank(message = "Le type est requis")
    private String type; // interne | externe | administrative

    private String contenu;

    private String auteurNom;
    private String auteurPrenom;
    private String creeLe; // ISO datetime

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getObjet() { return objet; }
    public void setObjet(String objet) { this.objet = objet; }

    public String getDestinataire() { return destinataire; }
    public void setDestinataire(String destinataire) { this.destinataire = destinataire; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getAuteurNom() { return auteurNom; }
    public void setAuteurNom(String auteurNom) { this.auteurNom = auteurNom; }

    public String getAuteurPrenom() { return auteurPrenom; }
    public void setAuteurPrenom(String auteurPrenom) { this.auteurPrenom = auteurPrenom; }

    public String getCreeLe() { return creeLe; }
    public void setCreeLe(String creeLe) { this.creeLe = creeLe; }
}
