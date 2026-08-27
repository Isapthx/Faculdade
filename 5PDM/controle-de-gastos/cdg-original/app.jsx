import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function App() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [gastos, setGastos] = useState([]);

  const adicionarGasto = () => {
    const numero = parseFloat(valor);

    if (!descricao || isNaN(numero)) {
      Alert.alert('Erro', 'Preencha uma descrição e um valor numérico válido.');
      return;
    }

    const novoGasto = {
      id: Date.now().toString(),
      descricao,
      valor: numero,
    };

    setGastos([...gastos, novoGasto]);
    setDescricao('');
    setValor('');
  };

  const removerGasto = (id) => {
    setGastos(gastos.filter(g => g.id !== id));
  };

  const total = gastos.reduce((soma, gasto) => soma + gasto.valor, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Controle de Gastos</Text>

      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />

      <Button title="Adicionar Gasto" onPress={adicionarGasto} />

      <Text style={styles.total}>Total Gasto: R$ {total.toFixed(2)}</Text>

      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gasto}>
            <Text>{item.descricao} - R$ {item.valor.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => removerGasto(item.id)}>
              <Text style={styles.remover}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>Nenhum gasto adicionado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  gasto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#eee',
    marginTop: 10,
    borderRadius: 5,
  },
  remover: {
    color: 'red',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
});