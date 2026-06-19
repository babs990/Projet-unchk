package sn.unchk.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Vérifie que le contexte Spring démarre correctement
 * (configuration, beans, filtre interne).
 */
@SpringBootTest
@TestPropertySource(properties = {
    "unchk.internal-token=test_token"
})
class UnchkBackendApplicationTests {

    @Test
    void contextLoads() {
        // Le test réussit si le contexte Spring démarre sans exception
    }
}
