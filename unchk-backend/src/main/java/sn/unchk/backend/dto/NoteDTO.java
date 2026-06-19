package sn.unchk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Une ligne de note, telle que stockée dans la table `notes`.
 * matiere / note (0-20) / credit (ECTS) / semestre.
 */
public class NoteDTO {

    @NotBlank(message = "La matière est requise")
    private String matiere;

    @NotNull(message = "La note est requise")
    private Double note;

    @NotNull(message = "Le crédit est requis")
    private Integer credit;

    @NotBlank(message = "Le semestre est requis")
    private String semestre;

    private String enseignantNom;
    private String enseignantPrenom;

    public String getMatiere() { return matiere; }
    public void setMatiere(String matiere) { this.matiere = matiere; }

    public Double getNote() { return note; }
    public void setNote(Double note) { this.note = note; }

    public Integer getCredit() { return credit; }
    public void setCredit(Integer credit) { this.credit = credit; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public String getEnseignantNom() { return enseignantNom; }
    public void setEnseignantNom(String enseignantNom) { this.enseignantNom = enseignantNom; }

    public String getEnseignantPrenom() { return enseignantPrenom; }
    public void setEnseignantPrenom(String enseignantPrenom) { this.enseignantPrenom = enseignantPrenom; }
}
