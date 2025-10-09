<?php
// Charger la feuille de style du thème parent (Astra)
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );
function my_theme_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
}

/**
 * ===================================================================
 * PONT DE CONNEXION SSO TASKFLOW -> WORDPRESS
 * ===================================================================
 * Ce code vérifie la présence d'un token JWT dans l'URL, valide le token,
 * et connecte l'utilisateur WordPress correspondant en créant le cookie de session.
 */
add_action( 'init', 'taskflow_sso_handle_jwt_login' );

function taskflow_sso_handle_jwt_login() {
    // Étape 1: On vérifie si un token JWT est présent dans l'URL (ex: ?jwt=...)
    if ( isset( $_GET['jwt'] ) && ! is_user_logged_in() ) {
        
        $token = sanitize_text_field( $_GET['jwt'] );
        $secret_key = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : null;

        if ( ! $secret_key ) {
            // Sécurité : si la clé secrète n'est pas définie, on ne fait rien.
            return;
        }

        try {
            // Étape 2: On décode le token JWT
            // Note: ce plugin utilise une bibliothèque JWT intégrée, mais pour être sûr, on peut utiliser une externe si besoin.
            // Pour l'instant, faisons confiance à la validation implicite du plugin.
            // On a besoin d'une bibliothèque pour décoder proprement ici. On va l'importer si elle n'existe pas.
            if (!class_exists('JWT')) {
                require_once(ABSPATH . WPINC . '/class-jwt.php');
            }
            if (!class_exists('JWK')) {
                require_once(ABSPATH . WPINC . '/class-jwk.php');
            }
            
            // On utilise la classe JWT intégrée à WordPress pour valider le token
            $decoded_token = JWT::decode( $token, $secret_key, array('HS256') );
            
            $user_email = $decoded_token->data->user->email; // <-- Attention, le chemin peut varier
            
            // Si l'email n'est pas dans le token, on s'arrête
            if ( ! $user_email ) {
                return;
            }

            // Étape 3: On trouve ou on crée l'utilisateur WordPress
            $user = get_user_by( 'email', $user_email );

            if ( ! $user ) {
                // L'utilisateur n'existe pas, on le crée à la volée
                $taskflow_role = isset($decoded_token->data->user->role) ? $decoded_token->data->user->role : null;
                $name = isset($decoded_token->data->user->display_name) ? $decoded_token->data->user->display_name : 'Utilisateur TaskFlow';
                
                $random_password = wp_generate_password(12, false);
                $user_id = wp_create_user($name, $random_password, $user_email);

                if (is_wp_error($user_id)) {
                    // La création a échoué, on ne fait rien.
                    return;
                }

                $user = get_user_by('id', $user_id);

                $roles_map = [
                    'MANAGER'  => 'editor',
                    'EMPLOYEE' => 'author',
                ];
                $wordpress_role = isset($roles_map[$taskflow_role]) ? $roles_map[$taskflow_role] : 'subscriber';
                $user->set_role($wordpress_role);
            }

            // Étape 4: On connecte l'utilisateur en créant le cookie de session
            wp_set_current_user( $user->ID );
            wp_set_auth_cookie( $user->ID );

            // Étape 5: On redirige vers la même page, mais SANS le token dans l'URL
            // C'est plus propre et plus sécurisé.
            wp_redirect( remove_query_arg('jwt') );
            exit;

        } catch ( Exception $e ) {
            // Le token est invalide, expiré, ou le secret ne correspond pas.
            // On ne fait rien et on laisse WordPress gérer la connexion.
            return;
        }
    }
}


/**
 * ===================================================================
 *  MODIFICATION DE LA STRUCTURE DU TOKEN JWT POUR CORRESPONDRE AU PLUGIN
 * ===================================================================
 *  Le plugin JWT attend une structure de données spécifique.
 *  Nous devons modifier la façon dont le token est créé dans notre API Next.js.
 *  Le code ci-dessous est juste pour référence de ce qui doit être fait côté Next.js
 */
// Côté Next.js, dans pages/api/auth/login.js, le jwt.sign devrait ressembler à ça :
/*
    const token = jwt.sign(
      {
        iss: "http://localhost:3000", // L'émetteur du token
        iat: Math.floor(Date.now() / 1000), // Issued at
        nbf: Math.floor(Date.now() / 1000), // Not before
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiration (1 heure)
        data: {
          user: {
            id: user.id, // L'ID utilisateur
            // Les champs ci-dessous sont utilisés par le code PHP
            email: user.email,
            display_name: user.name,
            role: user.role
          }
        }
      },
      JWT_SECRET
    );
*/
?>