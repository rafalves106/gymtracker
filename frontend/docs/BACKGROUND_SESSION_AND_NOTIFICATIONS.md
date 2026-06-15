# Melhorias: Background Session, Notificações e Vibração

## Resumo das Implementações

Três melhorias principais foram implementadas no GymTracker para melhorar a experiência de treino mesmo fora da aplicação:

### 1. **Notificações com Tempo Restante de Treino**

O app agora envia notificações inteligentes dependendo de onde o usuário está:

- **Fora do app completamente**: Notificação do sistema (push notification)
- **Dentro do app, mas fora da página de sessão**: Notificação visual interna
- **Dentro da página de sessão**: Feedback visual direto no timer

**Arquivo responsável**: `src/features/session/sessionNotifications.ts`

#### Como funciona:
```typescript
// Exemplo de notificação quando tempo de descanso acaba
notifyTimerEnded("Supino"); 
// → Se fora do app: push notification
// → Se em outra página: toast interno
// → Se na página: feedback já existe no UI
```

### 2. **Vibração do Dispositivo ao Fim do Treino**

Quando o tempo de descanso (rest) termina, o telefone/dispositivo vibra com padrão forte:
- Padrão: `[200ms, 100ms pausa, 200ms, 100ms pausa, 400ms]` = 5 pulsos

**Arquivo responsável**: `src/features/session/sessionNotifications.ts`

#### Como funciona:
```typescript
triggerDeviceVibration([200, 100, 200, 100, 400]); // padrão configurável
```

**Disponibilidade**: Funciona em navegadores mobile com suporte à Vibration API (maioria dos Android e alguns iOS).

### 3. **Contador/Timer Rodando em Background**

O timer de descanso persiste e continua rodando mesmo quando:
- Usuário sai do app
- Usuário navega para outra aba
- App é minimizado (em alguns navegadores)

**Arquivos responsáveis**:
- `src/features/session/sessionStorage.ts` - persistência em localStorage
- `public/sw.js` - Service Worker para gerenciar background
- `src/features/session/useRestTimer.ts` - integração com localStorage

#### Como funciona:

1. **Persistência Local**: Quando timer começa, estado é salvo em localStorage com timestamp
2. **Cálculo em Background**: Ao voltar, tempo decorrido é calculado: `tempo_restante - (agora - timestamp_início)`
3. **Service Worker**: Registrado em `main.tsx`, aguarda mensagens para gerenciar timer em background

---

## Estrutura de Novos Arquivos

```
frontend/
├── src/
│   ├── features/session/
│   │   ├── sessionStorage.ts        # Persistência de sessão e timer
│   │   ├── sessionNotifications.ts  # Gestão de notificações e vibração
│   │   ├── useBackgroundSession.ts  # Hook que integra tudo
│   │   ├── useRestTimer.ts          # Timer com persistência
│   │   └── ExerciseCard.tsx         # Atualizado para usar notificações
│   ├── pages/
│   │   └── SessionPage.tsx          # Atualizado para sincronizar com background
│   └── main.tsx                     # Registra Service Worker
└── public/
    └── sw.js                        # Service Worker para background timer
```

---

## Como Testar as Melhorias

### 1. **Testar Notificações**
```bash
# Na página de Treino (SessionPage):
1. Clique em "Iniciar" em um exercício
2. Saia do app / mude de aba
3. Termine o tempo de descanso
   → Verá notificação do sistema (se app está minimizado)
   → Verá notificação interna (se em outra página do app)
```

### 2. **Testar Vibração**
```bash
# Em um dispositivo mobile (Android/iOS):
1. Mude o dispositivo para modo vibração
2. Inicie um exercício e aguarde descanso terminar
3. Sinta 5 pulsos de vibração quando tempo acaba
```

### 3. **Testar Timer em Background**
```bash
# No browser (desktop ou mobile):
1. Inicie um exercício
2. Deixe o tempo em 10 segundos de descanso (por exemplo)
3. Minimize o app ou mude de aba
4. Aguarde 5 segundos
5. Volte ao app
   → Timer deve estar em ~5 segundos (não reiniciou do começo)
6. Aguarde mais 5 segundos
   → Timer termina e notifica/vibra
```

### 4. **Testar Persistência Entre Abas**
```bash
# Em 2 abas diferentes do GymTracker:
1. Na aba 1: Inicie um exercício com 20s de descanso
2. Na aba 2: Navegue para Treino
   → Vê sessão ativa em background (mensagem ou estado)
3. Na aba 1: Modifique estado (pause/continue)
4. Na aba 2: Estado sincroniza automaticamente (via localStorage events)
```

---

## Configurações e Customizações

### Padrão de Vibração
Editar em `src/features/session/useRestTimer.ts`:
```typescript
triggerDeviceVibration([200, 100, 200, 100, 400]); // customize aqui
```

### Frequência de Notificações de Tempo
Editar em `src/features/session/useBackgroundSession.ts`:
```typescript
// Notifica a cada 5 min se fora da página
if (!pageVisible && timeRemaining % 300 === 0 && timeRemaining > 0) {
  // Ajuste 300 para outro intervalo (em segundos)
}
```

### Mensagens de Notificação
Editar em `src/features/session/useBackgroundSession.ts`:
```typescript
sendNotification({
  title: "GymTracker",
  body: `Customize a mensagem aqui: ${exerciseName}`,
  tag: "timer-ended",
});
```

---

## Compatibilidade com Navegadores

| Feature | Desktop | Mobile |
|---------|---------|--------|
| localStorage | ✅ | ✅ |
| Notifications API | ✅ | ✅ |
| Vibration API | ❌ (não tem vibrador) | ✅ (Android/iOS) |
| Service Worker | ✅ | ✅ (parcial em iOS) |

---

## Notas Técnicas

1. **localStorage não é background**: Timer funciona quando app está aberto. Para verdadeiro background (sem abrir app), seria necessário Push Notifications (requer backend).

2. **Service Worker limitado**: Alguns navegadores (Safari iOS) têm suporte limitado. Timer será "pausado" se app é completamente fechado.

3. **Sincronização entre abas**: Usa `StorageEvent` para detectar mudanças de `localStorage` em outras abas. Falha se localStorage é desabilitado.

4. **Permissões**: Aplicação solicita permissão de notificação ao iniciar. Usuário pode negar (notificações não funcionam, mas timer continua).

---

## Próximos Passos (Futuros)

- [ ] Backend de Push Notifications para verdadeiro background
- [ ] Persistência em IndexedDB para dados maiores
- [ ] Webhook ao fim do timer para integração com API
- [ ] Customização de sons de notificação
- [ ] Histórico de sessões completo em localStorage
