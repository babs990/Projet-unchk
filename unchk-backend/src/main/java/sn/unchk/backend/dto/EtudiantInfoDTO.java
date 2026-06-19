package sn.unchk.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Informations d'identité de l'étudiant, transmises par le Middle Tier.
 * Correspond aux colonnes jointes utilisateurs + etudiants.
 */
public class EtudiantInfoDTO {

    @NotBlank(message = "L'INE de l'étudiant est requis")
    private String ine;

    @NotBlank(message = "Le nom est requis")
    private String nom;

    @NotBlank(message = "Le prénom est requis")
    private String prenom;

    private String dateNaissance;   // format ISO : YYYY-MM-DD
    private String lieuNaissance;
    private String sexe;            // "M" ou "F"
    private String formationIntitule;
    private String promo;

    public String getIne() { return ine; }
    public void setIne(String ine) { this.ine = ine; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(String dateNaissance) { this.dateNaissance = dateNaissance; }

    public String getLieuNaissance() { return lieuNaissance; }
    public void setLieuNaissance(String lieuNaissance) { this.lieuNaissance = lieuNaissance; }

    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }

    public String getFormationIntitule() { return formationIntitule; }
    public void setFormationIntitule(String formationIntitule) { this.formationIntitule = formationIntitule; }

    public String getPromo() { return promo; }
    public void setPromo(String promo) { this.promo = promo; }
}
