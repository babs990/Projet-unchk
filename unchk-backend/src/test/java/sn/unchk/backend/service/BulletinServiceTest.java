package sn.unchk.backend.service;

import org.junit.jupiter.api.Test;
import sn.unchk.backend.dto.BulletinRequestDTO;
import sn.unchk.backend.dto.EtudiantInfoDTO;
import sn.unchk.backend.dto.NoteDTO;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class BulletinServiceTest {

    @Test
    void genereUnPdfNonVidePourUnBulletinValide() {
        MisePageService misePage = new MisePageService();
        BulletinService service = new BulletinService(misePage);

        EtudiantInfoDTO etudiant = new EtudiantInfoDTO();
        etudiant.setIne("SN20260001");
        etudiant.setNom("Diallo");
        etudiant.setPrenom("Mamadou");
        etudiant.setFormationIntitule("Master Ingénierie Logicielle P8");
        etudiant.setPromo("2025");

        NoteDTO note1 = new NoteDTO();
        note1.setMatiere("Algorithmique avancée");
        note1.setNote(15.5);
        note1.setCredit(4);
        note1.setSemestre("S2 2026");

        NoteDTO note2 = new NoteDTO();
        note2.setMatiere("Architecture logicielle");
        note2.setNote(14.0);
        note2.setCredit(4);
        note2.setSemestre("S2 2026");

        BulletinRequestDTO requete = new BulletinRequestDTO();
        requete.setEtudiant(etudiant);
        requete.setSemestre("S2 2026");
        requete.setNotes(List.of(note1, note2));

        byte[] pdf = service.genererBulletin(requete);

        assertTrue(pdf.length > 0, "Le PDF généré ne doit pas être vide");
        // Signature PDF : les fichiers PDF commencent par "%PDF-"
        String entete = new String(pdf, 0, 5);
        assertTrue(entete.equals("%PDF-"), "Le fichier généré doit être un PDF valide");
    }
}
