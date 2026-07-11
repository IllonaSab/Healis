import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onSuccess) {
  const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: '594475500467-s1ua3k4191il83u29g0i3vn7rr8t7scm.apps.googleusercontent.com',
  webClientId: '594475500467-d5l7bvfod9vqfrhi5ggf5a9o44vall3v.apps.googleusercontent.com',
  redirectUri: AuthSession.makeRedirectUri({ scheme: 'healis' }),
});

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      onSuccess?.(authentication.accessToken);
    }
  }, [response]);

  return { request, promptAsync };
}
