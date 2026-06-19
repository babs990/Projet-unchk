package sn.unchk.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Corps de la requête POST /api/documents/releve.
 * Contrairement au bulletin (un seul semestre), le relevé couvre
 * l'intégralité du cursus : toutes les notes de l'étudiant, tous
 * semestres confondus, regroupées et moyennées par semestre dans le PDF.
 */
public class ReleveRequestDTO {

    @NotNull(message = "Les informations de l'étudiant sont requises")
    @Valid
    private EtudiantInfoDTO etudiant;

    @NotEmpty(message = "Au moins une note est requise pour générer le relevé")
    @Valid
    private List<NoteDTO> notes;

    public EtudiantInfoDTO getEtudiant() { return etudiant; }
    public void setEtudiant(EtudiantInfoDTO etudiant) { this.etudiant = etudiant; }

    public List<NoteDTO> getNotes() { return notes; }
    public void setNotes(List<NoteDTO> notes) { this.notes = notes; }
}
