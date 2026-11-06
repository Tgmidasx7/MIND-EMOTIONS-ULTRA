# Mind Emotions — Área da Família

Portal demonstrativo, responsivo e mobile-first para uma família acompanhar indicadores escolares e check-ins emocionais fictícios. A experiência mantém três perfis, dashboard familiar, perfis individuais, gráficos, diário/check-in de três perguntas, temas e conversas demonstrativas.

> **Demonstração, não serviço clínico ou escolar.** Os dados são exemplos locais mantidos em memória no navegador. Não há backend, autenticação, armazenamento persistente nem envio real de mensagens a professores. Os indicadores não constituem avaliação psicológica, diagnóstico ou aconselhamento. Não inserir informações pessoais reais.

## Executar localmente

Requer Node.js 20 ou superior e npm.

```bash
npm ci
npm run dev
```

O Vite informa o endereço local. Para validar uma versão de produção:

```bash
npm test
npm run build
npm run preview
```

## Estrutura

```text
src/
  components/  componentes visuais compartilhados
  data/        perfis e listas demonstrativas
  domain/      cálculos e regras do check-in, sem dependência de UI
  styles/      folhas CSS agrupadas pelo entry point index.css
  main.jsx     composição da aplicação React
 tests/        testes nativos do Node para regras de domínio
```

## Qualidade e contribuição

- `npm test`: testes automatizados de dados, métricas e check-in.
- `npm run format`: formata código e arquivos de configuração com Prettier.
- `npm run format:check`: verifica formatação.
- `npm run build`: compila a aplicação para produção.

Antes de propor alterações, rode os testes e o build. Preserve o caráter demonstrativo, os limites de privacidade acima e a acessibilidade/responsividade da interface. Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

## Publicação

O workflow de GitHub Actions em `.github/workflows/pages.yml` publica no GitHub Pages quando executado conforme a configuração do repositório. A última URL conhecida é [tgmidasx7.github.io/MIND-EMOTIONS-ULTRA](https://tgmidasx7.github.io/MIND-EMOTIONS-ULTRA/); a disponibilidade e o deploy após esta refatoração ainda precisam ser confirmados no GitHub Actions.
