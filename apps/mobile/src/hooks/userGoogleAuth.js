import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();
// Permet de finaliser proprement une session OAuth si elle était en cours


export function useGoogleAuth(onSuccess) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '594475500467-s1ua3k4191il83u29g0i3vn7rr8t7scm.apps.googleusercontent.com',
    webClientId: '594475500467-d5l7bvfod9vqfrhi5ggf5a9o44vall3v.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({ scheme: 'healis' }),
    // Configuration OAuth : client IDs + redirect URI personnalisée
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      onSuccess?.(authentication.accessToken);
      // Si Google renvoie un succès --> on transmet le token d’accès au parent
    }
  }, [response]);


  return { request, promptAsync };
  // request : état de la requête OAuth
  // promptAsync : ouvre la fenêtre de connexion Google
}
