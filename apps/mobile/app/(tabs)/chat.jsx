import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../src/theme/colors';
import { api } from '../../src/services/api';

import Button from '../../src/components/Button';
import Input from '../../src/components/Input';

const LOGO = require('../../assets/tabs/header-logo.png');

export default function Chat() {
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: 'Bonjour 🌱 Je suis toi, dans quelques années. Une version apaisée, qui a trouvé son chemin. Je suis là pour t\'écouter, sans jugement. Comment tu te sens aujourd\'hui ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        message: text,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur chat:', error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Je suis là, mais quelque chose m\'empêche de te répondre en ce moment. Réessaie dans un instant 🌿',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                msg.role === 'user' ? styles.bubbleWrapperUser : styles.bubbleWrapperAssistant,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant,
                  ]}
                >
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.bubbleWrapper, styles.bubbleWrapperAssistant]}>
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <Input
            value={input}
            onChangeText={setInput}
            placeholder="Écris ce que tu ressens..."
            maxLength={500}
            style={styles.chatInput}
          />
           <Button
            label="Envoyer"
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            variant="primary"
            size="sm"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    width: '100%',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    width: 285,
    height: 48,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  bubbleWrapper: {
    width: '100%',
    marginBottom: 4,
  },
  bubbleWrapperUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapperAssistant: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: colors.white,
    
  },
  bubbleTextAssistant: {
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  inputRow: {
  flexDirection: 'row',
    alignItems: 'flex-end',
  backgroundColor: colors.white,  // ← flex-end pour que le bouton reste en bas
  gap: spacing.sm,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  paddingBottom: 90,
  },
chatInput: {
  flex: 1,
  minHeight: 33,
  maxHeight: 120,
  paddingTop: 8,
  paddingBottom: 8,
},
});
