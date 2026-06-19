package sn.unchk.backend.exception;

/**
 * Exception levée lors d'un échec de génération de document
 * (données incohérentes, erreur OpenPDF, etc.).
 */
public class GenerationDocumentException extends RuntimeException {

    public GenerationDocumentException(String message) {
        super(message);
    }

    public GenerationDocumentException(String message, Throwable cause) {
        super(message, cause);
    }
}
