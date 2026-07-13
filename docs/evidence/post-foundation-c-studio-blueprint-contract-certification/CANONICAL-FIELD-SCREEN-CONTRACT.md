# CANONICAL FIELD & SCREEN CONTRACT

## Field contract

14 tipos canônicos: text · number · decimal · date · datetime · boolean · select ·
multiSelect · relation · computed · money · percentage · filePlaceholder · status.

Regras: type em allowlist · computed não executa código arbitrário · relation preserva
tenant · protected read-only por padrão · unsafe/duplicate/reserved bloqueado ·
tenant field não pode ser removido. Reutiliza o avaliador de field do hardening.

## Screen contract

Tipos: table · form · detail · dashboardPlaceholder · kanbanPlaceholder ·
calendarPlaceholder.

Regras: screen **não** gera React component · **não** registra rota · **não** altera
App.jsx · ações de mutação bloqueadas por padrão · empty/loading/error obrigatórios ·
diagnostics sanitizados · placeholders são planejados, não implementação.
