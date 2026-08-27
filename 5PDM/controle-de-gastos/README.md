# 💰 Controle de Gastos — Changelog (v1 → v2)

Relatório das mudanças entre a versão inicial do app e a versão final.

## 🆕 Funcionalidades adicionadas

### Persistência de dados
Uso do `AsyncStorage` para salvar a lista de gastos localmente, com carregamento automático ao abrir o app e salvamento automático a cada alteração. Na v1, a lista era perdida ao fechar o app.

### Categorias
- Adição de 6 categorias fixas (Alimentação, Transporte, Lazer, Saúde, Moradia, Outros), cada uma com emoji e cor.
- Seletor de categorias em chips horizontais no formulário.
- Resumo visual (badges) mostrando o total gasto por categoria, exibido apenas quando há gastos naquela categoria.

### Edição de gastos
Antes só era possível adicionar e remover. Agora dá pra tocar no ✏️ de um item, preencher o formulário com os dados existentes e salvar a edição (`editandoId` controla esse estado), com botão "Cancelar" para sair do modo edição.

### Busca
Campo de busca que filtra os gastos pela descrição (case-insensitive), só aparece quando já existe pelo menos um gasto.

### Data do gasto
Cada novo gasto grava `data: new Date().toISOString()`, exibida formatada (dia/mês) na listagem.

### Melhorias de UX
- `SafeAreaView` + `KeyboardAvoidingView` para lidar melhor com notch/status bar e teclado sobrepondo inputs.
- Card de destaque para o total gasto (fundo escuro, fonte grande).
- Teclado numérico mudou de `numeric` para `decimal-pad`, e aceita vírgula como separador decimal (`valor.replace(',', '.')`), comum no formato brasileiro.
- `onSubmitEditing` no campo de valor aciona o salvamento direto pelo teclado.
- Formatação de moeda com `toLocaleString('pt-BR', ...)` ao invés de `toFixed(2)` simples.
- Ícones (🗑️ e ✏️) no lugar de texto simples "Remover".

## 🐛 Correções de bugs / robustez

- **Validação de valor mais rígida**: agora rejeita não só `NaN`, mas também valores ≤ 0 (`numero <= 0`), evitando gastos com valor zero ou negativo.
- **Descrição com espaços em branco**: `descricao.trim()` evita salvar gastos com strings vazias disfarçadas de espaços.
- **IDs mais robustos**: trocou `Date.now().toString()` (que pode colidir se dois itens forem criados no mesmo milissegundo) por `${Date.now()}-${Math.random().toString(36).slice(2,8)}`.
- **Confirmação antes de remover**: na v1, o botão "Remover" excluía na hora, sem chance de desfazer. Na v2, existe uma função `confirmar()` que pede confirmação — com tratamento específico para Web (usa `window.confirm`, já que `Alert.alert` com múltiplos botões não funciona de forma confiável no `react-native-web`) e para nativo (usa `Alert.alert` com botões Cancelar/Remover).
- **Consistência ao remover em edição**: se o usuário remover o item que está sendo editado no momento, o formulário é limpo automaticamente (`if (editandoId === id) limparFormulario()`).

## ⚙️ Melhorias técnicas / arquitetura

- Uso de `useCallback` e `useMemo` para memoizar funções (`salvarGasto`, `iniciarEdicao`, `removerGasto`, `confirmar`) e valores derivados (`gastosFiltrados`, `totalPorCategoria`), reduzindo re-renderizações desnecessárias.
- Estado do formulário centralizado em uma função `limparFormulario()`, reaproveitada tanto após adicionar quanto após cancelar edição.
- Separação clara de responsabilidades: funções de formatação (`formatarMoeda`, `formatarData`) e helper `categoriaPorId` isoladas do componente principal.
- Trocou o componente `Button` (nativo, pouco estilizável) por `TouchableOpacity` estilizado — permite visual customizado (cores, cantos arredondados, sombra) consistente com o resto do app.

## 📊 Resumo em números

| Aspecto | v1 | v2 |
|---|---|---|
| Persistência | ❌ nenhuma | ✅ AsyncStorage |
| Categorias | ❌ | ✅ 6 categorias com resumo |
| Editar gasto | ❌ | ✅ |
| Buscar gasto | ❌ | ✅ |
| Confirmação ao remover | ❌ | ✅ (com fallback web) |
| Data do gasto | ❌ | ✅ |
| Validação de valor | só `isNaN` | `isNaN` + `> 0` + `trim()` |
| Otimização de renders | nenhuma | `useCallback` / `useMemo` |

---

Em resumo: a v1 era um CRUD simples de gastos em memória; a v2 evoluiu para um app funcional de verdade — com dados persistidos, organização por categoria, edição, busca e uma camada de UX bem mais cuidada.