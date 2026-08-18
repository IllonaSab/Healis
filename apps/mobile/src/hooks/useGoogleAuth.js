import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Ferme automatiquement le navigateur web intégré après la redirection d'authentification
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onSuccess) {
  // Initialise le hook Expo pour l'authentification Google avec les Client IDs propres à chaque plateforme
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '594475500467-s1ua3k4191il83u29g0i3vn7rr8t7scm.apps.googleusercontent.com',
    androidClientId: '594475500467-692kjh431ivrinhf4j6vfr25f245gfd1.apps.googleusercontent.com',
    webClientId: '594475500467-d5l7bvfod9vqfrhi5ggf5a9o44vall3v.apps.googleusercontent.com',
    // URL de redirection du proxy Expo Auth Session
    redirectUri: 'https://auth.expo.io/@illona/healis',
  });

  // Écoute le retour de la fenêtre d'authentification Google
  useEffect(() => {
    console.log('Google response:', JSON.stringify(response));

    // Si la connexion réussit, extrait l'accessToken et exécute le callback de succès
    if (response?.type === 'success') {
      const { authentication } = response;
      onSuccess?.(authentication.accessToken);
    }
  }, [response]);

  // Retourne la configuration de la requête et la fonction déclenchant l'ouverture du pop-up de connexion
  return { request, promptAsync };
}