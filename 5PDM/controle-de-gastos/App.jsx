import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@controle_gastos:lista';

const CATEGORIAS = [
  { id: 'alimentacao', nome: 'Alimentação', emoji: '🍔', cor: '#FF6B6B' },
  { id: 'transporte', nome: 'Transporte', emoji: '🚌', cor: '#4D96FF' },
  { id: 'lazer', nome: 'Lazer', emoji: '🎮', cor: '#9B59B6' },
  { id: 'saude', nome: 'Saúde', emoji: '💊', cor: '#2ECC71' },
  { id: 'moradia', nome: 'Moradia', emoji: '🏠', cor: '#F39C12' },
  { id: 'outros', nome: 'Outros', emoji: '📦', cor: '#7F8C8D' },
];

const categoriaPorId = (id) => CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[CATEGORIAS.length - 1];

export default function App() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(CATEGORIAS[0].id);
  const [gastos, setGastos] = useState([]);
  const [busca, setBusca] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Carrega os gastos salvos ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const salvos = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvos) setGastos(JSON.parse(salvos));
      } catch (e) {
        console.warn('Erro ao carregar gastos salvos:', e);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  // Salva sempre que a lista de gastos mudar
  useEffect(() => {
    if (carregando) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(gastos)).catch((e) =>
      console.warn('Erro ao salvar gastos:', e)
    );
  }, [gastos, carregando]);

  const limparFormulario = () => {
    setDescricao('');
    setValor('');
    setCategoriaSelecionada(CATEGORIAS[0].id);
    setEditandoId(null);
  };

  const salvarGasto = useCallback(() => {
    const valorNormalizado = valor.replace(',', '.');
    const numero = parseFloat(valorNormalizado);

    if (!descricao.trim() || isNaN(numero) || numero <= 0) {
      Alert.alert('Erro', 'Preencha uma descrição e um valor numérico maior que zero.');
      return;
    }

    if (editandoId) {
      setGastos((prev) =>
        prev.map((g) =>
          g.id === editandoId
            ? { ...g, descricao: descricao.trim(), valor: numero, categoria: categoriaSelecionada }
            : g
        )
      );
    } else {
      const novoGasto = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        descricao: descricao.trim(),
        valor: numero,
        categoria: categoriaSelecionada,
        data: new Date().toISOString(),
      };
      setGastos((prev) => [novoGasto, ...prev]);
    }

    limparFormulario();
  }, [descricao, valor, categoriaSelecionada, editandoId]);

  const iniciarEdicao = useCallback((gasto) => {
    setDescricao(gasto.descricao);
    setValor(gasto.valor.toString().replace('.', ','));
    setCategoriaSelecionada(gasto.categoria);
    setEditandoId(gasto.id);
  }, []);

  // Alert.alert com múltiplos botões não funciona de forma confiável no
  // react-native-web (o onPress dos botões costuma não disparar). Por isso,
  // no web usamos window.confirm, que é nativo do navegador; nas plataformas
  // nativas (iOS/Android) continuamos usando o Alert.alert normal.
  const confirmar = useCallback((mensagem) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(window.confirm(mensagem));
    }
    return new Promise((resolve) => {
      Alert.alert('Remover gasto', mensagem, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Remover', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });
  }, []);

  const removerGasto = useCallback(
    async (id, descricaoGasto) => {
      const confirmado = await confirmar(`Remover "${descricaoGasto}"?`);
      if (!confirmado) return;

      setGastos((prev) => prev.filter((g) => g.id !== id));
      if (editandoId === id) limparFormulario();
    },
    [editandoId, confirmar]
  );

  const gastosFiltrados = useMemo(() => {
    if (!busca.trim()) return gastos;
    const termo = busca.trim().toLowerCase();
    return gastos.filter((g) => g.descricao.toLowerCase().includes(termo));
  }, [gastos, busca]);

  const total = gastos.reduce((soma, gasto) => soma + gasto.valor, 0);

  const totalPorCategoria = useMemo(() => {
    const mapa = {};
    gastos.forEach((g) => {
      mapa[g.categoria] = (mapa[g.categoria] || 0) + g.valor;
    });
    return CATEGORIAS.map((c) => ({ ...c, total: mapa[c.id] || 0 })).filter((c) => c.total > 0);
  }, [gastos]);

  const formatarMoeda = (n) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatarData = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.titulo}>💰 Controle de Gastos</Text>

        {/* Card de total */}
        <View style={styles.cardTotal}>
          <Text style={styles.cardTotalLabel}>Total gasto</Text>
          <Text style={styles.cardTotalValor}>R$ {formatarMoeda(total)}</Text>
        </View>

        {/* Resumo por categoria */}
        {totalPorCategoria.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resumoScroll}>
            {totalPorCategoria.map((c) => (
              <View key={c.id} style={[styles.badgeResumo, { backgroundColor: c.cor + '22', borderColor: c.cor }]}>
                <Text style={styles.badgeResumoTexto}>{c.emoji} {c.nome}</Text>
                <Text style={[styles.badgeResumoValor, { color: c.cor }]}>R$ {formatarMoeda(c.total)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Formulário */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            placeholderTextColor="#999"
            value={descricao}
            onChangeText={setDescricao}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Valor (ex: 25,90)"
            placeholderTextColor="#999"
            value={valor}
            onChangeText={setValor}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={salvarGasto}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
            {CATEGORIAS.map((c) => {
              const selecionada = c.id === categoriaSelecionada;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategoriaSelecionada(c.id)}
                  style={[
                    styles.chipCategoria,
                    { borderColor: c.cor },
                    selecionada && { backgroundColor: c.cor },
                  ]}
                >
                  <Text style={[styles.chipCategoriaTexto, selecionada && styles.chipCategoriaTextoSelecionado]}>
                    {c.emoji} {c.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.botoesForm}>
            <TouchableOpacity style={styles.botaoPrimario} onPress={salvarGasto}>
              <Text style={styles.botaoPrimarioTexto}>
                {editandoId ? '✓ Salvar edição' : '+ Adicionar Gasto'}
              </Text>
            </TouchableOpacity>
            {editandoId && (
              <TouchableOpacity style={styles.botaoSecundario} onPress={limparFormulario}>
                <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Busca */}
        {gastos.length > 0 && (
          <TextInput
            style={styles.inputBusca}
            placeholder="🔍 Buscar gasto..."
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
          />
        )}

        {/* Lista */}
        <FlatList
          data={gastosFiltrados}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={gastosFiltrados.length === 0 && styles.listaVazia}
          renderItem={({ item }) => {
            const cat = categoriaPorId(item.categoria);
            return (
              <View style={[styles.gasto, { borderLeftColor: cat.cor }]}>
                <View style={styles.gastoInfo}>
                  <Text style={styles.gastoDescricao} numberOfLines={1}>
                    {cat.emoji} {item.descricao}
                  </Text>
                  <Text style={styles.gastoMeta}>
                    {cat.nome} · {item.data ? formatarData(item.data) : ''}
                  </Text>
                </View>
                <Text style={styles.gastoValor}>R$ {formatarMoeda(item.valor)}</Text>
                <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.botaoIcone}>
                  <Text style={styles.editarTexto}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removerGasto(item.id, item.descricao)} style={styles.botaoIcone}>
                  <Text style={styles.remover}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.vazioTexto}>
              {gastos.length === 0 ? 'Nenhum gasto adicionado ainda.' : 'Nenhum resultado para essa busca.'}
            </Text>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#2D3436' },

  cardTotal: {
    backgroundColor: '#2D3436',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
  },
  cardTotalLabel: { color: '#B2BEC3', fontSize: 13, marginBottom: 4 },
  cardTotalValor: { color: '#fff', fontSize: 28, fontWeight: '700' },

  resumoScroll: { marginBottom: 12 },
  badgeResumo: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    minWidth: 100,
  },
  badgeResumoTexto: { fontSize: 12, color: '#2D3436', marginBottom: 2 },
  badgeResumoValor: { fontSize: 13, fontWeight: '700' },

  form: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FAFBFC',
    color: '#2D3436',
  },
  categoriasScroll: { marginBottom: 12 },
  chipCategoria: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  chipCategoriaTexto: { fontSize: 13, color: '#2D3436', fontWeight: '600' },
  chipCategoriaTextoSelecionado: { color: '#fff' },

  botoesForm: { flexDirection: 'row', gap: 10 },
  botaoPrimario: {
    flex: 1,
    backgroundColor: '#0984E3',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  botaoSecundario: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  botaoSecundarioTexto: { color: '#636E72', fontWeight: '600' },

  inputBusca: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#2D3436',
  },

  gasto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  gastoInfo: { flex: 1, marginRight: 8 },
  gastoDescricao: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  gastoMeta: { fontSize: 12, color: '#B2BEC3', marginTop: 2 },
  gastoValor: { fontWeight: '700', color: '#2D3436', marginRight: 8 },
  botaoIcone: { paddingHorizontal: 4 },
  editarTexto: { fontSize: 16 },
  remover: { fontSize: 16 },

  listaVazia: { flexGrow: 1, justifyContent: 'center' },
  vazioTexto: { textAlign: 'center', color: '#B2BEC3', marginTop: 10 },
});