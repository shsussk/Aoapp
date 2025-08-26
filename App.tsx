import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';

const API_URL = 'https://ao-cnvf.onrender.com/api/ai'; // tu backend

export default function App() {
  const [texto, setTexto] = useState('');
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [modoGerente, setModoGerente] = useState(true); // Puedes controlar esto

  const sendMessage = async () => {
    if (!texto.trim()) return;

    const ticket = {
      id: Date.now().toString(),
      problema: texto,
      status: 'abierto',
      createdAt: new Date().toISOString()
    };

    setMensajes((prev) => [...prev, { tipo: 'usuario', texto }]);
    setTexto('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'Eres un asistente operativo experto en diagnóstico técnico.',
          ticket,
          provider: 'openai'
        })
      });

      const data = await res.json();
      const parsed = JSON.parse(data.reply);

      setMensajes((prev) => [
        ...prev,
        { tipo: 'respuesta', contenido: parsed, ticket }
      ]);
    } catch (e) {
      console.error(e);
      setMensajes((prev) => [
        ...prev,
        {
          tipo: 'respuesta',
          contenido: {
            advice: 'Error del servidor o API.',
            updatedPlanteamiento: '',
            decision: 'pendiente',
            bottlenecks: []
          }
        }
      ]);
    }
  };

  const escalarTicket = async (ticket) => {
    try {
      await fetch('https://ao-cnvf.onrender.com/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticket,
          status: 'investigacion',
          escaladoPor: 'gerente'
        })
      });
      alert('🔍 Ticket escalado a investigación.');
    } catch (e) {
      alert('Error al escalar ticket.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1120' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🌱 Asistente Operativo</Text>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {mensajes.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.tipo === 'usuario' ? styles.user : styles.bot
              ]}
            >
              {m.tipo === 'usuario' && <Text style={styles.userText}>{m.texto}</Text>}

              {m.tipo === 'respuesta' && (
                <View>
                  <Text style={styles.label}>✅ Recomendación:</Text>
                  <Text style={styles.section}>{m.contenido.advice}</Text>

                  <Text style={styles.label}>🧠 Planteamiento actualizado:</Text>
                  <Text style={styles.section}>
                    {m.contenido.updatedPlanteamiento}
                  </Text>

                  <Text style={styles.label}>📌 Decisión:</Text>
                  <Text style={styles.section}>{m.contenido.decision}</Text>

                  <Text style={styles.label}>🔍 Cuellos de botella:</Text>
                  {m.contenido.bottlenecks.map((b, i) => (
                    <Text key={i} style={styles.bullet}>• {b}</Text>
                  ))}

                  {modoGerente && (
                    <TouchableOpacity
                      style={styles.escalarBtn}
                      onPress={() => escalarTicket(m.ticket)}
                    >
                      <Text style={styles.escalarText}>🔺 Escalar a Investigación</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje…"
            placeholderTextColor="#999"
            value={texto}
            onChangeText={setTexto}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={styles.sendText}>ENVIAR</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomColor: '#1f2937',
    borderBottomWidth: 1
  },
  title: {
    color: '#93c5fd',
    fontSize: 20,
    fontWeight: 'bold'
  },
  bubble: {
    padding: 14,
    marginVertical: 8,
    borderRadius: 12
  },
  user: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0
  },
  bot: {
    backgroundColor: '#1f2937',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0
  },
  userText: {
    color: '#fff'
  },
  label: {
    color: '#22c55e',
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 10
  },
  section: {
    color: '#e5e7eb'
  },
  bullet: {
    marginLeft: 12,
    color: '#ddd'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#0f172a',
    borderTopColor: '#1e293b',
    borderTopWidth: 1
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16
  },
  sendBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  sendText: {
    color: '#22c55e',
    fontWeight: 'bold'
  },
  escalarBtn: {
    marginTop: 12,
    backgroundColor: '#facc15',
    padding: 8,
    borderRadius: 8
  },
  escalarText: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold'
  }
});

