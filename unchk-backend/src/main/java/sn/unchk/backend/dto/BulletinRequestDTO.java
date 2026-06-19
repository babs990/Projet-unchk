package sn.unchk.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Corps de la requête POST /api/documents/bulletin.
 * Le middle envoie l'étudiant, le semestre concerné et la liste de notes
 * de ce semestre (déjà filtrées côté Express).
 */
public class BulletinRequestDTO {

    @NotNull(message = "Les informations de l'étudiant sont requises")
    @Valid
    private EtudiantInfoDTO etudiant;

    @NotBlank(message = "Le semestre est requis")
    private String semestre;

    @NotEmpty(message = "Au moins une note est requise pour générer le bulletin")
    @Valid
    private List<NoteDTO> notes;

    public EtudiantInfoDTO getEtudiant() { return etudiant; }
    public void setEtudiant(EtudiantInfoDTO etudiant) { this.etudiant = etudiant; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public List<NoteDTO> getNotes() { return notes; }
    public void setNotes(List<NoteDTO> notes) { this.notes = notes; }
}
