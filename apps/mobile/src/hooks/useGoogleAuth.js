import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onSuccess) {
  const redirectUri = makeRedirectUri({
    scheme: 'healis',
    path: 'redirect',
  });

  console.log('redirectUri:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '594475500467-s1ua3k4191il83u29g0i3vn7rr8t7scm.apps.googleusercontent.com',
    webClientId: '594475500467-d5l7bvfod9vqfrhi5ggf5a9o44vall3v.apps.googleusercontent.com',
    redirectUri,
  });

  useEffect(() => {
    console.log('Google response:', JSON.stringify(response));
    if (response?.type === 'success') {
      const { authentication } = response;
      onSuccess?.(authentication.accessToken);
    }
  }, [response]);

  return { request, promptAsync };
}